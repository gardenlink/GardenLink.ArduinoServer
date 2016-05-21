var method = TipoActuador.prototype;


	
var objTipoActuador;


function TipoActuador() 
{
	objTipoActuador =  new Object({
	    IdTipoActuador              : Number
	  , Descripcion		   			: String 
	});
}


method.Crear = function(IdTipoActuador,Descripcion)
{
	objTipoActuador.IdTipoActuador = parseInt(IdTipoActuador);
	objTipoActuador.Descripcion = Descripcion;
};

method.Objeto = function()
{
  return objTipoActuador;
};


method.Validar = function(obj)
{
  if (!obj.IdTipoActuador)
  {
    console.log("dto.TipoActuador : La property IdTipoActuador no puede ser null");
    return false;
  }
  return true;

}


module.exports = TipoActuador;


