/*
 * DataProvider
 * https://github.com/Gerdenlink
 * 
 */

 var method = DataProvider.prototype;
 var async = require("async");
 var _later = require("later");


 var Sources = {
   Device : require('./DeviceProvider.js'),
   Sensor : require('./SensorProvider.js'),
   Bomba : require('./BombaProvider.js'),
   Medicion : require('./MedicionProvider.js'),
   Relay : require('./RelayProvider.js'),
   Temporizador : require('./TemporizadorProvider.js'),
   TipoActuador : require('./TipoActuadorProvider.js'),
   Motor : require('./MotorProvider.js')
 }

 var Configuracion = {
  NEDB : Object,
  MONGO : Object,
  DWEET : Object
 }

 var Data = {
  Device : Object,
  Sensor : Object,
  Bomba : Object,
  Medicion : Object,
  Relay : Object,
  Temporizador : Object,
  TipoActuador : Object,
  Motor : Object
 }


 var mongoose = require('mongoose')

 

 function DataProvider(log, config, opt) {
    
  EstablecerConfiguraciones(config);

  if (opt)
    this.BuildCustomProvider(log, opt);
  else
    this.BuildProviderAutoConfig(log, Configuracion);

  
  Inicializar(Configuracion);
  
  	//Tarea recurrente para refrescar informacion sobre servicios desde base de datos, cada un minuto
	var sched = _later.parse.recur().every(1).minute(),
    t = _later.setInterval(function() { TraerDatos(function(error, data) { }) }, sched);
    console.log("DataProvider.Constructor -> Refresco de datos cada 1 minuto ");
    
 }

 //Extrae las configuraciones de los datasources desde el archivo de configuracion
 function EstablecerConfiguraciones(config) {
    for (var conf in config.datasource) {
      Configuracion[conf] = config.datasource[conf];
      if (conf == "MONGO")
      {
        if (Configuracion[conf].Habilitado == "true")
        {
          mongoose = require('mongoose');
          var debug = Configuracion[conf].Debug == "true" ? true : false;
          mongoose.set('debug', debug);
          //Opciones para KeepAlive
          var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 },
          							 reconnectTries : 3000,
          							 reconnectInterval: 2000,
          							 autoReconnect : true
          				  }, 
                		  replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 }}
                		 };
          
             try {
          mongoose.connect('mongodb://'+Configuracion[conf].UserName+':'+Configuracion[conf].Password+'@ds039960.mlab.com:39960/botanicbot-db', options);
          } catch(e) {
            console.log("Error al abrir conexion : " + e);
          }
        }
        
        Configuracion[conf].DataSource = mongoose;

      }
    }
 }

 //Inicializa datos cuando no existe la base
 function Inicializar(config)
 {
    Data.Device.Inicializar(config);
    Data.Sensor.Inicializar(config);
    Data.Relay.Inicializar(config);
    Data.Temporizador.Inicializar(config);
    Data.TipoActuador.Inicializar(config);
    Data.Motor.Inicializar(config);
 }


 //ejemplo:  opt = config.NEDB.Habilitado
 method.BuildCustomProvider = function(log, opt) {
  console.log("custom");
    Data.Device = new Sources.Device(log, opt);
    Data.Sensor = new Sources.Sensor(log, null, opt);
    Data.Bomba = new Sources.Bomba(log, opt);
    Data.Medicion = new Sources.Medicion(log,null, opt);
    Data.Relay = new Sources.Relay(log, null,opt);
    Data.Temporizador = new Sources.Temporizador(log,null,opt);
    Data.TipoActuador = new Sources.TipoActuador(log,null,opt);
    Data.Motor = new Sources.Motor(log, null, opt);
 };

 method.BuildProviderAutoConfig = function(log, config) {
    Data.Device = new Sources.Device(log, config);
    Data.Sensor = new Sources.Sensor(log, null, config);
    Data.Bomba = new Sources.Bomba(log, config);
    Data.Medicion = new Sources.Medicion(log, null, config);
    Data.Relay = new Sources.Relay(log, null,config);
    Data.Temporizador = new Sources.Temporizador(log, null,config);
    Data.TipoActuador = new Sources.TipoActuador(log,null,config);
    Data.Motor = new Sources.Motor(log, null, config);
 }

 method.Device = function()
 {
    return Data.Device;
 }

 method.Sensor = function()
 {
  return Data.Sensor;
 }

 method.Bomba = function()
 {
  return Data.Bomba;
 }
 
 method.Medicion = function()
 {
 	return Data.Medicion;
 }
 
 method.Relay = function()
 {
 	return Data.Relay;
 }
 
 method.Temporizador = function()
 {
 	return Data.Temporizador;
 }
 
 method.TipoActuador = function()
 {
 	return Data.TipoActuador;
 }
 
 method.Motor = function()
 {
 	return Data.Motor;
 }

 method.GetConfig = function()
 {
   return Configuracion;
 }
 

