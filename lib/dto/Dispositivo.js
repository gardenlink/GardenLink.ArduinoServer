var method = Dispositivo.prototype;

var objDispositivo;

var Auxiliares = require('../util/Auxiliares.js');
var hp = new Auxiliares();

function Dispositivo() 
{
	 objDispositivo = new Object({
	    Id : String
	  , Nombre : String
	  , Tipo  : String
	  , Ip : String
	  , Puerto : Number
	  , Habilitado : Boolean
	  , Estado : Boolean
	  , FrecuenciaMuestreo : Number
	  , Servicio : Object
	});
}


method.Crear = function(id, Nombre, Tipo, Ip,Puerto,Habilitado,Estado,FrecuenciaMuestreo)
{
  objDispositivo.Id = id;
  objDispositivo.Nombre = Nombre;
  objDispositivo.Tipo = Tipo;
  objDispositivo.Ip = Ip;
  objDispositivo.Puerto = Puerto;
  objDispositivo.Habilitado =  hp.toBoolean(Habilitado);
  objDispositivo.Estado = hp.toBoolean(Estado);
  objDispositivo.FrecuenciaMuestreo = parseInt(FrecuenciaMuestreo);
};

method.AddServicio = function(servicio)
{
	objDispositivo.Servicio = servicio;
};

method.Validar = function(objDispositivo)
{
  if (!objDispositivo.Id)
  {
    console.log("dto.Dispositivo : La property ID no puede ser null");
    return false;
  }
  return true;

}

method.Objeto = function()
{
  return objDispositivo;
};



module.exports = Dispositivo;


