/*
 * Temporizador
 * https://github.com/Botanicbot/App/Temporizador.js
 * 
 * 2015 Diego Navarro M
 *
 */


var method = Temporizador.prototype;
var later = require('later'); // gestion de tareas
var async = require("async");
var Arduino = require("./Arduino");
var _arduino = new Arduino(); 
var _logger;
var _programacion = [];
var _tcpGuests = [];
var temporizadores;
var _dataProvider;

//Variables para manejo de colecciones locales
var lstDevices = [];
var lstMotores = [];
var lstRelays = [];
var lstSensors = [];

//Variables para manejo de colecciones de clase
var dispositivos = [];
var sensores = [];
var relays = [];
var motores = [];

var ModelsDispositivo = require("../dto/Dispositivo.js");
var ModelsRelay = require("../dto/Relay.js");
var ModelsSensor = require("../dto/Sensor.js");
var ModelsMotor = require("../dto/Motor.js");

var _DEBUG = true;

/*
 * Temporizador
 * @constructor
 *
 * @description Inicializa y Configura el programador
 * @apiParam {Number} horarios durante un dia determinado
 * @apiParam {Number} duracion cantidad minutos que durará la tarea
 * @apiParam {Number} numeroDias cantidad de dias que se programará la tarea.
 *
 */
 
 
 
