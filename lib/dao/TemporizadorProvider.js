/*
 * dao.TemporizadorProvider
 * https://github.com/Gerdenlink
 *
 */

var method = TemporizadorProvider.prototype;

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



function TemporizadorProvider(logs, moment, config) {
  console.log("Inicializando TemporizadorProvider ..");
  _logs = logs;
  
    if (config.MONGO.Habilitado == "true") {
      _provider.MONGO = true;
        Models = require("../dto/Temporizador.js");
        
          if (config.MONGO.Debug) {
	  	_DEBUG = config.MONGO.Debug == "true" ? true : false;
	  	}

      var mongoose = config.MONGO.DataSource, Schema = mongoose.Schema;

      var TemporizadorSchema = new Schema({
          IdTemporizador : Number
          , IdDispositivo : String
          , IdTipoActuador : Number
          , IdActuador      : Number
          , Descripcion : String
		  , DuracionMinutos : Number
		  , NumeroDias : Number
		  , HorasActivacion : String
		  , Habilitado : Boolean
      });
      

      MongoModels = mongoose.model('Temporizador', TemporizadorSchema)


      //throw new Error("No implementado");
    }

    if (config.DWEET.Habilitado == "true"){
      _provider.DWEET = true;
      this._dweetClient = new DweetIO();
      Models = require("../dto/Temporizador.js");
      _dweet_prefijo = config.DWEET.prefijo_Temporizador;
    }

    if (config.NEDB.Habilitado == "true"){
      _provider.NEDB = true;
      
      if (config.NEDB.Debug) {
	  	_DEBUG = config.NEDB.Debug == "true" ? true : false;
	  	}
      
      db.Temporizador = new Datastore({ filename: './db/Temporizador.db', autoload:true});
      db.Temporizador.ensureIndex({ fieldName: 'IdTemporizador', unique: true, sparse:true }, function (err) {
        if (err) {
          console.log("<NEDB> TemporizadorProvider.Constructor : Error al crear el indice: Error: " + err.message);
        }
      });
      Models = require("../dto/Temporizador.js");
    }
 
}


method.Inicializar = function(config){
	 
	 if (_provider.NEDB){
		 db.Temporizador.find({}, function (err, docs) {
		
			if (docs.length == 0) {
			     
			     console.log("<NEDB> TemporizadorProvider.Inicializar : Inicializo base de datos con valores desde archivo de datos iniciales /db/DatosIniciales/Temporizador.json");
			     
			      var configuracion = require('../../db/DatosIniciales/Temporizador.json');
			      console.dir(configuracion);
			      async.each(configuracion.temporizador, function(item, callback) { 
			
			        var TemporizadorModel = new Models();
			        TemporizadorModel.Crear(parseInt(item.IdTemporizador),
			        				  item.IdDispositivo, 
			        				  parseInt(item.IdTipoActuador), 
			        				  parseInt(item.IdActuador), 
			        				  item.Descripcion,
			        				  parseInt(item.DuracionMinutos),
			        				  parseInt(item.NumeroDias),
			        				  item.HorasActivacion,
			        				  item.Habilitado);
			        				  
			        db.Temporizador.insert(TemporizadorModel.Objeto(), function (err, newDoc) {   // Callback is optional 
			        });
			
			      });
			  }
		});
	}
	
	if (_provider.MONGO){
		  MongoModels.find({}, function (err, docs) {
		
			if (docs.length == 0) {
			     
			     console.log("<MONGO> TemporizadorProvider.Inicializar : Inicializo base de datos con valores desde archivo de datos iniciales /db/DatosIniciales/Temporizador.json");
			     
			      var configuracion = require('../../db/DatosIniciales/Temporizador.json');
			      console.dir(configuracion);
			      async.each(configuracion.temporizador, function(item, callback) { 
			
			        var TemporizadorModel = new Models();
			        TemporizadorModel.Crear(parseInt(item.IdTemporizador),
			        				  item.IdDispositivo, 
			        				  parseInt(item.IdTipoActuador), 
			        				  parseInt(item.IdActuador), 
			        				  item.Descripcion,
			        				  parseInt(item.DuracionMinutos),
			        				  parseInt(item.NumeroDias),
			        				  item.HorasActivacion,
			        				  item.Habilitado);
			        				  
			        var objMongo = new MongoModels(TemporizadorModel.Objeto());
	               	objMongo.save(function(err, data) {
			        });
			  });
			  }
		});
	}
	
};


