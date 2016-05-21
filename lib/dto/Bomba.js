var method = Bomba.prototype;

var objBomba;

function Bomba() 
{
 objBomba = new Object({
    Id : Number
  , Pin : String
  , TimeStamp      : { type: Date, default: Date.now }
  , Valor  : Number
  , Encendida : Boolean
  , TiempoEncendida : Number //minutos
  , TiempoInicial : { type: Date, default: Date.now}
  , Proposito : String
  , Ocupado : Boolean
});
}


method.Crear = function(id, Pin, TiempoEncendida, TiempoInicial,Valor)
{
  
  objBomba.Id = id;
  objBomba.Pin = Pin;
  objBomba.TiempoEncendida = TiempoEncendida;
  objBomba.TiempoInicial = TiempoInicial;
  objBomba.Valor = Valor;
  objBomba.Encendida = Valor > 0 ? true : false;
  objBomba.Proposito = "";
  objBomba.Ocupado = true;
};

method.Objeto = function()
{
  return objBomba;
};

method.Modificar = function(id, TiempoEncendida, TiempoInicial, Valor, Proposito, Ocupado)
{
  objBomba.Id = id;
  objBomba.TiempoEncendida = TiempoEncendida;
  objBomba.Valor = Valor;
  objBomba.Encendida = Valor > 0 ? true : false;
  objBomba.Proposito = Proposito;
  objBomba.TiempoInicial = TiempoInicial;
  objBomba.Ocupado = Ocupado;
  objBomba.TiempoEncendida = TiempoEncendida;
};

module.exports = Bomba;


