var method = Estado.prototype;

var Auxiliares = require('../util/Auxiliares.js');
var hp = new Auxiliares();
var objEstado;


function Estado() 
{
	 objEstado = new Object({
	   Estado		   : Boolean
	});
}

method.AddEstado = function(estado)
{
	objEstado.Estado = hp.toBoolean(estado);
};

method.Objeto = function()
{
  return objEstado;
};



module.exports = Estado;