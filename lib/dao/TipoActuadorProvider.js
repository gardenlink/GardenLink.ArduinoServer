/*
 * dao.TipoActuadorProvider
 * https://github.com/Gerdenlink
 *
 */

var method = TipoActuadorProvider.prototype;

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



function TipoActuadorProvider(logs, moment, config) {
  console.log("Inicializando TipoActuadorProvider..");
  _logs = logs;
  
    if (config.MONGO.Habilitado == "true") {
      _provider.MONGO = true;
        Models = require("../dto/TipoActuador.js");
        
          if (config.MONGO.Debug) {
	  	_DEBUG = config.MONGO.Debug == "true" ? true : false;
	  	}

      var mongoose = config.MONGO.DataSource, Schema = mongoose.Schema;

      var TipoActuadorSchema = new Schema({
          IdTipoActuador : Number
          , Descripcion : String
      });
      

      MongoModels = mongoose.model('TipoActuador', TipoActuadorSchema)

    }

    if (config.DWEET.Habilitado == "true"){
      _provider.DWEET = true;
      this._dweetClient = new DweetIO();
      Models = require("../dto/TipoActuador.js");
      _dweet_prefijo = config.DWEET.prefijo_TipoActuador;
    }

    if (config.NEDB.Habilitado == "true"){
      _provider.NEDB = true;
      
      if (config.NEDB.Debug) {
	  	_DEBUG = config.NEDB.Debug == "true" ? true : false;
	  	}
      
      db.TipoActuador = new Datastore({ filename: './db/TipoActuador.db', autoload:true});
      db.TipoActuador.ensureIndex({ fieldName: 'IdTipoActuador', unique: true, sparse:true }, function (err) {
        if (err) {
          console.log("<NEDB> TipoActuadorProvider.Constructor : Error al crear el indice: Error: " + err.message);
        }
      });
      Models = require("../dto/TipoActuador.js");
    }
 
}

//Inicializa la base de datos
method.Inicializar = function(config){
	 
	 if (_provider.NEDB){
		 db.TipoActuador.find({}, function (err, docs) {
		
			if (docs.length == 0) {
			     
			     console.log("<NEDB> TipoActuadorProvider.Inicializar : Inicializo base de datos con valores desde archivo de datos iniciales /db/DatosIniciales/TipoActuador.json");
			     
			      var configuracion = require('../../db/DatosIniciales/TipoActuador.json');
			      console.dir(configuracion);
			      async.each(configuracion.tipoactuador, function(item, callback) { 
			
			        var TipoActuadorModel = new Models();
			        TipoActuadorModel.Crear(item.IdTipoActuador,
			        				  item.Descripcion);
			        db.TipoActuador.insert(TipoActuadorModel.Objeto(), function (err, newDoc) {   // Callback is optional 
			        });
			
			      });
			  }
		});
	}
	
	if (_provider.MONGO){
		 MongoModels.find({}, function (err, docs) {
		
			if (docs.length == 0) {
			     
			     console.log("<MONGO> TipoActuadorProvider.Inicializar : Inicializo base de datos con valores desde archivo de datos iniciales /db/DatosIniciales/TipoActuador.json");
			     
			      var configuracion = require('../../db/DatosIniciales/TipoActuador.json');
			      console.dir(configuracion);
			      async.each(configuracion.tipoactuador, function(item, callback) { 
			
			        var TipoActuadorModel = new Models();
			        TipoActuadorModel.Crear(item.IdTipoActuador,
			        				  item.Descripcion);
			        
			        var objMongo = new MongoModels(TipoActuadorModel.Objeto());
	               	objMongo.save(function(err, data) {
			        });
			       
			
			      });
			  }
		});
	}
};


method.Delete = function(IdTipoActuador) {
	 
	 if (_provider.MONGO){
	 	 MongoModels.remove({ IdTipoActuador: IdTipoActuador }, {}, function (err, numRemoved) {
  			if(_DEBUG)
  				console.log("<MONGO> TipoActuador.Delete -> CantEliminados " + numRemoved); 
		});
	 }
	 
	 if (_provider.NEDB){
	 	db.TipoActuador.remove({ IdTipoActuador: IdTipoActuador }, {}, function (err, numRemoved) {
  			if(_DEBUG)
  				console.log("<NEDB> TipoActuador.Delete -> CantEliminados " + numRemoved); 
		});
	 }
};

