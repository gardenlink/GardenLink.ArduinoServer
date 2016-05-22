/*
 * dao.RelayProvider
 * https://github.com/Gerdenlink
 * 
 */

var method = RelayProvider.prototype;

var Models; 
var MongoModels;

var _logs;
var _moment;

var DweetIO = require("node-dweetio");
var _dweetClient;

var _DEBUG = false;

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



function RelayProvider(logs, moment, config) {
  console.log("Inicializando RelayProvider..");
  _logs = logs;
  
    if (config.MONGO.Habilitado == "true") {
      _provider.MONGO = true;
        Models = require("../dto/Relay.js");
        
          if (config.MONGO.Debug) {
	  	_DEBUG = config.MONGO.Debug == "true" ? true : false;
	  	}

      var mongoose = config.MONGO.DataSource, Schema = mongoose.Schema;

      var RelaySchema = new Schema({
           IdRelay : Number
	  , IdDispositivo : String
	  , Descripcion : String
	  , MarcaModelo : String
	  , Tipo : String
	  , Pin : Number
	  , EsPinAnalogo : Boolean
	  , Habilitado : Boolean
	  , Activo : Boolean
	  , EsInverso : Boolean
      });
      

      MongoModels = mongoose.model('Relay', RelaySchema)

    }

    if (config.DWEET.Habilitado == "true"){
      _provider.DWEET = true;
      this._dweetClient = new DweetIO();
      Models = require("../dto/Relay.js");
      _dweet_prefijo = config.DWEET.prefijo_relay;
    }

    if (config.NEDB.Habilitado == "true"){
      _provider.NEDB = true;
      
      if (config.NEDB.Debug) {
	  	_DEBUG = config.NEDB.Debug == "true" ? true : false;
	  	}
      
      db.Relay = new Datastore({ filename: './db/Relay.db', autoload:true});
      db.Relay.ensureIndex({ fieldName: 'IdRelay', unique: true, sparse:true }, function (err) {
        if (err) {
          console.log("<NEDB> RelayProvider.Constructor : Error al crear el indice: Error: " + err.message);
        }
      });
      Models = require("../dto/Relay.js");
    }
 
}


method.Inicializar = function(config){
	 
	 if (_provider.NEDB){
		 db.Relay.find({}, function (err, docs) {
		
			if (docs.length == 0) {
			     
			     console.log("<NEDB> RelayProvider.Inicializar : Inicializo base de datos con valores desde archivo de datos iniciales /db/DatosIniciales/Relay.json");
			     
			      var configuracion = require('../../db/DatosIniciales/Relay.json');
			      console.dir(configuracion);
			      async.each(configuracion.relay, function(item, callback) { 
			
			        var relayModel = new Models();
			        relayModel.Crear(item.IdRelay,
			        				  item.IdDispositivo, 
			        				  item.Descripcion, 
			        				  item.MarcaModelo, 
			        				  item.Tipo,
			        				  item.Pin,
			        				  item.EsPinAnalogo,
			        				  item.Habilitado,
			        				  item.Activo,
			        				  item.EsInverso);
			        db.Relay.insert(relayModel.Objeto(), function (err, newDoc) {   // Callback is optional 
			        });
			
			      });
			  }
		});
	}
	
	
	if (_provider.MONGO)
	{
	
	  MongoModels.find({}, function (err, docs) {
	    if (docs.length == 0) {
	      console.log("<MONGO> RelayProvider.Inicializar() : Inicializo base de datos MONGO con valores desde archivo de datos iniciales /db/DatosIniciales/Relay.json");
	
	        var configuracion = require("../../db/DatosIniciales/Relay.json");
			async.each(configuracion.relay, function(item, callback) { 
				
				        var relayModel = new Models();
				        relayModel.Crear( item.IdRelay,
				        				  item.IdDispositivo, 
				        				  item.Descripcion, 
				        				  item.MarcaModelo, 
				        				  item.Tipo,
				        				  item.Pin,
				        				  item.EsPinAnalogo,
				        				  item.Habilitado,
				        				  item.Activo,
				        				  item.EsInverso);
				
				var objMongo = new MongoModels(relayModel.Objeto());
	                  objMongo.save(function(err, data) {
		                  if (_DEBUG)
		                  {
		                    if (err) { console.log(err);} else {
		                    console.log("<MONGO> RelayProvider.Inicializar: inserto nuevo objeto");
		                    console.log(data);
		                  }
	                  }
	                  // newDoc is the newly inserted document, including its _id
	                  // newDoc has no key called notToBeSaved since its value was undefined
	                  });
	
	    });
	  }
	
	});
	}
};


