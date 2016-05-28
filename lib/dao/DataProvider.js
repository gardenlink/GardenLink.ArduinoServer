/*
 * DataProvider
 * https://github.com/Gerdenlink
 * 
 */

 var method = DataProvider.prototype;
 var async = require("async");


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
          var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
                		  replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } }
                		  };
          
             try {
          mongoose.connect('mongodb://'+Configuracion[conf].UserName+':'+Configuracion[conf].Password+'@ds039960.mlab.com:39960/botanicbot-db', options);
          } catch(e) {
            console.log("Error al abrir conexion : " + e);
          }
        }
        //TODO: Revisar como reconectar
        //mongoose.connection.on('error', console.error.bind(console, 'connection error:'));  
        
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

//Variables para manejo de colecciones locales
var lstDevices = [];
var lstMotores = [];
var lstRelays = [];
var lstSensors = [];
var datosConsolidados = [];

//Variables para manejo de colecciones de clase
var dispositivos = [];
var sensores = [];
var relays = [];
var motores = [];
 
 
 

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
    
],
// optional callback
function(err, results){
	
    dispositivos = results[0];
    motores = results[1];
    relays = results[2];
    sensores = results[3];
    datosConsolidados = {
    	Dispositivos : dispositivos,
    	Motores : motores,
    	Relays : relays,
    	Sensores : sensores
    };
    cb(err, datosConsolidados);
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
			            
			            if (!SensorExists(lstSensores, sensorModel.Objeto()))
			            	lstSensores.push(sensorModel.Objeto());
			            
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
	   		
   			 if (item) {
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
	   		
   			 if (item && item.IdRelay && item.IdRelay == value) {
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
	   		
   			 if (item && item.IdSensor && item.IdSensor == value) {
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
	   			 
	   			 if (item && item.IdDispositivo && item.IdDispositivo == value) {
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
