var method = Auxiliares.prototype;
var _ = require("underscore");

function Auxiliares() { }

method.DateParse_dd_mm_yyyy = function(date) {
   var tdate = new Date(date);
   var dd = tdate.getDate(); //yields day
   var MM = tdate.getMonth(); //yields month
   var yyyy = tdate.getFullYear(); //yields year
   //var hhhh = tdate.getHours();
   //var mmmm = tdate.getMinutes();
   var xxx = dd + "-" +( MM+1) + "-" + yyyy;// + " " + hhhh + ":" + mmmm;

   return xxx;
};

method.DateParse_yyyy_mm_dd = function(date) {
   var tdate = new Date(date);
   var dd = tdate.getDate(); //yields day
   var MM = tdate.getMonth(); //yields month
   var yyyy = tdate.getFullYear(); //yields year
   
   
   var sepMonth ="-";
   var sepDays = "-";
   if (dd <10)
   		sepDays = "-0";
   if (MM+1 <10)
   		sepMonth = "-0";

   var xxx = yyyy + sepMonth + ( MM+1) + sepDays + dd;

	

   return xxx;
};

method.DateParse_dd_mm_yyyy_hh_mm = function(date) {
  var tdate = new Date(date);
   var dd = tdate.getDate(); //yields day
   var MM = tdate.getMonth(); //yields month
   var yyyy = tdate.getFullYear(); //yields year
   var hhhh = tdate.getHours();
   var mmmm = tdate.getMinutes();
   var xxx = dd + "-" +( MM+1) + "-" + yyyy + " " + hhhh + ":" + mmmm;

   return xxx;
  
};

method.DateParse_hh_mm = function(date) {
  var tdate = new Date(date);
   var dd = tdate.getDate(); //yields day
   var MM = tdate.getMonth(); //yields month
   var yyyy = tdate.getFullYear(); //yields year
   var hhhh = tdate.getHours();
   var mmmm = tdate.getMinutes();
   var xxx = hhhh + ":" + mmmm;

   return xxx;
  
};


method.ObtenerIpCliente = function(req) {
  var ipAddress = null;
  var forwardedIpsStr = req.headers['x-forwarded-for'];
  if (forwardedIpsStr) {
    ipAddress = forwardedIpsStr[0];
  }
  if (!ipAddress) {
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
};

method.toBoolean = function(valor)
{
	if (_.isBoolean(valor)) {
		return valor;
	}
	
	if (valor == "true" || valor == "True" || valor == "TRUE") { 
		return true;
	}
	else
	{
		return false;
	}

}

module.exports = Auxiliares;