//Trae un consolidado completo (cache : boolean = si refresco la informacion o no)
method.Cache = function(enabled,callback) {
	if (enabled && datosConsolidados.length > 0) {
		console.log("Cache Hit");
		callback(null, datosConsolidados);	
	}
	else
	{
		TraerDatos(callback);
	}
}
 
 
/* ***********************************************************
* Gestion Centralizada de datos
*/
 
var ModelsDispositivo = require("../dto/Dispositivo.js");
var ModelsRelay = require("../dto/Relay.js");
var ModelsSensor = require("../dto/Sensor.js");
var ModelsMotor = require("../dto/Motor.js");
var ModelsMedicion = require("../dto/Medicion.js");

//Variables para manejo de colecciones locales
var lstDevices = [];
var lstMotores = [];
var lstRelays = [];
var lstSensors = [];
var lstMediciones = [];
var datosConsolidados = [];

//Variables para manejo de colecciones de clase
var dispositivos = [];
var sensores = [];
var relays = [];
var motores = [];
var mediciones = [];
 
 
 

function TraerDatos(cb) {
	
  
 async.series([
    function(callback){
        InitDevice(function(err, data) { 
        	callback(err, data);
        });
    }
    ,
     function(callback){
        InitMotor( function(err, data) { 
        	callback(err, data);
        });
        
    }
    ,
     function(callback){
        InitRelay( function(err, data) { 
        	callback(err, data);
        });
    }
    ,
    function(callback){
        InitSensor( function(err, data) { 
        	callback(err, data);
        });
    }
    ,
    function(callback) {
    	InitMedicion(function(err,data) {
    		callback(err,data);
    	});
    }
    
],
// optional callback
function(err, results){
	
    dispositivos = results[0];
    motores = results[1];
    relays = results[2];
    sensores = results[3];
    mediciones = results[4];

    
    
    //Agregar mediciones a objeto sensor

	 async.eachSeries(mediciones, function iteratee(medicion, callb) {
    
    	
	    for (var sensor in sensores) {
	    	if (medicion) {
		    	if(sensores[sensor].IdSensor == medicion.IdActuador && medicion.IdTipoActuador == 1 && medicion.IdDispositivo == sensores[sensor].IdDispositivo) {
		    		sensores[sensor].Medicion = medicion;
		    	}
		    }
	    } 
	    
	    /*
	    for (var relay in relays) {
	    	if (medicion) {
		    	if(relays[relay].IdRelay == medicion.IdActuador && medicion.IdTipoActuador == 2 && medicion.IdDispositivo == relays[relay].IdDispositivo) {
		    		relays[relay].Medicion = medicion;
		    	}
		    }
	    }
	    */
	    
	    /*
	      for (var motor in motores) {
	    	if (medicion) {
		    	if(motores[motor].IdMotor == medicion.IdActuador && medicion.IdTipoActuador == 3 && medicion.IdDispositivo == motores[motor].IdDispositivo) {
		    		motores[motor].Medicion = medicion;
		    	}
		    }
	    }
	    */
	    
	    
	    
	    //sensores[sensor] = sensor;
	    callb(null, "test");
    
	}, function done() {
	    
	    datosConsolidados = {
	    	Dispositivos : dispositivos,
	    	Motores : motores,
	    	Relays : relays,
	    	Sensores : sensores,
	    	Mediciones : mediciones
	    };
	    cb(err, datosConsolidados);
	    
	});
    
/*
       
    async.eachSeries(sensores, function iteratee(sensor, callb) {
    
	    for (var medicion in mediciones) {
	    	if (mediciones[medicion]) {
		    	if(sensor.IdSensor == mediciones[medicion].IdActuador && mediciones[medicion].IdTipoActuador == 1) {
		    		sensor.Medicion = mediciones[medicion];
		    	}
		    }
	    }
	    //sensores[sensor] = sensor;
	    callb(null, sensores);
    
	}, function done() {
	    
	    datosConsolidados = {
	    	Dispositivos : dispositivos,
	    	Motores : motores,
	    	Relays : relays,
	    	Sensores : sensores,
	    	Mediciones : mediciones
	    };
	    cb(err, datosConsolidados);
	    
	});
    
   */  
	
	 
	 /*
	 //Agregar mediciones a objeto relay
	 for(var sensor in sensores) {
	    for (var medicion in mediciones) {
	    	if(sensores[sensor].IdSensor == mediciones[medicion].IdActuador && mediciones[medicion].IdTipoActuador == 1) {
	    		sensores[sensor].Medicion = mediciones[medicion];
	    	}	
	    }
	 }
	 */
	
    
   
});
 	
}



