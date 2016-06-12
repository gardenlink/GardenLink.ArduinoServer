/*
 * dao.SensorProvider
 * https://github.com/Gerdenlink
 *
 */

var method = SensorProvider.prototype;

var Models; 
var MongoModels;

var _logs;
var _moment;

var DweetIO = require("node-dweetio");
var _dweetClient;

var _DEBUG = true;

var DWEET = "Dweet";
var MONGO = "Mongo";

var async = require('async');

var _dweet_prefijo;

var Datastore = require('nedb'); 
var db = {};


var _provider = {
  DWEET : false,
  MONGO : false,
  NEDB :false
};



function SensorProvider(logs, moment, config) {
  console.log("Inicializando SensorProvider..");
  _logs = logs;
  
    if (config.MONGO.Habilitado == "true") {
      _provider.MONGO = true;
        Models = require("../dto/Sensor.js");
        
          if (config.MONGO.Debug) {
	  	_DEBUG = config.MONGO.Debug == "true" ? true : false;
	  	}

      var mongoose = config.MONGO.DataSource, Schema = mongoose.Schema;

      var SensorSchema = new Schema({
         IdSensor : Number
		  , IdDispositivo : String
		  , Descripcion : String
		  , MarcaModelo : String
		  , Tipo : String
		  , Pin : Number
		  , EsPinAnalogo : Boolean
		  , Habilitado : Boolean
      });
      

      MongoModels = mongoose.model('Sensor', SensorSchema)

    }

    if (config.DWEET.Habilitado == "true"){
      _provider.DWEET = true;
      this._dweetClient = new DweetIO();
      Models = require("../dto/Sensor.js");
      _dweet_prefijo = config.DWEET.prefijo_sensor;
    }

    if (config.NEDB.Habilitado == "true"){
      _provider.NEDB = true;
      
      if (config.NEDB.Debug) {
	  	_DEBUG = config.NEDB.Debug == "true" ? true : false;
	  	}
      
      db.Sensor = new Datastore({ filename: './db/Sensor.db', autoload:true});
      
      db.Sensor.ensureIndex({ fieldName: 'IdSensor', unique: true, sparse:true }, function (err) {
        if (err) {
          console.log("<NEDB> SensorProvider.Inicializar : Error al crear el indice: Error: " + err.message);
        }
      });
      Models = require("../dto/Sensor.js");
    }
 
}


method.Inicializar = function(config){
	 if (_provider.NEDB){
	    
	
		 db.Sensor.find({}, function (err, docs) {
		
			if (docs.length == 0) {
			     
			     console.log("<NEDB> SensorProvider.Inicializar : Inicializo base de datos con valores desde archivo de datos iniciales /db/DatosIniciales/Sensor.json");
			     
			      var configuracion = require('../../db/DatosIniciales/Sensor.json');
			      console.dir(configuracion);
			      async.each(configuracion.sensor, function(item, callback) { 
			
			        var sensorModel = new Models();
			        sensorModel.Crear(item.IdSensor,
			        				  item.IdDispositivo, 
			        				  item.Descripcion, 
			        				  item.MarcaModelo, 
			        				  item.Tipo,
			        				  item.Pin,
			        				  item.EsPinAnalogo,
			        				  item.Habilitado);
			        db.Sensor.insert(sensorModel.Objeto(), function (err, newDoc) {   // Callback is optional 
			        });
			
			      });
			  }
		});
	}
	
	if (_provider.MONGO){
	    
	
		 MongoModels.find({}, function (err, docs) {
		
			if (docs.length == 0) {
			     
			     console.log("<MONGO> SensorProvider.Inicializar : Inicializo base de datos con valores desde archivo de datos iniciales /db/DatosIniciales/Sensor.json");
			     
			      var configuracion = require('../../db/DatosIniciales/Sensor.json');
			      console.dir(configuracion);
			      async.each(configuracion.sensor, function(item, callback) { 
			
			        var sensorModel = new Models();
			        sensorModel.Crear(item.IdSensor,
			        				  item.IdDispositivo, 
			        				  item.Descripcion, 
			        				  item.MarcaModelo, 
			        				  item.Tipo,
			        				  item.Pin,
			        				  item.EsPinAnalogo,
			        				  item.Habilitado);
			       var objMongo = new MongoModels(sensorModel.Objeto());
	               objMongo.save(function(err, data) {
			       });
			  
				});
			}
			});
			}
};