method.Delete = function(IdTemporizador) {
	 
	 if (_provider.MONGO) {
	 	 MongoModels.remove({ IdTemporizador: IdTemporizador }, {}, function (err, numRemoved) {
  			if(_DEBUG)
  				console.log("<MONGO>: Temporizador.Delete -> CantEliminados " + numRemoved); 
		});
	 }
	 
	 
	 if (_provider.NEDB){
	 	db.Temporizador.remove({ IdTemporizador: IdTemporizador }, {}, function (err, numRemoved) {
  			if(_DEBUG)
  				console.log("<NEDB> Temporizador.Delete -> CantEliminados " + numRemoved); 
		});
	 }
};

method.Save = function(IdTemporizador, IdDispositivo, IdTipoActuador, IdActuador, Descripcion,DuracionMinutos,NumeroDias, HorasActivacion,Habilitado ) {
    
    
    if (_provider.MONGO) {
       var TemporizadorModel = new Models();
	      
	       TemporizadorModel.Crear(IdTemporizador,
			        			   IdDispositivo, 
			        			   IdTipoActuador, 
			        			   IdActuador, 
			        			   Descripcion,
			        			   DuracionMinutos,
			        			   NumeroDias,
			        			   HorasActivacion,
			        			   Habilitado);
	      
	      if (_DEBUG)
	        console.log(TemporizadorModel.Objeto());
	
	      if(TemporizadorModel.Validar(TemporizadorModel.Objeto())) {
	      MongoModels.findOne({IdTemporizador : TemporizadorModel.Objeto().IdTemporizador}, function (err, data) {
	      
	        if (!data) {
	         objMongo = new MongoModels(TemporizadorModel.Objeto());
              objMongo.save(function(err, data) {
	          if (_DEBUG)
	            console.log("<MONGO> TemporizadorProvider.Save : inserto nuevo objeto");
	          // newDoc is the newly inserted document, including its _id
	          // newDoc has no key called notToBeSaved since its value was undefined
	          });
	        }
	        else
	        {
	        
	              MongoModels.update({ _id : data._id }, {  $set: {
		              IdTemporizador : TemporizadorModel.Objeto().IdTemporizador,
		              IdDispositivo : TemporizadorModel.Objeto().IdDispositivo,
		              IdTipoActuador : TemporizadorModel.Objeto().IdTipoActuador,
		              IdActuador : TemporizadorModel.Objeto().IdActuador,
		              Descripcion : TemporizadorModel.Objeto().Descripcion,
		              DuracionMinutos: TemporizadorModel.Objeto().DuracionMinutos,
		              NumeroDias: TemporizadorModel.Objeto().NumeroDias,
		              HorasActivacion: TemporizadorModel.Objeto().HorasActivacion,
		              Habilitado: TemporizadorModel.Objeto().Habilitado
	              }
	            }, { multi : true}, function (err, numReplaced) {
	              if (_DEBUG)
	                console.log("<MONGO> TemporizadorProvider.Save : Remplazados: " + numReplaced);
	            if (err)
	              console.log("<MONGO> TemporizadorProvider.Save : Error al updatear" + err);
	          });
	        }
	      });
	      }
	      else
	      {
	        if (_DEBUG)
	          console.log("<MONGO> TemporizadorProvider.Save :  No se graba objeto debido a que no pasa la validacion de integridad");
	      }
    }
     
     if (_provider.DWEET) {
      
      throw new Error("Temporizador.Save no habilitado para Dweet"); 
    }

      if (_provider.NEDB){
	      var TemporizadorModel = new Models();
	      
	       TemporizadorModel.Crear(IdTemporizador,
			        			   IdDispositivo, 
			        			   IdTipoActuador, 
			        			   IdActuador, 
			        			   Descripcion,
			        			   DuracionMinutos,
			        			   NumeroDias,
			        			   HorasActivacion,
			        			   Habilitado);
	      
	      if (_DEBUG)
	        console.log(TemporizadorModel.Objeto());
	
	      if(TemporizadorModel.Validar(TemporizadorModel.Objeto())) {
	      db.Temporizador.find({IdTemporizador : TemporizadorModel.Objeto().IdTemporizador}, function (err, data) {
	        if (data.length == 0) {
	          db.Temporizador.insert(TemporizadorModel.Objeto(), function (err, newDoc) {   // Callback is optional
	          if (_DEBUG)
	            console.log("<NEDB> TemporizadorProvider.Save :inserto nuevo objeto");
	          // newDoc is the newly inserted document, including its _id
	          // newDoc has no key called notToBeSaved since its value was undefined
	          });
	        }
	        else
	        {
	        
	              db.Temporizador.update({ _id: data[0]._id }, { $set: {
		              IdTemporizador : TemporizadorModel.Objeto().IdTemporizador,
		              IdDispositivo : TemporizadorModel.Objeto().IdDispositivo,
		              IdTipoActuador : TemporizadorModel.Objeto().IdTipoActuador,
		              IdActuador : TemporizadorModel.Objeto().IdActuador,
		              Descripcion : TemporizadorModel.Objeto().Descripcion,
		              DuracionMinutos: TemporizadorModel.Objeto().DuracionMinutos,
		              NumeroDias: TemporizadorModel.Objeto().NumeroDias,
		              HorasActivacion: TemporizadorModel.Objeto().HorasActivacion,
		              Habilitado: TemporizadorModel.Objeto().Habilitado
	              }
	            }, { multi : true}, function (err, numReplaced) {
	              if (_DEBUG)
	                console.log("<NEDB> TemporizadorProvider.Save : Remplazados: " + numReplaced);
	            if (err)
	              console.log("<NEDB> TemporizadorProvider.Save : Error al updatear" + err);
	          });
	        }
	      });
	      }
	      else
	      {
	        if (_DEBUG)
	          console.log("TemporizadorProvider.Save() : No se graba objeto debido a que no pasa la validacion de integridad");
	      }
    }

};