method.Delete = function(IdRelay) {
	 if (_provider.MONGO) {
	 	 MongoModels.remove({ IdRelay: IdRelay }, {}, function (err, numRemoved) {
  			if(_DEBUG)
  				console.log("<MONGO>: RelayProvider..Delete -> CantEliminados " + numRemoved); 
		});
	 }
	 
	 if (_provider.NEDB){
	 	db.Relay.remove({ IdRelay: IdRelay }, {}, function (err, numRemoved) {
  			if(_DEBUG)
  				console.log("<NEDB> RelayProvider..Delete -> CantEliminados " + numRemoved); 
		});
	 }
};

method.Save = function(IdRelay, IdDispositivo, Descripcion, MarcaModelo, Tipo,Pin,EsPinAnalogo, Habilitado, Activo,EsInverso ) {
    
    if (_provider.MONGO) {
        var relayModel = new Models();
	      relayModel.Crear(IdRelay, IdDispositivo, Descripcion, MarcaModelo, Tipo,Pin,EsPinAnalogo,Habilitado,Activo,EsInverso);
	      
	      if (_DEBUG)
	        console.log("<MONGO> RelayProvider.Save : Objeto que se va a guardar : " + JSON.stringify(relayModel.Objeto()));
	
	      if(relayModel.Validar(relayModel.Objeto())) {
	       MongoModels.findOne({IdRelay : relayModel.Objeto().IdRelay}, function (err, data) {
	        if (!data) {
	         objMongo = new MongoModels(relayModel.Objeto());
                  objMongo.save(function(err, data) {
                  if (_DEBUG)
                    console.log("<MONGO> RelayProvider.Save : inserto nuevo objeto, detalle : " + JSON.stringify(relayModel.Objeto()));
                  // newDoc is the newly inserted document, including its _id
                  // newDoc has no key called notToBeSaved since its value was undefined
                  });
	        }
	        else
	        {
	          MongoModels.update({ _id : data._id }, {  $set: {
	              IdRelay : relayModel.Objeto().IdRelay,
	              IdDispositivo : relayModel.Objeto().IdDispositivo,
	              Descripcion : relayModel.Objeto().Descripcion,
	              MarcaModelo : relayModel.Objeto().MarcaModelo,
	              Tipo : relayModel.Objeto().Tipo,
	              Pin: relayModel.Objeto().Pin,
	              EsPinAnalogo: relayModel.Objeto().EsPinAnalogo,
	              Habilitado: relayModel.Objeto().Habilitado,
	              Activo : relayModel.Objeto().Activo,
	              EsInverso: relayModel.Objeto().EsInverso
	              }
	            }, { multi : true}, function (err, numReplaced) {
	              if (_DEBUG)
	                console.log("<MONGO> RelayProvider.Save : Remplazados: " + JSON.stringify(numReplaced));
	            if (err)
	              console.log("<MONGO> RelayProvider.Save : Error al updatear" + err);
	          });
	        }
	      });
	      }
	      else
	      {
	        if (_DEBUG)
	          console.log("<MONGO> RelayProvider.Save() : No se graba objeto debido a que no pasa la validacion de integridad");
	      }
    }
     
     if (_provider.DWEET) {
      
      throw new Error("relay.Save no habilitado para Dweet"); 
    }

      if (_provider.NEDB){
	      var relayModel = new Models();
	      relayModel.Crear(IdRelay, IdDispositivo, Descripcion, MarcaModelo, Tipo,Pin,EsPinAnalogo,Habilitado,Activo,EsInverso);
	      
	      if (_DEBUG)
	        console.log(relayModel.Objeto());
	
	      if(relayModel.Validar(relayModel.Objeto())) {
	      db.Relay.find({IdRelay : relayModel.Objeto().IdRelay}, function (err, data) {
	        if (data.length == 0) {
	          db.Relay.insert(relayModel.Objeto(), function (err, newDoc) {   // Callback is optional
	          if (_DEBUG)
	            console.log("<NEDB> RelayProvider.Save : inserto nuevo objeto");
	          // newDoc is the newly inserted document, including its _id
	          // newDoc has no key called notToBeSaved since its value was undefined
	          });
	        }
	        else
	        {
	          db.Relay.update({ _id: data[0]._id }, { $set: {
	              IdRelay : relayModel.Objeto().IdRelay,
	              IdDispositivo : relayModel.Objeto().IdDispositivo,
	              Descripcion : relayModel.Objeto().Descripcion,
	              MarcaModelo : relayModel.Objeto().MarcaModelo,
	              Tipo : relayModel.Objeto().Tipo,
	              Pin: relayModel.Objeto().Pin,
	              EsPinAnalogo: relayModel.Objeto().EsPinAnalogo,
	              Habilitado: relayModel.Objeto().Habilitado,
	              Activo : relayModel.Objeto().Activo,
	              EsInverso: relayModel.Objeto().EsInverso
	              }
	            }, { multi : true}, function (err, numReplaced) {
	              if (_DEBUG)
	                console.log("<NEDB> RelayProvider.Save : Remplazados: " + numReplaced);
	            if (err)
	              console.log("<NEDB> RelayProvider.Save : Error al updatear" + err);
	          });
	        }
	      });
	      }
	      else
	      {
	        if (_DEBUG)
	          console.log("<NEDB> RelayProvider.Save() : No se graba objeto debido a que no pasa la validacion de integridad");
	      }
    }

};