function Temporizador(config, logger, dataProvider, tcpGuests, callback) {
   
	 this._logger = logger;
	 this._dataProvider = dataProvider;
	 this._tcpGuests = tcpGuests;
	 
	 later.date.localTime();
	 
	TraerDatos(dataProvider, function(error, respuesta) {
		if (error) return callback(error, null);
		console.log("Temporizador.Constructor : Finaliza Inicializacion de datos de MotorService");
	
		//Inicio configuracion de Temporizadores
		if (_DEBUG) {
			console.log("RESULTADOS INICIALIZACION ******* ");
			console.dir(respuesta);
		}
		
		//dataProvider.TipoActuador().Find({Descripcion : "SENSOR"}, function (err, data){
		dataProvider.TipoActuador().GetAll( function (err, data){
	   			var filter = {};
	   			
		   		if (data)
		   		{
		   			async.each(data, function(item , cb) {
	   		
	   					filter.IdTipoActuador = item.IdTipoActuador;
	   					if (_DEBUG)
	   						console.log("Temporizador.Constructor: Configurando temporizadores para <" +item.Descripcion + ">");
				   		
				   		dataProvider.Temporizador().GetCollection(filter, function(err, result) {
				   		temporizadores = result;
				   		
						   var numTemporizadores =  Object.keys(temporizadores).length;
						   var numDeshabilitados = 0;
						   if (_DEBUG)
						   	console.log("Temporizador.Constructor: Numero de dispositivos <" +item.Descripcion + "> configurados: " +numTemporizadores);
						
						   this._programacion = [];
						   for (var temp in temporizadores)
						   {
						     
						      if (temporizadores[temp].Habilitado == "true" || temporizadores[temp].Habilitado == true) {
						      
						        var dispositivo = BuscarDispositivo(temporizadores[temp].IdDispositivo, dispositivos);
						        
						        
						        if (item.IdTipoActuador == 1)
						        {
						        	var actuador = BuscarActuador(temporizadores[temp].actuador, sensores);
						        	
						        }
						        if (item.IdTipoActuador == 2) {
						        	var actuador = BuscarActuador(temporizadores[temp].actuador, relays);
						        	
						        }
						        if (item.IdTipoActuador == 3) {
						        	var actuador = BuscarActuador(temporizadores[temp].actuador, motores);
						        	
						        } 
						        
						        if (dispositivo && actuador)
						        {
						
						            temporizadores[temp]["dispositivo"] = dispositivo;
						            temporizadores[temp]["actuador"] = actuador;
						            
						            if (_DEBUG) {
							        	console.log("TEMPORIZADORES[TEMP] *************");
							        	console.dir(temporizadores[temp]);
					        		}
						
						            console.log("********Configurando Temporizador <"+ temp +"> <" + temporizadores[temp].Descripcion + "> *********"); 
						            console.log("Dispositivo asociado 		 : " + temporizadores[temp].dispositivo.Id);
						            console.log("Actuador asociado    		 : " + temporizadores[temp].IdActuador + "<" + item.Descripcion + "> <" + temporizadores[temp].actuador.Tipo +">");
						            console.log("Habilitado           		 : " + temporizadores[temp].Habilitado);
						            console.log("Duracion encendido minutos  	: " + temporizadores[temp].DuracionMinutos);
						            console.log("Numero ciclos(dias)  		 : " + temporizadores[temp].NumeroDias);
						            console.log("Horas Activacion     		 : " + temporizadores[temp].HorasActivacion);
						
						            var horarios = temporizadores[temp].HorasActivacion.split(";");
						
						            temporizadores[temp]["configEncendido"] = {schedules: [
						            {h: [parseInt(horarios[0].split(":")[0])], m: [parseInt(horarios[0].split(":")[1])]},
						            {h: [parseInt(horarios[1].split(":")[0])], m: [parseInt(horarios[1].split(":")[1])]},
						            {h: [parseInt(horarios[2].split(":")[0])], m: [parseInt(horarios[2].split(":")[1])]}
						            ]};
						
						
						            temporizadores[temp]["configApagado"] = {schedules: [
						            {h: [parseInt(horarios[0].split(":")[0])], m: [parseInt(horarios[0].split(":")[1]) + parseInt(temporizadores[temp].DuracionMinutos)]},
						            {h: [parseInt(horarios[1].split(":")[0])], m: [parseInt(horarios[1].split(":")[1]) + parseInt(temporizadores[temp].DuracionMinutos)]},
						            {h: [parseInt(horarios[2].split(":")[0])], m: [parseInt(horarios[2].split(":")[1]) + parseInt(temporizadores[temp].DuracionMinutos)]}
						            ]};
						
						            //console.log(temporizadores[temp]["configApagado"].schedules);
						
						            _programacion.push(temporizadores[temp]);
						            console.log("Configuracion de Temporizadores finalizada..");
						        }
						        else {
						          if (_DEBUG)
						          	console.log("Temporizador.Constructor:  Temporizador <" +item.Descripcion + "> <" + temp + "> no tiene un dispositivo valido..");
						        }
						
						      } else {
						      	if(_DEBUG)
						        	console.log("Temporizador.Constructor: Temporizador <" +item.Descripcion + "> <" + temp + "> esta deshabilitado..")
						        numDeshabilitados++;
						      }
						   }
						
						   if (numDeshabilitados < numTemporizadores) {
						
						    //this._bombasvc = new BombaService(dispositivos, this._logger);
						    //this._bombaprovider = dataProvider.Bomba();
						    console.log("Cantidad de programaciones : " + _programacion.length);
						    callback(null, _programacion);
						   }
						   else
						   {
						   	if (_DEBUG)
						      console.log("Temporizador.Constructor: Los dispositivos <" +item.Descripcion + "> estan deshabilitados, no se programa ninguna actiidad..");
						   }
				   		
			   			});
			   			
				   			
					}, function(error) { if (_DEBUG) console.log("Temporizador.Constructor : Error al leer async en metodo TipoActuador.GetAll() error : " + error); retorno = false; });
				
		   			
		   		}	
		   		else { console.log("Temporizador.Constructor: El tipo de dispositivo no existe"); }
	   		});	
		
		
	});
	 
	 

  
 };
 
 

function TraerDatos(dataProvider, cb) {
	
  
 async.series([
    function(callback){
        InitDevice(dataProvider, function(err, data) { 
        	callback(err, data);
        });
    }
    ,
     function(callback){
        InitMotor(dataProvider, function(err, data) { 
        	callback(err, data);
        });
        
    }
    ,
     function(callback){
        InitRelay(dataProvider, function(err, data) { 
        	callback(err, data);
        });
    }
    ,
    function(callback){
        InitSensor(dataProvider, function(err, data) { 
        	callback(err, data);
        });
    }
    
],
// optional callback
function(err, results){
	
    dispositivos = results[0];
    motores = results[1];
    relays = results[2];
    sensores = results[3];
    cb(err, results);
});
 	
}



