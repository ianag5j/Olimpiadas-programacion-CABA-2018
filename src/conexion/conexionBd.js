const mysql = require('mysql');


/*
	Esta conexion, es unicamente para los mensajes de MQTT
*/
const mysqlConexion = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'invernadero'
});


mysqlConexion.connect(function (err){
	if(err){
		console.log(err);
	}
	else{
		console.log('Se conecto la base de datos');
	}
});


//Se exporta el modulo, para poder usar la conexion en otra parte del codigo
module.exports = mysqlConexion;