method.GetCollection = function(filter, callback) {

 if (_provider.MONGO) {
    
      var lstModels = [];
      
      var filters = {};
      if (filter.IdRelay)
      	filters.IdRelay = parseInt(filter.IdRelay);
      	
      if (filter.IdDispositivo)
      	filters.IdDispositivo = filter.IdDispositivo;
      
       MongoModels.find(filters, function (err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("<MONGO> RelayProvider.GetCollection : Error al leer async en mettodo GetAll() error : " + error);
           return callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var relayModel = new Models();
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
            				 
			if (_DEBUG) console.dir("<MONGO> RelayProvider.GetCollection : Objeto Encontrado : " + relayModel.Objeto());
			
            lstModels.push(relayModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("<MONGO> RelayProvider.GetCollection : Error al leer async en mettodo GetAll() error : " + error); });
          }
          return callback(null, lstModels);
        }
      });
  }

  if (_provider.NEDB) {
      var lstModels = [];
      
      var filters = {};
      if (filter.IdRelay)
      	filters.IdRelay = parseInt(filter.IdRelay);
      	
      if (filter.IdDispositivo)
      	filters.IdDispositivo = filter.IdDispositivo;
      
      db.Relay.find(filters, function (err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("<NEDB> RelayProvider.GetCollection : Error al leer async en mettodo GetAll() error : " + error);
           return callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var relayModel = new Models();
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
            				 
           	if (_DEBUG) console.dir("<NEDB> RelayProvider.GetCollection : Objeto Encontrado : " + relayModel.Objeto());
           	
            lstModels.push(relayModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("<NEDB> RelayProvider.GetCollection : Error al leer async en mettodo GetAll() error : " + error); });
          }
          return callback(null, lstModels);
        }
      });
  }
  else if (_provider.DWEET) {

	
    throw new Error("relay.GetCollection() no habilitado para Dweet");
  }



};

method.GetLast = function(filter, callback) {

  if (_provider.MONGO) {

    console.log("<MONGO> RelayProvider.GetLast :  no implementado para Mongo");
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

    console.log("<NEDB> relayProvider.GetLast no implementado para NEDB");
  }



};

