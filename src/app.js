const express = require('express'),
      path = require('path'),
      morgan = require('morgan'),
      mysql = require('mysql'),
      myConnection = require('express-myconnection'),
      mqtt = require('mqtt'),
      socketIo = require('socket.io');


const app = express();
const client = mqtt.connect('mqtt:// 192.168.43.175:1883');


// Importando routes/rutas
const sensorRoutes = require('./routes/sensor');
const sensorBd = require("./controllers/sensorBd");

// Configuracion
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middlewares
app.use(morgan('dev'));
app.use(myConnection(mysql, {
  host: 'localhost',
  user: 'root',
  password: '',
  port: 3306,
  database: 'invernadero'
}, 'single'));



app.use(express.urlencoded({extended: false}));
// Routes/Rutas
app.use('/', sensorRoutes);

// Archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

// Iniciando el servidor
const server = app.listen(app.get('port'), () => {
  console.log(`Servidor en el puerto ${app.get('port')}`);
});

const io = socketIo(server);


////////////////////            MQTT            //////////////////////////

//Cuando el server se conecta al broker mosquitto
client.on('connect', () => {  
  console.log("Servidor conectado a MQTT");
  //el server se subscribe al topic /sensor1 para poder ver los datos publicados por el sensor
  client.subscribe('/sensor1', function (err) {
  if (!err) {
    console.log("Subscrito a sensor1");
  }
  });

  client.subscribe('/getDateTime', function (err) {
    if (!err) {
      console.log("suscrito a getDateTime");
    }
  });
  


});

//Cuando se recibe un mensaje de uno de los topics que el server esta subscrito
client.on('message', function (topic, message, packet) { 
  message = message.toString();
  topic = topic.toString();

  console.log("topic: "+ topic + " message: " + message);

  /*
    cuando recibe el topic "getDateTime" con el mensaje "getDateTimeArduino" devuelve el 
    dateTime a arduino (solo la primare vez cuando arduino se conecta al topic)
  */
  if (topic == "/getDateTime" && message == "getDateTimeArduino"){
    console.log("Dar dateTime");
    client.publish('/dateTime', setDateTimeArduino());
  }

  if (topic == "/sensor1"){
    //Convierte de String a Json
    //{'valor': 1, 'ano': 2018, 'mes': 11, 'dia': 1, 'hora': 11, 'minutos': 2, 'segundos': 33 }
    var dataJson = JSON.parse(message);
    console.log(dataJson.ano);

    let sensor = topic.replace("/", "");

    sensorBd.subirData(sensor, dataJson);
    console.log(parseInt(dataJson.valor));
    
    io.sockets.emit('chart_data', {
      x: new Date().getTime(),
      y: parseInt(dataJson.valor)
    });

  }

  
});



//devuelve la fecha y hora de la maquina del server
function setDateTimeArduino() {
  var d = new Date();
  
  var ano = d.getFullYear();
  var mes = d.getMonth() + 1;
  var dia = d.getDate();

  var hora = d.getHours();
  var minutos = d.getMinutes();
  var segundos = d.getSeconds();
  
  var dateTime = {"ano": ano, "mes": mes, "dia": dia, "hora":hora, "minutos": minutos, "segundos": segundos};
  //console.log(JSON.stringify(dateTime));
  return JSON.stringify(dateTime);
}


////////////////////          SOCKET            ///////////////////////

io.sockets.on('connection', function (socket) {
  console.log('usuario Conectado');
  //cuando se desconecta
  socket.on('disconnect', function () {
      console.log('usuario desconectado');
  });

 
  var initData = (function () {
      var data = [], i = 0, time = new Date().getTime() - 2000 * 10;

      for (i = 0; i < 10; i++) {
        data.push({
          x: time + i * 2000,
          y: 0
        });
      }
      return data;
  })();

  socket.emit('chart_data_init', {
    data: initData
  });

});

app.get('*', (req, res)=>{	//req = Obj peticion del navegador, res = Obj respuesta del servidor
	//finaliza la respuesta con un mensaje
	res.end('q rompiste, esta ruta no existe');
});
