var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var winston = require('winston');
//var config = require('./config-debug');

//MAS INFORMACION SOBRE SHOULD:
// http://www.phloxblog.in/node-js-uni-testing-js/#.V28ET7jhCCh


/* Mis variables */

var logger = new winston.Logger({});
var DataProvider = require('../lib/dao/DataProvider.js');

var Medicion = require("../lib/dto/Medicion.js");
var objMedicion = new Medicion();

describe('****** Data Provider *********', function() {

 var dataProvider;
 var serviceProvider;
  
  // within before() you can run all the operations that are needed to setup your tests. In this case
  // I want to create a connection with the database, and when I'm done, I call done().
  before(function(done) {
    // In our tests we use the test db
    var environment = "debug";
    var Configuracion = require("../lib/util/Configuracion.js");
	var configuracion = new Configuracion(environment);
	var config = configuracion.LeerConfiguracion();
    dataProvider = new DataProvider(logger, config, null);
    
    console.log("PROVEEDOR BD MONGO HABILITADO : " + dataProvider.GetConfig().MONGO.Habilitado);
    console.log("PROVEEDOR BD NEDB HABILITADO : " + dataProvider.GetConfig().NEDB.Habilitado);
    
    //console.log(dataProvider.GetConfig().Mongoose[MONGO].connection.readyState);
    dataProvider.Relay().Delete(1000,function(error, data) {
    	dataProvider.Device().Delete("100",function(a, c) {
    		dataProvider.Motor().Delete(95,function(e, d) {
    			done();
	    	});
    		
	    });
    });
    
   
    						
    
  });
  // use describe to give a title to your test suite, in this case the tile is "Account"
  // and then specify a function in which we are going to declare all the tests
  // we want to run. Each test starts with the function it() and as a first argument 
  // we have to provide a meaningful title for it, whereas as the second argument we
  // specify a function that takes a single parameter, "done", that we will use 
  // to specify when our test is completed, and that's what makes easy
  // to perform async test!
 
    
   describe('#Relay-GetAll', function() {
	   it('should return an array of values', function(done) {
		   	 dataProvider.Relay().GetAll(function(err, data) { 
		      should.not.exist(err);
		      should.exist(data);
		      data.should.be.an.instanceOf(Array);
		      data.should.not.be.empty;
		      done();
		    });
	   });
	});
	
	 describe('#Relay-GetCollection', function() {
	   it('should return an array of values for one device', function(done) {
	   
		   	var filter = {IdDispositivo : String};
	    	filter.IdDispositivo = "001";
		 	
		 	dataProvider.Relay().GetCollection(filter, function(err, data) { 
		        should.not.exist(err);
		        should.exist(data);
		        data.should.not.equal(null);
		        data.should.be.an.instanceOf(Array);
		      	data.should.not.be.empty;
		        data[0].IdDispositivo.should.equal("001");
		        done();
		    });
	   });
	   
	   
	   it('should return an empty array', function(done) {
	   
		   	var filter = {IdRelay : String};
	    	filter.IdRelay = "992";
		 	
		 	dataProvider.Relay().GetCollection(filter, function(err, data) { 
		        should.not.exist(err);
		        data.should.be.an.instanceOf(Array);
				data.should.be.empty;
		        done();
		    });
	   });
	   
	   it('should return all values', function(done) {
	   
		   	var filter = {};
		 	
		 	dataProvider.Relay().GetCollection(filter, function(err, data) { 
		        should.not.exist(err);
		        should.exist(data);
		        data.should.be.an.instanceOf(Array);
				data.should.not.be.empty;
		        done();
		    });
	   });
	});
	
	describe('#Relay-Find', function() {
    it('should return 1 value', function(done) {
	    	var filter = {IdRelay : String, IdDispositivo : String};
	    	filter.IdRelay = 1;
	    	filter.IdDispositivo = "001";
		    
		    dataProvider.Relay().Find(filter, function(err, data) { 
		        should.not.exist(err);
		        should.exist(data);
		        data.should.not.equal(null);
		        data.IdRelay.should.equal(1);
		        done();
		    });    	
        });
     
    it('should not return values', function(done) {
	    	var filter = {IdRelay : String, IdDispositivo : String};
	    	filter.IdRelay = 1000;
	    	filter.IdDispositivo = "100";
		    
		    dataProvider.Relay().Find(filter, function(err, data) { 
		        should.not.exist(err);
		        should.not.exist(data);
		        done();
		    });    	
        });  
    
    });
    
    describe('#Relay-Save', function() {
    it('should insert 1 value', function(done) {
	    	
		    dataProvider.Relay().Save(1000,
		    						  "100",
		    						  "Unit Test",
		    						  "Modelo Unit",
		    						  "Tipo Unit",
		    						  1000,
		    						  true,
		    						  false,
		    						  false,
		    						  false,
		    						  function(error, ret) {
		    						  	var filter = {IdRelay : String, IdDispositivo : String};
								    	filter.IdRelay = 1000;
								    	filter.IdDispositivo = "100";
									 	
									 	dataProvider.Relay().GetCollection(filter, function(err, data) { 
									        should.not.exist(err);
									        should.exist(data);
									        data.should.not.equal(null);
									        data.should.be.an.instanceOf(Array);
									      	data.should.not.be.empty;
									        data[0].IdRelay.should.equal(1000);
									        data[0].IdDispositivo.should.equal("100");
									        data[0].Pin.should.equal(1000);
									        done();
									    });    	
		 	
		    						  });
			
		 	
		    
		   
        });
        
       it('should edit 1 value', function(done) {
	    	
		    dataProvider.Relay().Save(1000,
		    						  "100",
		    						  "Unit Test Edited",
		    						  "Modelo Unit",
		    						  "Tipo Unit",
		    						  1001,
		    						  true,
		    						  false,
		    						  false,
		    						  false,
		    						   function(error, ret) {
		    						   		if (ret.nModified)
		    						   			ret.nModified.should.equal(1); //Cantidad modificados debe ser 1
		    						   		else
		    						   			ret.should.equal(1);
		    						   		
		    						   		
		    						   		var filter = {IdRelay : String, IdDispositivo : String};
										    	filter.IdRelay = 1000;
										    	filter.IdDispositivo = "100";
											 	
											 	dataProvider.Relay().GetCollection(filter, function(err, data) { 
											        should.not.exist(err);
											        should.exist(data);
											        data.should.not.equal(null);
											        data.should.be.an.instanceOf(Array);
											      	data.should.not.be.empty;
											        data[0].IdRelay.should.equal(1000);
											        data[0].IdDispositivo.should.equal("100");
											        data[0].Pin.should.equal(1001);
											        data[0].Descripcion.should.equal("Unit Test Edited");
											        done();
											    });    	
		    						   
		    						   });
		   
        });
        
        //When the object is invalid, we don't want to insert
        it('should not insert 1 value', function(done) {
        
        	 dataProvider.Relay().Save(null,
		    						  null,
		    						  null,
		    						  null,
		    						  null,
		    						  null,
		    						  null,
		    						  null,
		    						  null,
		    						  null,
		    						  function(err, ret) {
		    						  	should.exist(err);
		    						  	should.not.exist(ret);
		    						  	done();
		    						  });
        
        });
        
    });
    
    describe('#Relay-Delete', function() {
    it('should delete 1 value', function(done) {
	    	
	    	var IdRelay = 1000;
		    
		    dataProvider.Relay().Delete(IdRelay, function(err, data) { 
		        should.not.exist(err);
		        should.exist(data);
		        data.should.not.equal(null);
		        if (data.result && data.result.n)
		        	data.result.n.should.equal(1);
		        else
		        	data.should.equal(1);	
		        done();
		    });    	
        });
        
     it('should not delete 1 value', function(done) {
	    	
	    	var IdRelay = 1005;
		    
		    dataProvider.Relay().Delete(IdRelay, function(err, data) { 
		        should.not.exist(err);
		        should.exist(data);
		        data.should.not.equal(null);
		        
		        if (data.result && data.result.n)
		        	data.result.n.should.equal(0);
		        
		        done();
		    });    	
        }); 
     
    });
    
    /*************************** DEVICES ***********************************/
    
     describe('#Device-GetAll', function() {
	   it('should return an array of values', function(done) {
		   	 dataProvider.Device().GetAll(function(err, data) { 
		      should.not.exist(err);
		      should.exist(data);
		      data.should.be.an.instanceOf(Array);
		      data.should.not.be.empty;
		      done();
		    });
	   });
	});
	
	
	 describe('#Device-GetCollection', function() {
	   it('should return an array of values', function(done) {
	   
		   	var filter = {Id : String};
	    	filter.Id = "001";
		 	
		 	dataProvider.Device().GetCollection(filter, function(err, data) { 
		        should.not.exist(err);
		        should.exist(data);
		        data.should.not.equal(null);
		        data.should.be.an.instanceOf(Array);
		      	data.should.not.be.empty;
		        data[0].Id.should.equal("001");
		        done();
		    });
	   });
	   
	   
	   it('should return an empty array', function(done) {
	   
		   	var filter = {Id : String};
	    	filter.Id = "099";
		 	
		 	dataProvider.Device().GetCollection(filter, function(err, data) { 
		        should.not.exist(err);
		        data.should.be.an.instanceOf(Array);
				data.should.be.empty;
		        done();
		    });
	   });
	   
	   it('should return all values', function(done) {
	   
		   	var filter = {};
		 	
		 	dataProvider.Device().GetCollection(filter, function(err, data) { 
		        should.not.exist(err);
		        should.exist(data);
		        data.should.be.an.instanceOf(Array);
				data.should.not.be.empty;
		        done();
		    });
	   });
	   
	});
	
	describe('#Device-Find', function() {
    it('should return 1 value', function(done) {
	    	var filter = {Id : String};
	    	filter.Id = "001";
		    
		    dataProvider.Device().Find(filter, function(err, data) { 
		        should.not.exist(err);
		        should.exist(data);
		        data.should.not.equal(null);
		        data.Id.should.equal("001");
		        done();
		    });    	
        });
     
    it('should not return values', function(done) {
	    	var filter = {Id : String};
	    	filter.Id = "100";
		    
		    dataProvider.Device().Find(filter, function(err, data) { 
		        should.not.exist(err);
		        should.not.exist(data);
		        done();
		    });    	
        });  
    
    });
    
    
    describe('#Device-Save', function() {
    it('should insert 1 value', function(done) {
	    	
		    dataProvider.Device().Save("100",
		    						  "Unit Test",
		    						  "Tipo Unit",
		    						  "127.0.0.1",
		    						  999,
		    						  false,
		    						  false,
		    						  10000,
		    						  function(error, ret) {
		    						  	var filter = {Id : String};
								    	filter.Id = "100";
									 	
									 	dataProvider.Device().GetCollection(filter, function(err, data) {
									        should.not.exist(err);
									        should.exist(data);
									        data.should.not.equal(null);
									        data.should.be.an.instanceOf(Array);
									      	data.should.not.be.empty;
									        data[0].Id.should.equal("100");
									        data[0].Puerto.should.equal(999);
									        done();
									    });    	
		 	
		    						  });
			
		 	
		    
		   
        });
        
       it('should edit 1 value', function(done) {
	    	
		    dataProvider.Device().Save("100",
		    						  "Unit Test modified",
		    						  "Tipo Unit",
		    						  "127.0.0.1",
		    						  888,
		    						  false,
		    						  false,
		    						  10000,
		    						   function(error, ret) {
		    						   		if (ret.nModified)
		    						   			ret.nModified.should.equal(1); //Cantidad modificados debe ser 1
		    						   		else
		    						   			ret.should.equal(1);
		    						   		
		    						   		
		    						   		var filter = {Id : String};
										    	filter.Id = "100";
											 	
											 	dataProvider.Device().GetCollection(filter, function(err, data) { 
											        should.not.exist(err);
											        should.exist(data);
											        data.should.not.equal(null);
											        data.should.be.an.instanceOf(Array);
											      	data.should.not.be.empty;
											        data[0].Id.should.equal("100");
											        data[0].Puerto.should.equal(888);
											        data[0].Nombre.should.equal("Unit Test modified");
											        done();
											    });    	
		    						   
		    						   });
		   
        });
        
        //When the object is invalid, we don't want to insert
        it('should not insert 1 value', function(done) {
        
        	 dataProvider.Device().Save(null,
		    						  null,
		    						  null,
		    						  null,
		    						  null,
		    						  null,
		    						  null,
		    						  null,
		    						  function(err, ret) {
		    						  	should.exist(err);
		    						  	should.not.exist(ret);
		    						  	done();
		    						  });
        
        });
        
    });
    
    describe('#Device-Delete', function() {
    it('should delete 1 value', function(done) {
	    	
	    	var Id = "100";
		    
		    dataProvider.Device().Delete(Id, function(err, data) { 
		        should.not.exist(err);
		        should.exist(data);
		        data.should.not.equal(null);
		        console.log("Eliminados " + data);
		        done();
		    });    	
        });
        
     it('should not delete 1 value', function(done) {
	    	
	    	var Id = "101";
		    
		    dataProvider.Device().Delete(Id, function(err, data) { 
		        should.not.exist(err);
		        should.exist(data);
		        data.should.not.equal(null);
		        console.log("Eliminados " + data);
		        done();
		    });    	
        });
     
    });
    
    
    
     /*************************** MOTORES ***********************************/
    
     describe('#Motor-GetAll', function() {
	   it('should return an array of values', function(done) {
		   	 dataProvider.Motor().GetAll(function(err, data) { 
		      should.not.exist(err);
		      should.exist(data);
		      data.should.be.an.instanceOf(Array);
		      data.should.not.be.empty;
		      done();
		    });
	   });
	});
	
	
	 describe('#Motor-GetCollection', function() {
	   it('should return an array of values', function(done) {
	   
		   	var filter = {IdMotor : String};
	    	filter.IdMotor = 1;
		 	
		 	dataProvider.Motor().GetCollection(filter, function(err, data) { 
		        should.not.exist(err);
		        should.exist(data);
		        data.should.not.equal(null);
		        data.should.be.an.instanceOf(Array);
		      	data.should.not.be.empty;
		        done();
		    });
	   });
	   
	   
	   it('should return an empty array', function(done) {
	   
		   	var filter = {IdMotor : String};
	    	filter.IdMotor = "099";
		 	
		 	dataProvider.Motor().GetCollection(filter, function(err, data) { 
		        should.not.exist(err);
		        data.should.be.an.instanceOf(Array);
				data.should.be.empty;
		        done();
		    });
	   });
	   
	   it('should return all values', function(done) {
	   
		   	var filter = {};
		 	
		 	dataProvider.Motor().GetCollection(filter, function(err, data) { 
		        should.not.exist(err);
		        should.exist(data);
		        data.should.be.an.instanceOf(Array);
				data.should.not.be.empty;
		        done();
		    });
	   });
	   
	});
	
	describe('#Motor-Find', function() {
    it('should return 1 value', function(done) {
	    	var filter = {IdMotor : String};
	    	filter.IdMotor = "1";
		    
		    dataProvider.Motor().Find(filter, function(err, data) { 
		        should.not.exist(err);
		        should.exist(data);
		        data.should.not.equal(null);
		        data.IdMotor.should.equal(1);
		        done();
		    });    	
        });
     
    it('should not return values', function(done) {
	    	var filter = {IdMotor : String};
	    	filter.IdMotor = "9992";
		    
		    dataProvider.Motor().Find(filter, function(err, data) { 
		        should.not.exist(err);
		        should.not.exist(data);
		        done();
		    });    	
        });  
    
    });
    
    
    describe('#Motor-Save', function() {
    it('should insert 1 value', function(done) {
	    	
	    	
	    	
		    dataProvider.Motor().Save(95,
		    						  "001",
		    						  "Unit Test",
		    						  "Marca Unit",
		    						  "1", 
		    						  999,
		    						  false,
		    						  false,
		    						  1,
		    						  1,
		    						  1,
		    						  function(error, ret) {
		    						  	var filter = {IdMotor : String};
								    	filter.IdMotor = 95;
									 	
									 	dataProvider.Motor().GetCollection(filter, function(err, data) {
									        should.not.exist(err);
									        should.exist(data);
									        data.should.not.equal(null);
									        data.should.be.an.instanceOf(Array);
									      	data.should.not.be.empty;
									        data[0].IdMotor.should.equal(95);
									        data[0].Pin.should.equal(999);
									        done();
									    });    	
		 	
		    						  });

        });
        
       it('should edit 1 value', function(done) {
	    	
		    dataProvider.Motor().Save(95,
		    						  "100",
		    						  "Unit Test",
		    						  "Marca Unit",
		    						  "1", 
		    						  888,
		    						  false,
		    						  false,
		    						  1,
		    						  1,
		    						  1,
		    						   function(error, ret) {
		    						   		if (ret.nModified)
		    						   			ret.nModified.should.equal(1); //Cantidad modificados debe ser 1
		    						   		else
		    						   			ret.should.equal(1);
		    						   		
		    						   		
		    						   		var filter = {IdMotor : String};
										    	filter.IdMotor = 95;
											 	
											 	dataProvider.Motor().GetCollection(filter, function(err, data) { 
											        should.not.exist(err);
											        should.exist(data);
											        data.should.not.equal(null);
											        data.should.be.an.instanceOf(Array);
											      	data.should.not.be.empty;
											        data[0].IdMotor.should.equal(95);
											        data[0].Pin.should.equal(888);
											        done();
											    });    	
		    						   
		    						   });
		   
        });
        
        //When the object is invalid, we don't want to insert
        it('should not insert 1 value', function(done) {
        
        	 dataProvider.Motor().Save(null,
		    						  null,
		    						  null,
		    						  null,
		    						  null, 
		    						  null,
		    						  null,
		    						  null,
		    						  1,
		    						  1,
		    						  1,
		    						  function(err, ret) {
		    						  	should.exist(err);
		    						  	should.not.exist(ret);
		    						  	done();
		    						  });
        
        });
        
    });
    
    describe('#Motor-Delete', function() {
    it('should delete 1 value', function(done) {
	    	
	    	var IdMotor = 95;
		    
		    dataProvider.Motor().Delete(IdMotor, function(err, data) { 
		        should.not.exist(err);
		        should.exist(data);
		        data.should.not.equal(null);
		        console.log("Eliminados " + data);
		        done();
		    });    	
        });
        
     it('should not delete 1 value', function(done) {
	    	
	    	var IdMotor = 98;
		    
		    dataProvider.Motor().Delete(IdMotor, function(err, data) { 
		        should.not.exist(err);
		        should.exist(data);
		        data.should.not.equal(null);
		        console.log("Eliminados " + data);
		        done();
		    });    	
        });
     
    });
    
    
    /*************************** MEDICIONES ***********************************/
    
     describe('#Medicion-GetAll', function() {
	   it('should return an array of values', function(done) {
		   	 dataProvider.Medicion().GetAll(function(err, data) { 
		      should.not.exist(err);
		      should.exist(data);
		      data.should.be.an.instanceOf(Array);
		      data.should.not.be.empty;
		      done();
		    });
	   });
	});
	
	
	 describe('#Medicion-GetCollection', function() {
	   it('should return an array of values', function(done) {
	   
		   	var filter = {IdDispositivo : String};
	    	filter.IdDispositivo = "001";
		 	
		 	dataProvider.Medicion().GetCollection(filter, function(err, data) { 
		        should.not.exist(err);
		        should.exist(data);
		        data.should.not.equal(null);
		        data.should.be.an.instanceOf(Array);
		      	data.should.not.be.empty;
		        done();
		    });
	   });
	   
	   
	   it('should return an empty array', function(done) {
	   
		   	var filter = {IdDispositivo : String};
	    	filter.IdDispositivo = "877";
		 	
		 	dataProvider.Motor().GetCollection(filter, function(err, data) { 
		        should.not.exist(err);
		        data.should.be.an.instanceOf(Array);
				data.should.be.empty;
		        done();
		    });
	   });
	   
	   it('should return all values', function(done) {
	   
		   	var filter = {};
		 	
		 	dataProvider.Motor().GetCollection(filter, function(err, data) { 
		        should.not.exist(err);
		        should.exist(data);
		        data.should.be.an.instanceOf(Array);
				data.should.not.be.empty;
		        done();
		    });
	   });
	   
	});
	
	  describe('#Medicion-GetLast', function() {
	   it('should return the last value', function(done) {
		   	 
		   	var so = {};
			var stype = "_id";
			var sdir = "desc";
			so[stype] = sdir;
			
			 var filter = {
	 			   IdTipoActuador : Number,
	 			   sortObject : Object
	 			   };
			filter.IdTipoActuador = objMedicion.GetTipoActuadorByName("SENSOR");	 			   
	 		filter.sortObject = so;
		   	 
		   	 dataProvider.Medicion().GetLast(filter, function(err, data) { 
		      should.not.exist(err);
		      should.exist(data);
		      data.should.not.be.an.instanceOf(Array);
		      data.should.not.be.empty;
		      done();
		    });
	   });
	});
	
	
    
    
    
  });
