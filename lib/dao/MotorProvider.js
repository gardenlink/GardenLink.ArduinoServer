/*
 * dao.MotorProvider
 * https://github.com/Gerdenlink
 * 
 */

var method = MotorProvider.prototype;

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



function MotorProvider(logs, moment, config) {
  console.log("Inicializando MotorProvider..");
  _logs = logs;
  
    if (config.MONGO.Habilitado == "true") {
      _provider.MONGO = true;
        Models = require("../dto/Motor.js");
        
        if (config.MONGO.Debug) {
	  	_DEBUG = config.MONGO.Debug == "true" ? true : false;
	  	}

      var mongoose = config.MONGO.DataSource, Schema = mongoose.Schema;

      var MotorSchema = new Schema({
           IdMotor : Number
		  , IdDispositivo : String
		  , Descripcion : String
		  , MarcaModelo : String
		  , Tipo : String
		  , Pin : String
		  , EsPinAnalogo : Boolean
		  , Habilitado : Boolean
		  , Posicion : Number
		  , DescripcionPosicion : String
		  , Accion : String
		  , Estado : Number
      });
      

      MongoModels = mongoose.model('Motor', MotorSchema)

    }

    if (config.DWEET.Habilitado == "true"){
      _provider.DWEET = true;
      this._dweetClient = new DweetIO();
      Models = require("../dto/Motor.js");
      _dweet_prefijo = config.DWEET.prefijo_Motor;
    }

    if (config.NEDB.Habilitado == "true"){
      _provider.NEDB = true;
      
      if (config.NEDB.Debug) {
	  	_DEBUG = config.NEDB.Debug == "true" ? true : false;
	  	}
      
      db.Motor = new Datastore({ filename: './db/Motor.db', autoload:true});
      db.Motor.ensureIndex({ fieldName: 'IdMotor', unique: true, sparse:true }, function (err) {
        if (err) {
          console.log("<NEDB> MotorProvider.Constructor : Error al crear el indice: Error: " + err.message);
        }
      });
      Models = require("../dto/Motor.js");
    }
 
}