method.GetCollection = function(filter, callback) {

 if (_provider.MONGO) {
   
      var lstModels = [];
      var filters = {};
      if (filter.IdTemporizador)
      	filters.IdTemporizador = filter.IdTemporizador;
      
      if (filter.IdTipoActuador)
      	filters.IdTipoActuador = filter.IdTipoActuador;
      	
      if (filter.IdDispositivo)
      	filters.IdDispositivo = filter.IdDispositivo;
      	
      if (filter.IdActuador)
      	filters.IdActuador = filter.IdActuador;
      
       if (filters.length == 0) {
	      	if (_DEBUG)
	      		console.log("<MONGO> TemporizadorProvider.GetCollection :  no se han seteado filtros"); 
	      }
      
      MongoModels.find(filters, function (err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("<MONGO> TemporizadorProvider.GetCollection : Error al leer async en mettodo GetAll() error : " + error);
           return callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var TemporizadorModel = new Models();
            
              TemporizadorModel.Crear(doc.IdTemporizador,
			        				  doc.IdDispositivo, 
			        				  doc.IdTipoActuador, 
			        				  doc.IdActuador, 
			        				  doc.Descripcion,
			        				  doc.DuracionMinutos,
			        				  doc.NumeroDias,
			        				  doc.HorasActivacion,
			        				  doc.Habilitado);
			if (_DEBUG)			        				  
            	console.log("<MONGO> TemporizadorProvider.GetCollection : : " + TemporizadorModel.Objeto());
            lstModels.push(TemporizadorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("<MONGO> TemporizadorProvider.GetCollection : Error al leer async en mettodo GetAll() error : " + error); });
          }
          return callback(null, lstModels);
        }
      });
  }
  else if (_provider.DWEET) {
    
    throw new Error("Temporizador.GetCollection() no habilitado para Dweet");
  }
  

  if (_provider.NEDB) {
      var lstModels = [];
      var filters = {};
      if (filter.IdTemporizador)
      	filters.IdTemporizador = filter.IdTemporizador;
      
      if (filter.IdTipoActuador)
      	filters.IdTipoActuador = filter.IdTipoActuador;
      	
      if (filter.IdDispositivo)
      	filters.IdDispositivo = filter.IdDispositivo;
      	
      if (filter.IdActuador)
      	filters.IdActuador = filter.IdActuador;
      
       if (filters.length == 0) {
	      	if (_DEBUG)
	      		console.log("<NEDB> TemporizadorProvider.GetCollection : no se han seteado filtros"); 
	      }
      
      db.Temporizador.find(filters, function (err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("<NEDB> TemporizadorProvider.GetCollection : Error al leer async  error : " + error);
           return callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var TemporizadorModel = new Models();
            
              TemporizadorModel.Crear(doc.IdTemporizador,
			        				  doc.IdDispositivo, 
			        				  doc.IdTipoActuador, 
			        				  doc.IdActuador, 
			        				  doc.Descripcion,
			        				  doc.DuracionMinutos,
			        				  doc.NumeroDias,
			        				  doc.HorasActivacion,
			        				  doc.Habilitado);
			if (_DEBUG)			        				  
            	console.log("<NEDB> TemporizadorProvider.GetCollection : " + TemporizadorModel.Objeto());
            lstModels.push(TemporizadorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("<NEDB> TemporizadorProvider.GetCollection : Error al leer async en mettodo GetAll() error : " + error); });
          }
          return callback(null, lstModels);
        }
      });
  }
  else if (_provider.DWEET) {
    
    throw new Error("Temporizador.GetCollection() no habilitado para Dweet");
  }



};