function InitDevice (dataProvider, callback)
{
	lstDevices = [];
	 dataProvider.Device().GetAll(function (err, data){
  			if (err) {
  				return callback(err, null);
  			}
  				
	   		if (data && data.length > 0)
	   		{
	   			 async.each(data, function(doc, cb) {
	   			 
	   			 	if (doc.Habilitado) {
			            var deviceModel = new ModelsDispositivo();
			            deviceModel.Crear(doc.Id, 
			            				  doc.Nombre, 
			            				  doc.Tipo, 
			            				  doc.Ip, 
			            				  doc.Puerto, 
			            				  doc.Habilitado, 
			            				  doc.Estado, 
			            				  doc.FrecuenciaMuestreo);
			        	
			            
			            if (!DeviceExists(lstDevices, deviceModel.Objeto()))
			            	lstDevices.push(deviceModel.Objeto());
			            	
			            
		            }
		          }, function(error) { if (_DEBUG) console.log("Temporizador.Inicializar : Error al leer async  error : " + error); });
		     }
		     
		     return callback(null, lstDevices); 
   		});
   		
}


function InitMotor(dataProvider, callback) {

	lstMotores = [];
  dataProvider.Motor().GetAll(function (err, data){
  			if (err) {
  				return callback(err, null);
  			}
  				
	   		if (data && data.length > 0)
	   		{
	   			 async.each(data, function(doc, cb) {
	   			 
	   			 	if (doc.Habilitado) {
	   			 	
			            var motorModel = new ModelsMotor();
			            motorModel.Crear(doc.IdMotor,
			            				  doc.IdDispositivo, 
			            				  doc.Descripcion, 
			            				  doc.MarcaModelo, 
			            				  doc.Tipo, 
			            				  doc.Pin, 
			            				  doc.EsPinAnalogo,
			            				  doc.Habilitado,
			            				  doc.Posicion,
			            				  doc.Accion,
			            				  doc.Estado);
			            
			            if (!MotorExists(lstMotores, motorModel.Objeto()))
			            	lstMotores.push(motorModel.Objeto());
			            
		            }
		          }, function(error) { if (_DEBUG) console.log("Temporizador.InitMotor : Error al leer async  error : " + error); });
		     }
		     
		     callback (null, lstMotores);
   		});
}

function InitRelay(dataProvider, callback) {

  lstRelays = [];
  dataProvider.Relay().GetAll(function (err, data){
  			if (err) {
  				console.log("RelayService.InitRelay.GetAll() -> error : " + err);
  				return callback(err, null);
  			}
  				
	   		if (data && data.length > 0)
	   		{
	   			 async.each(data, function(doc, cb) {
	   			 
			            var relayModel = new ModelsRelay();
			            relayModel.Crear(doc.IdRelay,
		            				  doc.IdDispositivo, 
		            				  doc.Descripcion, 
		            				  doc.MarcaModelo, 
		            				  doc.Tipo, 
		            				  doc.Pin,
		            				  doc.EsPinAnalogo,
		            				  doc.Habilitado,
		            				  doc.Activo,
		            				  doc.EsInverso);
			            
			            if (!RelayExists(lstRelays, relayModel.Objeto()))
			            	lstRelays.push(relayModel.Objeto());
			            
		          }, function(error) { if (_DEBUG) console.log("RelayService.InitMotor : Error al leer async  error : " + error); });
		     }
		     
		     callback (null, lstRelays);
   		});
}


function InitSensor(dataProvider, callback) {

	lstSensores = [];
  dataProvider.Sensor().GetAll(function (err, data){
  			if (err) {
  				return callback(err, null);
  			}
  				
	   		if (data && data.length > 0)
	   		{
	   			 async.each(data, function(doc, cb) {
	   			 
	   			 	if (doc.Habilitado) {
			            var sensorModel = new ModelsSensor();
			            sensorModel.Crear(doc.IdSensor,
			            				  doc.IdDispositivo, 
			            				  doc.Descripcion, 
			            				  doc.MarcaModelo, 
			            				  doc.Tipo, 
			            				  doc.Pin, 
			            				  doc.EsPinAnalogo,
			            				  doc.Habilitado);
			            
			            if (!SensorExists(lstSensores, sensorModel.Objeto()))
			            	lstSensores.push(sensorModel.Objeto());
			            
		            }
		          }, function(error) { if (_DEBUG) console.log("SensorService.InitSensor :  Error al leer async la coleccion Sensor.GetAll() error : " + error); });
		     }
		     
		     callback (null, lstSensores);
   		});
}






 method.Refrescar = function(dataProvider, callback) {
	TraerDatos(dataProvider, callback);
};



method.ListarEncendidasProgramadas = function() {
	return _prendidas;
};

method.ListarApagadasProgramadas = function() {
	return this._apagadas;
};