method.Inicializar = function(config){
	 
	 if (_provider.NEDB){
		 db.Motor.find({}, function (err, docs) {
		
			if (docs.length == 0) {
			     
			     console.log("<NEDB> MotorProvider.Inicializar : Inicializo base de datos con valores desde archivo de datos iniciales /db/DatosIniciales/Motor.json");
			     
			      var configuracion = require('../../db/DatosIniciales/Motor.json');
			      console.dir(configuracion);
			      async.each(configuracion.motor, function(item, callback) { 
			
			        var MotorModel = new Models();
			        MotorModel.Crear( item.IdMotor
									  , item.IdDispositivo
									  , item.Descripcion
									  , item.MarcaModelo
									  , item.Tipo
									  , item.Pin
									  , item.EsPinAnalogo
									  , item.Habilitado
									  , item.Posicion
									  , item.Accion
									  , item.Estado);
			        db.Motor.insert(MotorModel.Objeto(), function (err, newDoc) {   // Callback is optional 
			        });
			
			      });
			  }
		});
	}
	
	
if (_provider.MONGO)
{

  MongoModels.find({}, function (err, docs) {
    if (docs.length == 0) {
      console.log("<MONGO> MotorProvider.Inicializar : Inicializo base de datos MONGO con valores desde archivo de datos iniciales /db/DatosIniciales/Motor.json");

        var configuracion = require("../../db/DatosIniciales/Motor.json");
		async.each(configuracion.motor, function(item, callback) { 
			
			        var MotorModel = new Models();
			        MotorModel.Crear( item.IdMotor
									  , item.IdDispositivo
									  , item.Descripcion
									  , item.MarcaModelo
									  , item.Tipo
									  , item.Pin
									  , item.EsPinAnalogo
									  , item.Habilitado
									  , item.Posicion
									  , item.Accion
									  , item.Estado);
			
			var objMongo = new MongoModels(MotorModel.Objeto());
                  objMongo.save(function(err, data) {
	                  if (_DEBUG)
	                  {
	                    if (err) { console.log(err);} else {
	                    console.log("<MONGO> MotorProvider.Inicializar: inserto nuevo objeto");
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


method.Delete = function(IdMotor) {
	 if (_provider.NEDB){
	 	db.Motor.remove({ IdMotor: IdMotor }, {}, function (err, numRemoved) {
  			if(_DEBUG)
  				console.log("<NEDB> MotorProvider.Delete -> CantEliminados " + numRemoved); 
		});
	 }
	 
	  if (_provider.MONGO) {
	 	 MongoModels.remove({ IdMotor: IdMotor }, {}, function (err, numRemoved) {
  			if(_DEBUG)
  				console.log("<MONGO>: MotorProvider.Delete -> CantEliminados " + numRemoved); 
		});
	 }
};

method.Save = function(IdMotor, IdDispositivo, Descripcion, MarcaModelo, Tipo,Pin,EsPinAnalogo, Habilitado,Posicion,Accion,Estado ) {
    
        if (_provider.MONGO) {
        var MotorModel = new Models();
        	      MotorModel.Crear( IdMotor
						  , IdDispositivo
						  , Descripcion
						  , MarcaModelo
						  , Tipo
						  , Pin
						  , EsPinAnalogo
						  , Habilitado
						  , Posicion
						  , Accion
						  , Estado);
        
         if(MotorModel.Validar(MotorModel.Objeto())) {
              
              MongoModels.findOne({IdMotor : MotorModel.Objeto().IdMotor}, function (err, data) {

                if (!data) {
                  objMongo = new MongoModels(MotorModel.Objeto());
                  objMongo.save(function(err, data) {
                  if (_DEBUG)
                    console.log("<MONGO> MotorProvider.Save : inserto nuevo objeto");
                  // newDoc is the newly inserted document, including its _id
                  // newDoc has no key called notToBeSaved since its value was undefined
                  });
                }
                else
                {
                  
                  MongoModels.update({ _id : data._id }, {  $set: {
                      IdMotor : MotorModel.Objeto().IdMotor,
		              IdDispositivo : MotorModel.Objeto().IdDispositivo,
		              Descripcion : MotorModel.Objeto().Descripcion,
		              MarcaModelo : MotorModel.Objeto().MarcaModelo,
		              Tipo : MotorModel.Objeto().Tipo,
		              Pin: MotorModel.Objeto().Pin,
		              EsPinAnalogo: MotorModel.Objeto().EsPinAnalogo,
		              Habilitado: MotorModel.Objeto().Habilitado,
		              Posicion: MotorModel.Objeto().Posicion,
		              DescripcionPosicion : MotorModel.Objeto().DescripcionPosicion,
		              Accion : MotorModel.Objeto().Accion,
		              Estado : MotorModel.Objeto().Estado
                    }
                    }, function (err, numReplaced) {
                      if (_DEBUG)
                        console.dir(numReplaced);
                    if (err)
                      console.log("<MONGO> MotorProvider.Save : Error al updatear" + err);
                  });

                }
              });
              }
              else
              {
                if (_DEBUG)
                  console.log("<MONGO> MotorProvider.Save() : No se graba objeto debido a que no pasa la validacion de integridad");
              }


    }

     
     if (_provider.DWEET) {
      
      throw new Error("Motor.Save no habilitado para Dweet"); 
    }

      if (_provider.NEDB){
	      var MotorModel = new Models();
	      MotorModel.Crear( IdMotor
						  , IdDispositivo
						  , Descripcion
						  , MarcaModelo
						  , Tipo
						  , Pin
						  , EsPinAnalogo
						  , Habilitado
						  , Posicion
						  , Accion
						  , Estado);
	      
	      if (_DEBUG)
	        console.log(MotorModel.Objeto());
	
	      if(MotorModel.Validar(MotorModel.Objeto())) {
	      db.Motor.find({IdMotor : MotorModel.Objeto().IdMotor}, function (err, data) {
	        if (data.length == 0) {
	          db.Motor.insert(MotorModel.Objeto(), function (err, newDoc) {   // Callback is optional
	          if (_DEBUG)
	            console.log("<NEDB> MotorProvider.Save : inserto nuevo objeto");
	          // newDoc is the newly inserted document, including its _id
	          // newDoc has no key called notToBeSaved since its value was undefined
	          });
	        }
	        else
	        {
	          db.Motor.update({ _id: data[0]._id }, { $set: {
	              IdMotor : MotorModel.Objeto().IdMotor,
	              IdDispositivo : MotorModel.Objeto().IdDispositivo,
	              Descripcion : MotorModel.Objeto().Descripcion,
	              MarcaModelo : MotorModel.Objeto().MarcaModelo,
	              Tipo : MotorModel.Objeto().Tipo,
	              Pin: MotorModel.Objeto().Pin,
	              EsPinAnalogo: MotorModel.Objeto().EsPinAnalogo,
	              Habilitado: MotorModel.Objeto().Habilitado,
	              Posicion: MotorModel.Objeto().Posicion,
	              DescripcionPosicion : MotorModel.Objeto().DescripcionPosicion,
	              Accion : MotorModel.Objeto().Accion,
	              Estado : MotorModel.Objeto().Estado
	              }
	            }, { multi : true}, function (err, numReplaced) {
	              if (_DEBUG)
	                console.log("<NEDB> MotorProvider.Save : Remplazados: " + numReplaced);
	            if (err)
	              console.log("<NEDB> MotorProvider.Save : Error al updatear" + err);
	          });
	        }
	      });
	      }
	      else
	      {
	        if (_DEBUG)
	          console.log("<NEDB> MotorProvider.Save : No se graba objeto debido a que no pasa la validacion de integridad");
	      }
    }

};


method.GetCollection = function(filter, callback) {

 if (_provider.MONGO) {
    
     var lstModels = [];
      
      var filters = {};
      if (filter.IdMotor)
      	filters.IdMotor = parseInt(filter.IdMotor);
      	
      if (filter.IdDispositivo)
      	filters.IdDispositivo = filter.IdDispositivo;
      
      
      MongoModels.find(filters, function (err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("<MONGO> MotorProvider.GetCollection : Error al leer async error : " + error);
           return callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var MotorModel = new Models();
             MotorModel.Crear( doc.IdMotor
						  , doc.IdDispositivo
						  , doc.Descripcion
						  , doc.MarcaModelo
						  , doc.Tipo
						  , doc.Pin
						  , doc.EsPinAnalogo
						  , doc.Habilitado
						  , doc.Posicion
						  , doc.Accion
						  , doc.Estado);
            
            lstModels.push(MotorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("<MONGO> MotorProvider.GetCollection : Error al leer async  error : " + error); });
          }
          return callback(null, lstModels);
        }
      });
  }

  if (_provider.NEDB) {
      var lstModels = [];
      
      var filters = {};
      if (filter.IdMotor)
      	filters.IdMotor = parseInt(filter.IdMotor);
      	
      if (filter.IdDispositivo)
      	filters.IdDispositivo = filter.IdDispositivo;
      
      db.Motor.find(filters, function (err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("<NEDB> MotorProvider.GetCollection : Error al leer async  error : " + error);
           return callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var MotorModel = new Models();
             MotorModel.Crear( doc.IdMotor
						  , doc.IdDispositivo
						  , doc.Descripcion
						  , doc.MarcaModelo
						  , doc.Tipo
						  , doc.Pin
						  , doc.EsPinAnalogo
						  , doc.Habilitado
						  , doc.Posicion
						  , doc.Accion
						  , doc.Estado);
            
            lstModels.push(MotorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("<NEDB> MotorProvider.GetCollection : Error al leer async error : " + error); });
          }
          return callback(null, lstModels);
        }
      });
  }
  else if (_provider.DWEET) {

	
    throw new Error("Motor.GetCollection() no habilitado para Dweet");
  }



};

method.GetLast = function(filter, callback) {

  if (_provider.MONGO) {

    console.log("<MONGO> MotorProvider.GetLast no implementado para Mongo");
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

    console.log("<NEDB> MotorProvider.GetLast no implementado para NEDB");
  }



};

method.Find = function(filter, callback) {

	if (_provider.MONGO) {
	
	    var lstModels = [];
	    
	     var filters = {};
	      if (filter.IdMotor)
	      	filters.IdMotor = parseInt(filter.IdMotor);
	      
	      if (filters.length == 0) {
	      	if (_DEBUG)
	      		console.log("<MONGO> MotorProvider.Find() no se han seteado filtros"); 
	      }
	    
	    MongoModels.find(filter).exec(function(err, docs) {
	      if (err) {
	           if (_DEBUG) console.log("<MONGO> MotorProvider.Find() : Error al leer async en mettodo Find() error : " + error);
	           return callback(err, lstModels);
	        } 
	        else 
	        {
	          if (docs.length > 0) {
		          async.each(docs, function(doc, cb) { 
		            var MotorModel = new Models();
		             MotorModel.Crear(  doc.IdMotor
									  , doc.IdDispositivo
									  , doc.Descripcion
									  , doc.MarcaModelo
									  , doc.Tipo
									  , doc.Pin
									  , doc.EsPinAnalogo
									  , doc.Habilitado
									  , doc.Posicion
									  , doc.Accion
									  , doc.Estado);
		            				  
		            lstModels.push(MotorModel.Objeto());
		            
		          }, function(error) { if (_DEBUG) console.log("<MONGO> MotorProvider.Find() : Error al leer async en mettodo Find() error : " + error); });
	          }
	          return callback(null, lstModels[0]);
	        }
	     });
	  }


	if (_provider.NEDB) {
	      var lstModels = [];
	      
	      var filters = {};
	      if (filter.IdMotor)
	      	filters.IdMotor = parseInt(filter.IdMotor);
	      
	      if (filters.length == 0) {
	      	if (_DEBUG)
	      		console.log("<NEDB> MotorProvider.Find() no se han seteado filtros"); 
	      }
	      
	      db.Motor.find(filters, function (err, docs) {
	        
	        if (err) {
	           if (_DEBUG) console.log("<NEDB MotorProvider.Find() : Error al leer async en mettodo Find() error : " + error);
	           return callback(err, lstModels);
	        } 
	        else 
	        {
	          if (docs.length > 0) {
		          async.each(docs, function(doc, cb) { 
		            var MotorModel = new Models();
		             MotorModel.Crear(  doc.IdMotor
									  , doc.IdDispositivo
									  , doc.Descripcion
									  , doc.MarcaModelo
									  , doc.Tipo
									  , doc.Pin
									  , doc.EsPinAnalogo
									  , doc.Habilitado
									  , doc.Posicion
									  , doc.Accion
									  , doc.Estado);
		            				  
		            lstModels.push(MotorModel.Objeto());
		            
		          }, function(error) { if (_DEBUG) console.log("<NEDB> MotorProvider.Find() : Error al leer async  error : " + error); });
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
           if (_DEBUG) console.log("<MONGO> MotorProvider.GetAll() : Error al leer async en mettodo GetAll() error : " + error);
           return callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var MotorModel = new Models();
            MotorModel.Crear(  doc.IdMotor
							  , doc.IdDispositivo
							  , doc.Descripcion
							  , doc.MarcaModelo
							  , doc.Tipo
							  , doc.Pin
							  , doc.EsPinAnalogo
							  , doc.Habilitado
							  , doc.Posicion
							  , doc.Accion
							  , doc.Estado);
            lstModels.push(MotorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("<MONGO MotorProvider.GetAll() : Error al leer async en mettodo GetAll() error : " + error); });
          }
          return callback(null, lstModels);
        }
      });
  }

  if (_provider.NEDB) {
      var lstModels = [];
      db.Motor.find({}, function (err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("<NEDB> MotorProvider.GetAll() : Error al leer async en mettodo GetAll() error : " + error);
           return callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var MotorModel = new Models();
            MotorModel.Crear(  doc.IdMotor
							  , doc.IdDispositivo
							  , doc.Descripcion
							  , doc.MarcaModelo
							  , doc.Tipo
							  , doc.Pin
							  , doc.EsPinAnalogo
							  , doc.Habilitado
							  , doc.Posicion
							  , doc.Accion
							  , doc.Estado);
            lstModels.push(MotorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("<NEDB> MotorProvider.GetAll() : Error al leer async en mettodo GetAll() error : " + error); });
          }
          return callback(null, lstModels);
        }
      });
  }
  else if (_provider.DWEET) {

	
    throw new Error("Motor.GetAll() no habilitado para Dweet");
  }



};

function GenerarDweetId(Motor) {
  return _dweet_prefijo + Motor;

};


module.exports = MotorProvider;