method.Save = function(IdTipoActuador, Descripcion) {
    
    if (_provider.MONGO) {
          var TipoActuadorModel = new Models();
	      TipoActuadorModel.Crear(IdTipoActuador, Descripcion);
	      
	      if (_DEBUG)
	        console.log(TipoActuadorModel.Objeto());
	
	      if(TipoActuadorModel.Validar(TipoActuadorModel.Objeto())) {
	      MongoModels.findOne({IdTipoActuador : TipoActuadorModel.Objeto().IdTipoActuador}, function (err, data) {
	        if (!data) {
	          objMongo = new MongoModels(TipoActuadorModel.Objeto());
              objMongo.save(function(err, data) {
	          if (_DEBUG)
	            console.log("<MONGO> TipoActuadorProvider.Save : inserto nuevo objeto");
	          });
	        }
	        else
	        {
	          MongoModels.update({ _id : data._id }, {  $set: {
	              IdTipoActuador : TipoActuadorModel.Objeto().IdTipoActuador,
	              Descripcion : TipoActuadorModel.Objeto().Descripcion
	              }
	            }, { multi : true}, function (err, numReplaced) {
	              if (_DEBUG)
	                console.log("<MONGO> TipoActuadorProvider.Save : Remplazados: " + numReplaced);
	            if (err)
	              console.log("<MONGO> TipoActuadorProvider.Save : Error al updatear" + err);
	          });
	        }
	      });
	      }
	      else
	      {
	        if (_DEBUG)
	          console.log("<MONGO> TipoActuadorProvider.Save : No se graba objeto debido a que no pasa la validacion de integridad");
	      }
    }
     
    if (_provider.DWEET) {
      throw new Error("TipoActuador.Save no habilitado para Dweet"); 
    }
	
	  if (_provider.NEDB){
	      var TipoActuadorModel = new Models();
	      TipoActuadorModel.Crear(IdTipoActuador, Descripcion);
	      
	      if (_DEBUG)
	        console.log(TipoActuadorModel.Objeto());
	
	      if(TipoActuadorModel.Validar(TipoActuadorModel.Objeto())) {
	      db.TipoActuador.find({IdTipoActuador : TipoActuadorModel.Objeto().IdTipoActuador}, function (err, data) {
	        if (data.length == 0) {
	          db.TipoActuador.insert(TipoActuadorModel.Objeto(), function (err, newDoc) {   // Callback is optional
	          if (_DEBUG)
	            console.log("<NEDB> TipoActuadorProvider.Save : inserto nuevo objeto");
	          });
	        }
	        else
	        {
	          db.TipoActuador.update({ _id: data[0]._id }, { $set: {
	              IdTipoActuador : TipoActuadorModel.Objeto().IdTipoActuador,
	              Descripcion : TipoActuadorModel.Objeto().Descripcion
	              }
	            }, { multi : true}, function (err, numReplaced) {
	              if (_DEBUG)
	                console.log("<NEDB> TipoActuadorProvider.Save : Remplazados: " + numReplaced);
	            if (err)
	              console.log("<NEDB> TipoActuadorProvider.Save : Error al updatear" + err);
	          });
	        }
	      });
	      }
	      else
	      {
	        if (_DEBUG)
	          console.log("<NEDB> TipoActuadorProvider.Save : No se graba objeto debido a que no pasa la validacion de integridad");
	      }
    }

};


method.GetCollection = function(filter, callback) {

throw new Error("<all>TipoActuador.GetCollection no implementado");

};

method.GetLast = function(filter, callback) {

throw new Error("<ALL>TipoActuador.GetLast no implementado");

};