method.Save = function(IdSensor, IdDispositivo, Descripcion, MarcaModelo, Tipo,Pin,EsPinAnalogo,Habilitado) {
    
    if (_provider.MONGO) {
		
         var sensorModel = new Models();
      sensorModel.Crear(IdSensor, 
      					IdDispositivo, 
      					Descripcion, 
      					MarcaModelo, 
      					Tipo,
      					Pin,
      					EsPinAnalogo,
      					Habilitado);
      if (_DEBUG)
        console.log("<MONGO> SensorProvider.Save - Objeto: " + sensorModel.Objeto());
      //console.log(GenerarDweetId(Id));

      if(sensorModel.Validar(sensorModel.Objeto())) {
      MongoModels.findOne({IdSensor : sensorModel.Objeto().IdSensor}, function (err, data) {
      
      
        if (!data) {
          
          	  var objMongo = new MongoModels(sensorModel.Objeto());
	          objMongo.save(sensorModel.Objeto(), function(err, data) {           
		          if (_DEBUG)
		            console.log("<MONGO> SensorProvider.Save : inserto nuevo objeto");
		          // newDoc is the newly inserted document, including its _id
		          // newDoc has no key called notToBeSaved since its value was undefined
	          });
        }
        else
        {
          MongoModels.update({ _id: data._id }, { $set: {
              IdSensor : sensorModel.Objeto().IdSensor,
              IdDispositivo : sensorModel.Objeto().IdDispositivo,
              Descripcion : sensorModel.Objeto().Descripcion,
              MarcaModelo : sensorModel.Objeto().MarcaModelo,
              Tipo : sensorModel.Objeto().Tipo,
              Pin: sensorModel.Objeto().Pin,
              EsPinAnalogo: sensorModel.Objeto().EsPinAnalogo,
              Habilitado : sensorModel.Objeto().Habilitado
              }
            }, { upsert: false } , function (err, numReplaced) { 
              if (_DEBUG)
                console.log("<MONGO> SensorProvider.Save : Remplazados: " + numReplaced);
            if (err)
              console.log("<MONGO> SensorProvider.Save : Error al updatear" + err);
          });
        }
      });
      }
      else
      {
        if (_DEBUG)
          console.log("<MONGO> SensorProvider.Save : No se graba objeto debido a que no pasa la validacion de integridad");
      }
    }
     
     if (_provider.DWEET) {
    
      throw new Error("Sensor.Save no habilitado para Dweet"); 
    }

     if (_provider.NEDB){
      var sensorModel = new Models();
      sensorModel.Crear(IdSensor, 
      					IdDispositivo, 
      					Descripcion, 
      					MarcaModelo, 
      					Tipo,
      					Pin,
      					EsPinAnalogo,
      					Habilitado);
      if (_DEBUG)
        console.log(sensorModel.Objeto());
      //console.log(GenerarDweetId(Id));

      if(sensorModel.Validar(sensorModel.Objeto())) {
      db.Sensor.find({IdSensor : sensorModel.Objeto().IdSensor}, function (err, data) {
        if (data.length == 0) {
          db.Sensor.insert(sensorModel.Objeto(), function (err, newDoc) {   // Callback is optional
          if (_DEBUG)
            console.log("<NEDB> SensorProvider.Save: inserto nuevo objeto");
          // newDoc is the newly inserted document, including its _id
          // newDoc has no key called notToBeSaved since its value was undefined
          });
        }
        else
        {
        	
          db.Sensor.update({ _id: data._id }, { $set: {
              IdSensor : sensorModel.Objeto().IdSensor,
              IdDispositivo : sensorModel.Objeto().IdDispositivo,
              Descripcion : sensorModel.Objeto().Descripcion,
              MarcaModelo : sensorModel.Objeto().MarcaModelo,
              Tipo : sensorModel.Objeto().Tipo,
              Pin: sensorModel.Objeto().Pin,
              EsPinAnalogo: sensorModel.Objeto().EsPinAnalogo,
              Habilitado : sensorModel.Objeto().Habilitado
              }
            }, { upsert: false } , function (err, numReplaced) { 
              if (_DEBUG)
                console.log("<NEDB> SensorProvider.Save: Remplazados: " + numReplaced);
            if (err)
              console.log("<NEDB> SensorProvider.Save: Error al updatear" + err);
          });
        }
      });
      }
      else
      {
        if (_DEBUG)
          console.log("<NEDB> SensorProvider.Save : No se graba objeto debido a que no pasa la validacion de integridad");
      }
    }

};

