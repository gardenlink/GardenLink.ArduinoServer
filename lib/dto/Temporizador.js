var method = Temporizador.prototype;

var objTemporizador;

var Auxiliares = require('../util/Auxiliares.js');
var hp = new Auxiliares();


function Temporizador() 
{
	 objTemporizador = new Object({
	    	IdTemporizador : Number
          , IdDispositivo : String
          , IdTipoActuador : Number
          , IdActuador      : Number
          , Descripcion : String
		  , DuracionMinutos : Number
		  , NumeroDias : Number
		  , HorasActivacion : String
		  , Habilitado : Boolean
	});
}


method.Crear = function(IdTemporizador,IdDispositivo, IdTipoActuador, IdActuador, Descripcion,DuracionMinutos,NumeroDias, HorasActivacion, Habilitado)
{
  
  objTemporizador.IdTemporizador = parseInt(IdTemporizador);
  objTemporizador.IdDispositivo = IdDispositivo;
  objTemporizador.IdTipoActuador = parseInt(IdTipoActuador);
  objTemporizador.IdActuador = parseInt(IdActuador);
  objTemporizador.Descripcion = Descripcion;
  objTemporizador.DuracionMinutos = DuracionMinutos;
  objTemporizador.NumeroDias = NumeroDias;
  objTemporizador.HorasActivacion = HorasActivacion;
  objTemporizador.Habilitado = hp.toBoolean(Habilitado);
};

method.Objeto = function()
{
  return objTemporizador;
};

method.Modificar = function(IdTemporizador,IdDispositivo, IdTipoActuador, IdActuador, Descripcion,DuracionMinutos,NumeroDias,HorasActivacion,Habilitado)
{
  //objTemporizador.IdTemporizador = IdTemporizador;
  objTemporizador.IdDispositivo = IdDispositivo;
  objTemporizador.IdTipoActuador = IdTipoActuador;
  objTemporizador.IdActuador = IdActuador;
  objTemporizador.Descripcion = Descripcion;
  objTemporizador.DuracionMinutos = DuracionMinutos;
  objTemporizador.NumeroDias = NumeroDias;
  objTemporizador.HorasActivacion = HorasActivacion;
  objTemporizador.Habilitado = hp.toBoolean(Habilitado);
};

method.Validar = function(obj)
{
  if (!obj.IdTemporizador)
  {
  	var _str = "dto.Temporizador : La property IdTemporizador no puede ser null";
  	
    console.log(_str);
    throw new Error(_str);
  }
  return true;

}

module.exports = Temporizador;