method.Find = function(filter, callback) {

	if (_provider.NEDB) {
	      var lstModels = [];
	      
	      var filters = {};
	      if (filter.IdTipoActuador)
	      	filters.IdTipoActuador = parseInt(filter.IdTipoActuador);
	      	
	       if (filter.Descripcion)
	      	filters.Descripcion = filter.Descripcion;
	      
	      if (filters.length == 0) {
	      	if (_DEBUG)
	      		console.log("<NEDB> TipoActuadorProvider.Find : no se han seteado filtros"); 
	      }
	      
	      if (_DEBUG)
	      	console.log("<NEDB> TipoActuadorProvider.Find.filters : " + filters.IdTipoActuador);
	      
	      db.TipoActuador.find(filters, function (err, docs) {
	        
	        if (err) {
	           if (_DEBUG) console.log("<NEDB> TipoActuadorProvider.Find : Error al leer async en mettodo Find() error : " + error);
	           return callback(err, lstModels);
	        } 
	        else 
	        {
	          if (docs.length > 0) {
		          async.each(docs, function(doc, cb) { 
		            var TipoActuadorModel = new Models();
		            TipoActuadorModel.Crear(doc.IdTipoActuador,
		            				  doc.Descripcion);
		            				  
		            lstModels.push(TipoActuadorModel.Objeto());
		            
		          }, function(error) { if (_DEBUG) console.log("<NEDB> TipoActuadorProvider.Find : Error al leer async ) error : " + error); });
	          }
	          return callback(null, lstModels[0]);
	        }
	      });
	  }
	  
	  if (_provider.MONGO) {
	      var lstModels = [];
	      
	      var filters = {};
	      if (filter.IdTipoActuador)
	      	filters.IdTipoActuador = parseInt(filter.IdTipoActuador);
	      	
	       if (filter.Descripcion)
	      	filters.Descripcion = filter.Descripcion;
	      
	      if (filters.length == 0) {
	      	if (_DEBUG)
	      		console.log("<MONGO> TipoActuadorProvider.Find : no se han seteado filtros"); 
	      }
	      
	      if (_DEBUG)
	      	console.log("<MONGO> TipoActuadorProvider.Find.filters : " + filters.IdTipoActuador);
	      
	      MongoModels.find(filter).exec(function(err, docs) {
	        
	        if (err) {
	           if (_DEBUG) console.log("<MONGO> TipoActuadorProvider.Find: Error al leer async en mettodo Find() error : " + error);
	           return callback(err, lstModels);
	        } 
	        else 
	        {
	          if (docs.length > 0) {
		          async.each(docs, function(doc, cb) { 
		            var TipoActuadorModel = new Models();
		            TipoActuadorModel.Crear(doc.IdTipoActuador,
		            				  doc.Descripcion);
		            				  
		            lstModels.push(TipoActuadorModel.Objeto());
		            
		          }, function(error) { if (_DEBUG) console.log("<MONGO> TipoActuadorProvider.Find : Error al leer async en mettodo GetAll() error : " + error); });
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
           if (_DEBUG) console.log("<MONGO> TipoActuadorProvider.GetAll : Error al leer async en mettodo GetAll() error : " + error);
           return callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var TipoActuadorModel = new Models();
            TipoActuadorModel.Crear(doc.IdTipoActuador, doc.Descripcion);
            lstModels.push(TipoActuadorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("<MONGO> TipoActuadorProvider.GetAll :  Error al leer async en mettodo GetAll() error : " + error); });
          }
          return callback(null, lstModels);
        }
      });
  }

  if (_provider.NEDB) {
      var lstModels = [];
      db.TipoActuador.find({}, function (err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("<NEDB> TipoActuadorProvider.GetAll :  Error al leer async en mettodo GetAll() error : " + error);
           return callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var TipoActuadorModel = new Models();
            TipoActuadorModel.Crear(doc.IdTipoActuador, doc.Descripcion);
            lstModels.push(TipoActuadorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("<NEDB> TipoActuadorProvider.GetAll : Error al leer async en mettodo GetAll() error : " + error); });
          }
          return callback(null, lstModels);
        }
      });
  }
  else if (_provider.DWEET) {
    throw new Error("TipoActuador.GetAll() no habilitado para Dweet");
  }



};

function GenerarDweetId(TipoActuador) {
  return _dweet_prefijo + TipoActuador;

};


module.exports = TipoActuadorProvider;