method.Iniciar = function() {
         
   var logger = this._logger;
   var tcpGuests = this._tcpGuests;
   var dataProvider = this._dataProvider;
   var arduino =this._arduino;
   
   console.dir(_programacion);

   var t = [];
   
   for(var p in _programacion) {
   	  
      var actuador = _programacion[p].IdActuador;
      if (_DEBUG) console.log("configurando actuador <" + actuador + ">");
      var confEncendido = later.schedule(_programacion[p].configEncendido).next(_programacion[p].NumeroDias);
      var confApagado = later.schedule(_programacion[p].configApagado).next(_programacion[p].NumeroDias)
      Init(_programacion[p], _programacion[p].configEncendido, _programacion[p].configApagado, dataProvider, logger, tcpGuests,arduino);
   }
  }

  function Init(programacion, configEncendido, configApagado, dataProvider ,logger, tcpGuests,arduino)
  {
  	if (_DEBUG) console.log("Temporizador.Init");
    var x = later.setInterval(function() { Activar( programacion,dataProvider,logger,tcpGuests); }, configEncendido);
    var y = later.setInterval(function() { Desactivar(programacion, dataProvider,logger,tcpGuests); }, configApagado)
  }
  
  function Desactivar(programacion, dataProvider,logger,tcpGuests)
  {
  		var Arduino = require("./Arduino");
		var arduino = new Arduino(); 
  		console.log("Temporizador.Desactivar : Apagando Actuador.." + programacion.Descripcion);
		logger.info("Temporizador.Desactivar : Apagando Actuador.." + programacion.Descripcion);
		
		switch (programacion.IdTipoActuador) {
		
			case 1:
				console.log("Temporizador.Desactivar : Tipo de actuador = Sensor");
				logger.info("Temporizador.Desactivar : Tipo de actuador = Sensor");
				
				
				
				break;
				
			case 2:
				console.log("Temporizador.Desactivar : Tipo de actuador = Relay");
				logger.info("Temporizador.Desactivar : Tipo de actuador = Relay");
				
				var TipoDispositivo = arduino.Dispositivos(programacion.IdTipoActuador);
				var Operacion = arduino.Operaciones(programacion.IdTipoActuador).Apagar;
				var Pin = programacion.actuador.Pin;
				var IdActuador = programacion.actuador.IdRelay;
				message = TipoDispositivo+Operacion+IdActuador+Pin+"X";
				console.log("MESSAGE : " + message);
				
				for (g in tcpGuests) {
        			tcpGuests[g].write(message);
    			}
				
				break;
				
			case 3:
				console.log("Temporizador.Activar : Tipo de actuador = Motor");
				logger.info("Temporizador.Activar : Tipo de actuador = Motor");
				break;
		
		}
  }


	function Activar(programacion, dataProvider, logger, tcpGuests)
	{
		var Arduino = require("./Arduino");
		var arduino = new Arduino(); 
		console.log("Temporizador.Activar : Encendiendo Actuador.." + programacion.Descripcion);
		logger.info("Temporizador.Activar : Encendiendo Actuador.." + programacion.Descripcion);
		var message;
		
		switch (programacion.IdTipoActuador) {
		
			case 1:
				console.log("Temporizador.Activar : Tipo de actuador = Sensor");
				logger.info("Temporizador.Activar : Tipo de actuador = Sensor");
				
				
				
				break;
				
			case 2:
				console.log("Temporizador.Activar : Tipo de actuador = Relay");
				logger.info("Temporizador.Activar : Tipo de actuador = Relay");
				
				var TipoDispositivo = arduino.Dispositivos(programacion.IdTipoActuador);
				var Operacion = arduino.Operaciones(programacion.IdTipoActuador).Encender;
				var Pin = programacion.actuador.Pin;
				var IdActuador = programacion.actuador.IdRelay;
				message = TipoDispositivo+Operacion+IdActuador+Pin+"X";
				console.log("MESSAGE : " + message);
				
				for (g in tcpGuests) {
        			tcpGuests[g].write(message);
    			}
				
				break;
				
			case 3:
				console.log("Temporizador.Activar : Tipo de actuador = Motor");
				logger.info("Temporizador.Activar : Tipo de actuador = Motor");
				break;
		
		}
		
		
		
	}