method.GetAll = function(callback) {

 if (_provider.MONGO) {
   
      var lstModels = [];
      MongoModels.find({}).exec(function(err, docs) {
      
        
        if (err) {
           if (_DEBUG) console.log("<MONGO> TemporizadorProvider.GetAll : Error al leer async en mettodo GetAll() error : " + error);
           return callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var TemporizadorModel = new Models();
            
              TemporizadorModel.Crear(doc.IdTemporizador,
			        				  doc.IdDispositivo, 
			        				  doc.IdTipoActuador, 
			        				  doc.IdActuador, 
			        				  doc.Descripcion,
			        				  doc.DuracionMinutos,
			        				  doc.NumeroDias,
			        				  doc.HorasActivacion,
			        				  doc.Habilitado);
			if (_DEBUG)			        				  
            	console.log("<MONGO> TemporizadorProvider.GetAll : " + TemporizadorModel.Objeto());
            lstModels.push(TemporizadorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("<MONGO> TemporizadorProvider.GetAll : Error al leer async en mettodo GetAll() error : " + error); });
          }
          return callback(null, lstModels);
        }
      });
  }

  if (_provider.NEDB) {
      var lstModels = [];
      db.Temporizador.find({}, function (err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("<NEDB> TemporizadorProvider.GetAll : Error al leer async en mettodo GetAll() error : " + error);
           return callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var TemporizadorModel = new Models();
            
              TemporizadorModel.Crear(doc.IdTemporizador,
			        				  doc.IdDispositivo, 
			        				  doc.IdTipoActuador, 
			        				  doc.IdActuador, 
			        				  doc.Descripcion,
			        				  doc.DuracionMinutos,
			        				  doc.NumeroDias,
			        				  doc.HorasActivacion,
			        				  doc.Habilitado);
			if (_DEBUG)			        				  
            	console.log("<NEDB> TemporizadorProvider.GetAll : : " + TemporizadorModel.Objeto());
            lstModels.push(TemporizadorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("<NEDB> TemporizadorProvider.GetAll : Error al leer async en mettodo GetAll() error : " + error); });
          }
          return callback(null, lstModels);
        }
      });
  }
  else if (_provider.DWEET) {

	
    throw new Error("Temporizador.GetAll() no habilitado para Dweet");
  }



};


