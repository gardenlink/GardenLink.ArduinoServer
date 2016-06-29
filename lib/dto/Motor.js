var method = Motor.prototype;

var Auxiliares = require('../util/Auxiliares.js');
var hp = new Auxiliares();

var objMotor;


function Motor() 
{
	 objMotor = new Object({
	   IdMotor : Number
	  , IdDispositivo : String
	  , Descripcion : String
	  , MarcaModelo : String
	  , Tipo : String
	  , Pin : Number
	  , EsPinAnalogo : Boolean
	  , Habilitado : Boolean
	  , Posicion : Number
	  , DescripcionPosicion : String
	  , Accion : String
	  , Estado : Number
	});
}


method.Crear = function(IdMotor,IdDispositivo, Descripcion, MarcaModelo, Tipo,Pin,EsPinAnalogo, Habilitado, Posicion, Accion, Estado)
{
  
  objMotor.IdMotor = parseInt(IdMotor);
  objMotor.IdDispositivo = IdDispositivo;
  objMotor.Descripcion = Descripcion;
  objMotor.MarcaModelo = MarcaModelo;
  objMotor.Tipo = Tipo;
  objMotor.Pin = parseInt(Pin);
  objMotor.EsPinAnalogo = hp.toBoolean(EsPinAnalogo);
  objMotor.Habilitado = hp.toBoolean(Habilitado);
  objMotor.Posicion = parseInt(Posicion);
  objMotor.DescripcionPosicion = ObtenerDescripcionPosicion(parseInt(Posicion));
  objMotor.Accion = Accion;
  objMotor.Estado = Estado;
};

method.Objeto = function()
{
  return objMotor;
};


method.Modificar = function(IdMotor,IdDispositivo, Descripcion, MarcaModelo, Tipo,Pin,EsPinAnalogo, Habilitado, Posicion, Accion, Estado)
{
  //objMotor.IdMotor = IdMotor;
  objMotor.IdDispositivo = IdDispositivo;
  objMotor.Descripcion = Descripcion;
  objMotor.MarcaModelo = MarcaModelo;
  objMotor.Tipo = Tipo;
  objMotor.Pin = Pin;
  objMotor.EsPinAnalogo = EsPinAnalogo;
  objMotor.Habilitado = Habilitado;
  objMotor.Posicion = Posicion;
  objMotor.DescripcionPosicion = ObtenerDescripcionPosicion(Posicion);
  objMotor.Accion = Accion;
  objMotor.Estado = Estado;
};

method.Validar = function(obj)
{
  
  
  if (!obj.IdMotor)
	  {
	  	var str = "dto.Motor : La property IdMotor no puede ser null";
	  	
	    console.log(str);
	    return false;
	  }
  
  return true;

}


function ObtenerDescripcionPosicion(Posicion) {
	var pos;
	switch (Posicion)
	{
		case 0: 
			pos = "0%";
			break;
			
		case 1:
			pos = "25%";
			break;
			
		case 2: 
			pos =  "50%";
			break;
			
		case 3:
			pos = "75%";
			break;
			
		case 4:
			pos = "100%";
			break;
			
		default:
			pos = "0%";
			break;
	}
	
	return pos;

}

module.exports = Motor;


