var method = Medicion.prototype;

var objMedicion;

var tipoActuador = {
	  SENSOR : "1",
	  RELAY :  "2",
	  MOTOR :  "3",
	  BOMBA :  "4"
	};

function Medicion() 
{
 objMedicion = new Object({
    Id             : Number
  , IdTipoActuador : Number
  , IdActuador	   : Number
  , IdDispositivo  : String
  , TimeStamp      : { type: Date, default: Date.now }
  , Valor          : Number
});
}


method.Crear = function(id,idTipoActuador, idActuador, idDispositivo, TimeStamp, Valor)
{
  objMedicion.Id = id;
  objMedicion.IdTipoActuador = idTipoActuador;
  objMedicion.IdActuador = idActuador;
  objMedicion.IdDispositivo = idDispositivo;
  objMedicion.TimeStamp = TimeStamp;
  objMedicion.Valor = Valor;
  
};

method.Objeto = function()
{
  return objMedicion;
};

method.TipoActuador = function()
{
	return tipoActuador;
}

method.GetTipoActuadorByName = function(tipo)
{
	return tipoActuador[tipo];
}

method.Validar = function(obj)
{
  var strError;
  
  if (!obj.IdActuador)
  {
  	strError = "dto.Medicion : La property IdActuador no puede ser null";
  	console.log(strError);
  	return false;
  }
  
  if (!obj.IdTipoActuador)
  {
  	strError = "dto.Medicion : La property IdTipoActuador no puede ser null";
    console.log(strError);
    return false;
  }
  
  return true;
}


module.exports = Medicion;