method.GetLast = function(filter, callback) {

  if (_provider.MONGO) {

    console.log("<MONGO>: TemporizadorProvider.GetLast no implementado para Mongo");
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

    console.log("<NEDB> TemporizadorProvider.GetLast no implementado para NEDB");
  }

};



method.Find = function(filter, callback) {

	if (_provider.NEDB) {
	      var lstModels = [];
	      var filters = {};
	      if (filter.IdTemporizador)
	      	filters.IdTemporizador = parseInt(filter.IdTemporizador);
	      	
	      console.log(filter);
	      console.log(filters);
	      
	      if (filters.length == 0) {
	      	if (_DEBUG)
	      		console.log("<NEDB> TemporizadorProvider.Find :  no se han seteado filtros"); 
	      }
	      
	      db.Temporizador.find(filters, function (err, docs) {
	        
	        if (err) {
	           if (_DEBUG) console.log("<NEDB> TemporizadorProvider.Find : Error al leer async en mettodo Find() error : " + error);
	           return callback(err, lstModels);
	        } 
	        else 
	        {
	          console.log(docs.length);
	          if (docs.length > 0) {
		          async.each(docs, function(doc, cb) { 
		            var TemporizadorModel = new Models();
		           TemporizadorModel.Crear(doc.IdTemporizador,
			        				  doc.IdDispositivo, 
			        				  doc.IdTipoActuador, 
			        				  doc.IdActuador, 
			        				  doc.Descripcion,
			        				  doc.DuracionMinutos,
			        				  doc.NumeroDias,
			        				  doc.HorasActivacion,
			        				  doc.Habilitado);
		            				  
		            lstModels.push(TemporizadorModel.Objeto());
		            
		          }, function(error) { if (_DEBUG) console.log("<NEDB> TemporizadorProvider.Find : Error al leer async en mettodo GetAll() error : " + error); });
	          }
	          return callback(null, lstModels[0]);
	        }
	      });
	  }
	  
	  if (_provider.MONGO) {
	      var lstModels = [];
	      var filters = {};
	      if (filter.IdTemporizador)
	      	filters.IdTemporizador = parseInt(filter.IdTemporizador);
	      	
	      console.log(filter);
	      console.log(filters);
	      
	      if (filters.length == 0) {
	      	if (_DEBUG)
	      		console.log("<MONGO> TemporizadorProvider.Find : no se han seteado filtros"); 
	      }
	      
	      MongoModels.find(filter).exec(function(err, docs) {
	        
	        if (err) {
	           if (_DEBUG) console.log("<MONGO> TemporizadorProvider.Find : Error al leer async en mettodo Find() error : " + error);
	           return callback(err, lstModels);
	        } 
	        else 
	        {
	          console.log(docs.length);
	          if (docs.length > 0) {
		          async.each(docs, function(doc, cb) { 
		            var TemporizadorModel = new Models();
		           TemporizadorModel.Crear(doc.IdTemporizador,
			        				  doc.IdDispositivo, 
			        				  doc.IdTipoActuador, 
			        				  doc.IdActuador, 
			        				  doc.Descripcion,
			        				  doc.DuracionMinutos,
			        				  doc.NumeroDias,
			        				  doc.HorasActivacion,
			        				  doc.Habilitado);
		            				  
		            lstModels.push(TemporizadorModel.Objeto());
		            
		          }, function(error) { if (_DEBUG) console.log("<MONGO> TemporizadorProvider.Find : Error al leer async error : " + error); });
	          }
	          return callback(null, lstModels[0]);
	        }
	      });
	  }

};

function GenerarDweetId(Temporizador) {
  return _dweet_prefijo + Temporizador;

};


module.exports = TemporizadorProvider;