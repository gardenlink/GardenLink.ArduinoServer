/*
 * DataProvider
 * https://github.com/Gerdenlink
 * 
 */

 var method = DataProvider.prototype;


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
