var method = Arduino.prototype;

var cmd_restart = "QREX";
var cmd_network_reset = "QNRX";
var caracterEscape = 'X';


var Dispositivos = {
	Sensor : "S",
	Relay : "R",
	Motor : "M"
};



var Operaciones = {
	Sensor : {
		Temperatura : "T",
		Humedad : "H",
		PH : "P",
		EC : "E",
		Lluvia : "L",
		HumedadTierra : "S"
	},
	Relay : {
		Encender : "E",
		Apagar : "A",
		Consultar : "C"
	},
	Motor : {
		Avanzar : "A",
		Retroceder : "R",
		Detener : "D",
		Estado : "E",
		Posicion : "P"
	}
};

function Arduino()
{
};



method.Operaciones = function(tipo) {
	var ret = null;
	switch (tipo) {
	
		case 1:
			ret = Operaciones.Sensor;
			break;
			
		case 2:
			ret = Operaciones.Relay;
			break;
			
		case 3:
			ret = Operaciones.Motor;
			break;
	}
	
	return ret;
};



method.Dispositivos = function(tipo) {
	
	var ret = null;
	switch (tipo) {
	
		case 1:
			ret = Dispositivos.Sensor;
			break;
			
		case 2:
			ret = Dispositivos.Relay;
			break;
			
		case 3:
			ret = Dispositivos.Motor;
			break;
	}
	
	return ret;
}; 

module.exports = Arduino;