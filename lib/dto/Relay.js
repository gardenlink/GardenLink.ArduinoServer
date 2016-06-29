var method = Relay.prototype;

var Auxiliares = require('../util/Auxiliares.js');
var hp = new Auxiliares();

var objRelay;


function Relay() 
{
	 objRelay = new Object({
	   IdRelay : Number
	  , IdDispositivo : String
	  , Descripcion : String
	  , MarcaModelo : String
	  , Tipo : String
	  , Pin : Number
	  , EsPinAnalogo : Boolean
	  , Habilitado : Boolean
	  , Activo : Boolean
	  , EsInverso : Boolean
	});
}


method.Crear = function(IdRelay,IdDispositivo, Descripcion, MarcaModelo, Tipo,Pin,EsPinAnalogo, Habilitado, Activo, EsInverso)
{
  
  objRelay.IdRelay = parseInt(IdRelay);
  objRelay.IdDispositivo = IdDispositivo;
  objRelay.Descripcion = Descripcion;
  objRelay.MarcaModelo = MarcaModelo;
  objRelay.Tipo = Tipo;
  objRelay.Pin = Pin;
  objRelay.EsPinAnalogo = hp.toBoolean(EsPinAnalogo);
  objRelay.Habilitado = hp.toBoolean(Habilitado);
  objRelay.Activo = hp.toBoolean(Activo);
  objRelay.EsInverso = hp.toBoolean(EsInverso);
};

method.Objeto = function()
{
  return objRelay;
};

method.Modificar = function(IdRelay,IdDispositivo, Descripcion, MarcaModelo, Tipo,Pin,EsPinAnalogo,Habilitado,Activo,EsInverso)
{
  objRelay.IdRelay = IdRelay;
  objRelay.IdDispositivo = IdDispositivo;
  objRelay.Descripcion = Descripcion;
  objRelay.MarcaModelo = MarcaModelo;
  objRelay.Tipo = Tipo;
  objRelay.Pin = Pin;
  objRelay.EsPinAnalogo = hp.toBoolean(EsPinAnalogo);
  objRelay.Habilitado = hp.toBoolean(Habilitado);
  objRelay.Activo = hp.toBoolean(Activo);
  objRelay.EsInverso = hp.toBoolean(EsInverso);
};

method.Validar = function(obj)
{
  
  
  if (!obj.IdRelay)
	  {
	  	var str = "dto.Relay : La property IdRelay no puede ser null";
	  	
	    console.log(str);
	    return false;
	  }
  
  return true;

}

module.exports = Relay;


