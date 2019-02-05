var mysql = require('mysql');

//configuracion de la conexion a la BD
var conexion = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'olimpiadasCaba',
  dateStrings : true  //ver los dateTime correctamente
});

//conectar a la BD
conexion.connect((err)=>{
  if (err) console.log("Error: " + err.stack);
  else console.log("Conectado a la BD");
});

conexion.query('SELECT * FROM boyas_has_competidores', (error, results) => {
  if (error) throw error;
  else{
    // console.log(results.length);
    for(var i = 0 ; i < results.length ; i++){
      console.log(results[i].FechaHora);
    }
    // console.log(results[0]);
    // console.log(results);
  }
});