method.Delete = function(IdSensor) {
	 if (_provider.NEDB){
	 	db.Sensor.remove({ IdSensor: IdSensor }, {}, function (err, numRemoved) {
  			if(_DEBUG)
  				console.log("<NEDB> Sensor.Delete -> CantEliminados " + numRemoved); 
		});
	 }
	 
	 if (_provider.MONGO) {
	 	 MongoModels.remove({ IdSensor: IdSensor }, {}, function (err, numRemoved) {
  			if(_DEBUG)
  				console.log("<MONGO> Sensor.Delete -> CantEliminados " + numRemoved); 
		});
	 }
};


method.GetCollection = function(filter, callback) {

 if (_provider.MONGO) {
    
      var lstModels = [];
      
      var filters = {};
      if (filter.IdSensor)
      	filters.IdSensor = parseInt(filter.IdSensor);
      	
      if (filter.IdDispositivo)
      	filters.IdDispositivo = filter.IdDispositivo;
      
       MongoModels.find(filters, function (err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("<MONGO> SensorProvider.GetCollection : Error al leer async en mettodo GetCollection() error : " + error);
           return callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var sensorModel = new Models();
            sensorModel.Crear(doc.IdSensor,
            				  doc.IdDispositivo, 
            				  doc.Descripcion, 
            				  doc.MarcaModelo, 
            				  doc.Tipo, 
            				  doc.Pin, 
            				  doc.EsPinAnalogo,
            				  doc.Habilitado);
            				 
			if (_DEBUG) console.dir("<MONGO> SensorProvider.GetCollection : Objeto Encontrado : " + sensorModel.Objeto());
			
            lstModels.push(sensorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("<MONGO> SensorProvider.GetCollection : Error al leer async en mettodo GetAll() error : " + error); });
          }
          return callback(null, lstModels);
        }
      });
  }

  if (_provider.NEDB) {
      var lstModels = [];
      db.Sensor.find({IdSensor : parseInt(filter.IdSensor)}, function (err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("<MONGO> SensorProvider.GetCollection : Error al leer async en mettodo GetAll() error : " + error);
           return callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var sensorModel = new Models();
            sensorModel.Crear(doc.IdSensor,
            				  doc.IdDispositivo, 
            				  doc.Descripcion, 
            				  doc.MarcaModelo, 
            				  doc.Tipo, 
            				  doc.Pin, 
            				  doc.EsPinAnalogo,
            				  doc.Habilitado);
            lstModels.push(sensorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("<MONGO> SensorProvider.GetCollection : Error al leer async en mettodo GetAll() error : " + error); });
          }
          return callback(null, lstModels);
        }
      });
  }
  else if (_provider.DWEET) {

	
    throw new Error("Sensor.GetCollection() no habilitado para Dweet");
  }



};

method.GetLast = function(filter, callback) {

  if (_provider.MONGO) {

    console.log("<MONGO> SensorProvider.GetLast no implementado para Mongo");
  }

  if (_provider.DWEET) {

    this._dweetClient.get_all_dweets_for(GenerarDweetId(filter.Id), function(err, dweets) {

      var dweet = dweets[0]; // Dweet is always an array of 1
      var medicion = new Models();
      medicion.Crear(dweet.content["Id"], dweet.content["IdDispositivo"], dweet.content["Pin"], dweet.content["TimeStamp"], dweet.content["Valor"]);
      return callback(null, medicion);
    });
  }

  if (_provider.NEDB) {

    console.log("<NEDB> SensorProvider.GetLast no implementado para NEDB");
  }



};

