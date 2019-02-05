const express = require('express');
const mysql = require('mysql');
const mysqlConexion = require('../conexion/conexionBd');


/*
	Este js se encargara de insertar todas las peticiones
	que le lleguen de los mensajes de MQTT
*/


module.exports = {
	 subirData:function (sensor, dataJson) {
		console.log("-subirData "+ sensor + " "+ dataJson);
		let dateTimeJ = dataJson.ano + "-" + dataJson.mes + "-" + dataJson.dia + " " + dataJson.hora + ":" + dataJson.minutos + ":" + dataJson.segundos;
		console.log(dateTimeJ);
        let data = {
            descripcion: sensor,
			valor: dataJson.valor,
			fecha: dateTimeJ
        };

		mysqlConexion.query('Insert into sensores SET ? ', data, (err, rows, fields) => {
			if(err)
			{
				console.log(err);
			}
			else
			{
				console.log("Se inserto correctamente a la base de datos");
			}
			
		});
	
	 }	
}