function InitDevice (callback)
{
	lstDevices = [];
	 Data.Device.GetAll(function (err, data){
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
		          }, function(error) { if (_DEBUG) console.log("DataProvider.Inicializar : Error al leer async  error : " + error); });
		     }
		     
		     return callback(null, lstDevices); 
   		});
   		
}


function InitMotor( callback) {

	lstMotores = [];
  Data.Motor.GetAll(function (err, data){
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
		          }, function(error) { if (_DEBUG) console.log("DataProvider.InitMotor : Error al leer async  error : " + error); });
		     }
		     
		     callback (null, lstMotores);
   		});
}

function InitMedicion(callback) {

	lstMediciones = [];
	/* revisar si hay mediciones y obtener la ultima */
	var tipos = [1,2,3,4];
			            	
	async.eachSeries(tipos, function iteratee(item, cb) {
    
    	var filter = { };
 			  
 			  sortObject = {};
				var stype = "TimeStamp";
				var sdir = "desc";
				sortObject[stype] = sdir;
 
			 filter.IdTipoActuador = item;
			 //filter.IdActuador = doc.IdSensor;
			 filter.sortObject = sortObject;

			Data.Medicion.GetLast(filter, function(err, data) { 
		      if (err){
		      	console.log("DataProvider.Cache.InitMedicion : " + err);
		      }
		      else
		      {
		      		lstMediciones.push(data);
		      		cb(null,lstMediciones);				    
			  }
	     	});
    
	}, function done() {
	    callback (null, lstMediciones);
	});
	     
}

function InitRelay( callback) {

  lstRelays = [];
  Data.Relay.GetAll(function (err, data){
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


function InitSensor( callback) {

	lstSensores = [];
  Data.Sensor.GetAll(function (err, data){
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
			            
			            if (!SensorExists(lstSensores, sensorModel.Objeto())) {
			            	lstSensores.push(sensorModel.Objeto());
			            } //if
			            
		            }
		          }, function(error) { if (_DEBUG) console.log("SensorService.InitSensor :  Error al leer async la coleccion Sensor.GetAll() error : " + error); });
		     }
		     
		     callback (null, lstSensores);
   		});
}

function MotorExists(lst, value) {
	
	var retorno = false;
	if (!lst || lst.length == 0)
	 return false;
	
	async.each(lst, function(item , cb) {
	
   			 if (item && item.IdMotor && (item.IdMotor == value.IdMotor || item.IdMotor == value)) {
   			 	retorno = true;
   			 }
   			 
	}, function(error) { if (_DEBUG) console.log("DataProvider.MotorExists : Error al leer async en metodo MotorExists error : " + error); retorno = false; });
	
	return retorno;
	
}



function RelayExists(lst, value) {
	
	var retorno = false;
	if (!lst || lst.length == 0)
	 return false;
	
	async.each(lst, function(item , cb) {
   			 if (item && item.IdRelay && (item.IdRelay == value.IdRelay || item.IdRelay == value)) {
   			 	retorno = true;
   			 }
	   			
	}, function(error) { if (_DEBUG) console.log("DataProvider.MotorExists : Error al leer async en metodo MotorExists error : " + error); retorno = false; });
	
	return retorno;
	
}


function SensorExists(lst, value) {
	
	var retorno = false;
	if (!lst || lst.length == 0)
	 return false;
	
	
	async.each(lst, function(item , cb) {
	   		
   			 if (item && item.IdSensor && (item.IdSensor == value || item.IdSensor == value.IdSensor)) {
   			 	retorno = true;
   			 }
	   			
	}, function(error) { if (_DEBUG) console.log("DataProvider.SensorExists : Error al leer async en metodo SensorExists error : " + error); retorno = false; });
	
	return retorno;
	
}


function DeviceExists(lst, value) {
	
	retorno = false;
	
	if (!lst || lst.length == 0)
	 return false;
	
	async.each(lst, function(item , cb) {
	   			 
	   			 if (item && item.IdDispositivo && (item.IdDispositivo == value || item.IdDispositivo == value.IdDispositivo)) {
	   			 	retorno = true;
	   			 }
	   			
	}, function(error) { if (_DEBUG) console.log("DataProvider.DeviceExists : Error al leer async en mettodo DeviceExists() error : " + error); retorno = false; });
	return retorno;
}


 

 //USO:

 //var DataProvider = require('./lib/dao/DataProvider.js');
//var customConfig = config;
//customConfig.datasource.NEDB.Habilitado = true;
//customConfig.datasource.MONGO.Habilitado = false;
//customConfig.datasource.DWEET.Habilitado = false;
//var dataProvider = new DataProvider(logger, config, null);
//var filtro = { Id : String };
//filtro.Id = "002";
//dataProvider.Device().Find(filtro, function(err, data) { console.log(data);});


module.exports = DataProvider;