method.Find = function(filter, callback) {

	if (_provider.NEDB) {
	      var lstModels = [];
	      
	      var filters = {};
	      if (filter.IdSensor)
	      	filters.IdSensor = parseInt(filter.IdSensor);
	      
	      if (filters.length == 0) {
	      	if (_DEBUG)
	      		console.log("<NEDB>  SensorProvider.Find  : no se han seteado filtros"); 
	      }
	      
	      
	      db.Sensor.find(filters, function (err, docs) {
	        
	        if (err) {
	           if (_DEBUG) console.log("<NEDB>  SensorProvider.Find  : Error al leer async en mettodo Find() error : " + error);
	           return callback(err, lstModels);
	        } 
	        else 
	        {
	          if (docs.length > 0) {
		          async.each(docs, function(doc, cb) { 
		            var sensorModel = new Models();
		            sensorModel.Crear(doc.IdSensor,
		            				  doc.IdDispositivo, 
		            				  doc.Descripcion, 
		            				  doc.MarcaModelo, 
		            				  doc.Tipo, 
		            				  doc.Pin,
		            				  doc.EsPinAnalogo,
		            				  doc.Habilitado);
		            				  
		            lstModels.push(sensorModel.Objeto());
		            
		          }, function(error) { if (_DEBUG) console.log("<NEDB>  SensorProvider.Find  : Error al leer async en mettodo GetAll() error : " + error); });
	          }
	          callback(null, lstModels[0]);
	        }
	      });
	  }
	  
	  if (_provider.MONGO) {
	      var lstModels = [];
	      
	      var filters = {};
	      if (filter.IdSensor)
	      	filters.IdSensor = parseInt(filter.IdSensor);
	      
	      if (filters.length == 0) {
	      	if (_DEBUG)
	      		console.log("<MONGO>  SensorProvider.Find  : no se han seteado filtros"); 
	      }
	      
	      
	        MongoModels.find(filters).exec(function(err, docs) {
	        
	        if (err) {
	           if (_DEBUG) console.log("<MONGO>  SensorProvider.Find  : Error al leer async en mettodo Find() error : " + error);
	           return callback(err, lstModels);
	        } 
	        else 
	        {
	          if (docs.length > 0) {
		          async.each(docs, function(doc, cb) { 
		            var sensorModel = new Models();
		            sensorModel.Crear(doc.IdSensor,
		            				  doc.IdDispositivo, 
		            				  doc.Descripcion, 
		            				  doc.MarcaModelo, 
		            				  doc.Tipo, 
		            				  doc.Pin,
		            				  doc.EsPinAnalogo,
		            				  doc.Habilitado);
		            				  
		            lstModels.push(sensorModel.Objeto());
		            
		          }, function(error) { if (_DEBUG) console.log("<MONGO>  SensorProvider.Find  : Error al leer async en mettodo GetAll() error : " + error); });
	          }
	          callback(null, lstModels[0]);
	        }
	      });
	  }

};



method.GetAll = function(callback) {

 if (_provider.MONGO) {
   
     var lstModels = [];
      MongoModels.find({}).exec(function(err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("<MONGO>  SensorProvider.GetAll  :Error al leer async en mettodo GetAll() error : " + error);
           return callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var sensorModel = new Models();
            sensorModel.Crear(doc.IdSensor,
            				  doc.IdDispositivo, 
            				  doc.Descripcion, 
            				  doc.MarcaModelo, 
            				  doc.Tipo, 
            				  doc.Pin, 
            				  doc.EsPinAnalogo,
            				  doc.Habilitado);
            lstModels.push(sensorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("<MONGO>  SensorProvider.GetAll : Error al leer async en mettodo GetAll() error : " + error); });
          }
          return callback(null, lstModels);
        }
      });
  }

  if (_provider.NEDB) {
      var lstModels = [];
      db.Sensor.find({}, function (err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("<NEDB>  SensorProvider.GetAll: Error al leer async en mettodo GetAll() error : " + error);
           return callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var sensorModel = new Models();
            sensorModel.Crear(doc.IdSensor,
            				  doc.IdDispositivo, 
            				  doc.Descripcion, 
            				  doc.MarcaModelo, 
            				  doc.Tipo, 
            				  doc.Pin, 
            				  doc.EsPinAnalogo,
            				  doc.Habilitado);
            lstModels.push(sensorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("<NEDB>  SensorProvider.GetAll: Error al leer async en mettodo GetAll() error : " + error); });
          }
          return callback(null, lstModels);
        }
      });
  }
  else if (_provider.DWEET) {

    throw new Error("<DWEET>  SensorProvider.GetAll: no habilitado para Dweet");
  }

};

function GenerarDweetId(sensor) {
  return _dweet_prefijo + sensor;

};


module.exports = SensorProvider;