/*
    bombasvc.ActivarBomba(idActuador, function(data) {
      if (data instanceof Error)
      { 
        logger.error("Temporizador: Error al Activar Actuador " + idActuador + ", detalle: " + data);
        mailer.Enviar("Error al encender actuador", "Temporizador: Error al Activar Actuador " + idActuador +" , detalle: " + data);
        twitter.Enviar("Tengo un problema al intentar encender el actuador " + idActuador + "... " + data);
      }
      else
      {
        logger.info("Temporizador: ..Actuador " + idActuador + "Activado");
        //Llamada a servicio
        for (g in tcpGuests) {
	    	tcpGuests[g].write(message);
		}
        bombaprovider.Save(data.Id, 255, 0, Date.now );
        
      }
    });
	}

	function Desactivar(idActuador, bombasvc,bombaprovider,logger,mailer, twitter)
	{
		logger.info("Temporizador: Apagando Actuador ID : " + idActuador);

     bombasvc.DesactivarBomba(idActuador, function(data) {

      	if (data instanceof Error || data.toString().indexOf("ECONNREFUSED") > -1) 
      	{
      		logger.error("Temporizador: Error al Desactivar Actuador " + idActuador +", detalle: " + data);
      		mailer.Enviar("Error al apagar actuador", "Temporizador: Error al Apagar Actuador " + idActuador + ", detalle: " + data);
      		twitter.Enviar("Tengo un problema al intentar desactivar el actuador" + idActuador + "... " + data);
      	}
      	else
      	{
      		logger.info("Temporizador: Actuador " + idActuador + " Desactivado");

          bombaprovider.GetLast({Id : data.Id}, function(error, objBomba) {
              
              bombaprovider.Save(objBomba.Id, 0,objBomba.TiempoTotal,objBomba.TiempoInicial);

          });
      	}

      });
	 }
  */
    function BuscarDispositivo(id, lstDispositivos)
    {
      var found = null;
      for (var d in lstDispositivos)
      {
          if (lstDispositivos[d].Id == id)
          {
            found = lstDispositivos[d];
          }
      }

      if (!found)
        console.log("Temporizador.BuscarDispositivo: dispositivo no encontrado");

      return found;
    }

    function BuscarActuador(id, actuadores)
    {
      var found = null;
      for (var d in actuadores)
      {
          if (actuadores[d].Id == id)
          {
            found = actuadores[d];
          }
      }

      if (!found)
        console.log("Temporizador.BuscarActuador: actuador no encontrado");

      return found;
    }
    
function MotorExists(lst, value) {
	
	var retorno = false;
	if (!lst || lst.length == 0)
	 return false;
	
	async.each(lst, function(item , cb) {
	   		
   			 if (item) {
   			 	retorno = true;
   			 }
	   			
	}, function(error) { if (_DEBUG) console.log("Temporizador.MotorExists : Error al leer async en metodo MotorExists error : " + error); retorno = false; });
	
	return retorno;
	
}



function RelayExists(lst, value) {
	
	var retorno = false;
	if (!lst || lst.length == 0)
	 return false;
	
	async.each(lst, function(item , cb) {
	   		
   			 if (item && item.IdRelay && item.IdRelay == value) {
   			 	retorno = true;
   			 }
	   			
	}, function(error) { if (_DEBUG) console.log("Temporizador.MotorExists : Error al leer async en metodo MotorExists error : " + error); retorno = false; });
	
	return retorno;
	
}


function SensorExists(lst, value) {
	
	var retorno = false;
	if (!lst || lst.length == 0)
	 return false;
	
	
	async.each(lst, function(item , cb) {
	   		
   			 if (item && item.IdSensor && item.IdSensor == value) {
   			 	retorno = true;
   			 }
	   			
	}, function(error) { if (_DEBUG) console.log("Temporizador.SensorExists : Error al leer async en metodo SensorExists error : " + error); retorno = false; });
	
	return retorno;
	
}


function DeviceExists(lst, value) {
	
	retorno = false;
	
	if (!lst || lst.length == 0)
	 return false;
	
	async.each(lst, function(item , cb) {
	   			 
	   			 if (item && item.IdDispositivo && item.IdDispositivo == value) {
	   			 	retorno = true;
	   			 }
	   			
	}, function(error) { if (_DEBUG) console.log("Temporizador.DeviceExists : Error al leer async en mettodo DeviceExists() error : " + error); retorno = false; });
	return retorno;
}



  //return this._tareas;



module.exports = Temporizador;