method.Find = function(filter, callback) {

	if (_provider.NEDB) {
	      var lstModels = [];
	      
	      var filters = {};
	      if (filter.IdRelay)
	      	filters.IdRelay = parseInt(filter.IdRelay);
	      
	      if (filters.length == 0) {
	      	if (_DEBUG)
	      		console.log("<NEDB> RelayProvider.Find :  no se han seteado filtros"); 
	      }
	      
	      db.Relay.find(filters, function (err, docs) {
	        
	        if (err) {
	           if (_DEBUG) console.log("<NEDB> RelayProvider.Find : Error al leer async en mettodo Find() error : " + error);
	           return callback(err, lstModels);
	        } 
	        else 
	        {
	          if (docs.length > 0) {
		          async.each(docs, function(doc, cb) { 
		            var relayModel = new Models();
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
		            				  
		           if (_DEBUG) console.dir("<NEDB> RelayProvider.Find : Objeto Encontrado : " + relayModel.Objeto());
		            				  
		            lstModels.push(relayModel.Objeto());
		            
		          }, function(error) { if (_DEBUG) console.log("<NEDB> RelayProvider.Find : Error al leer async en mettodo GetAll() error : " + error); });
	          }
	          return callback(null, lstModels[0]);
	        }
	      });
	  }
	  
	  if (_provider.MONGO) {
	
	    var lstModels = [];
	    
	     var filters = {};
	      if (filter.IdRelay)
	      	filters.IdRelay = parseInt(filter.IdRelay);
	      
	      if (filters.length == 0) {
	      	if (_DEBUG)
	      		console.log("<MONGO> RelayProvider.Find: no se han seteado filtros"); 
	      }
	    
	    MongoModels.find(filter).exec(function(err, docs) {
	      if (err) {
	           if (_DEBUG) console.log("<MONGO> RelayProvider.Find : Error al leer async en mettodo Find() error : " + error);
	           return callback(err, lstModels);
	        } 
	        else 
	        {
	          if (docs.length > 0) {
		          async.each(docs, function(doc, cb) { 
		            var relayModel = new Models();
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
		            				  
		            if (_DEBUG) console.dir("<MONGO> RelayProvider.Find : Objeto Encontrado : " + relayModel.Objeto());
		            				  
		            lstModels.push(relayModel.Objeto());
		            
		          }, function(error) { if (_DEBUG) console.log("<MONGO> RelayProvider.Find : Error al leer async en mettodo Find() error : " + error); });
	          }
	          return callback(null, lstModels[0]);
	        }
	     });
	  }

};



method.GetAll = function(callback) {

 if (_provider.MONGO) {
   
     var lstModels = [];
      MongoModels.find({}).exec(function(err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("<MONGO> RelayProvider.GetAll: Error al leer async en mettodo GetAll() error : " + error);
           return callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var relayModel = new Models();
            
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
            lstModels.push(relayModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("<MONGO> RelayProvider.GetAll : Error al leer async en mettodo GetAll() error : " + error); });
          }
          if (_DEBUG)  {
                    console.log("<MONGO> RelayProvider.GetAll : Resultados : ");
          			console.dir(lstModels);
          }
          return callback(null, lstModels);
        }
      });
  }

  if (_provider.NEDB) {
      var lstModels = [];
      db.Relay.find({}, function (err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("<MONGO> RelayProvider.GetAll : Error al leer async en mettodo GetAll() error : " + error);
           return callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var relayModel = new Models();
            
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
            
            lstModels.push(relayModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log(" <MONGO> RelayProvider.GetAll : Error al leer async en mettodo GetAll() error : " + error); });
          }
          return callback(null, lstModels);
        }
      });
  }
  else if (_provider.DWEET) {

	
    throw new Error("relay.GetAll() no habilitado para Dweet");
  }

};

function GenerarDweetId(relay) {
  return _dweet_prefijo + relay;

};


module.exports = RelayProvider;