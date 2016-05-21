var method = Configuracion.prototype;

var _environment;
var _ambienteHeroku = false;

function Configuracion(environment) { 
	_environment = environment;
	
	if (process.env.HEROKU) {
		console.log("Configuracion : Cargo parametros desde variables de entorno o archivo .env");
		_ambienteHeroku = true;
	}
	else
	{
		console.log("Configuracion : Cargo parametros desde archivo config.json");
	}

};


method.LeerConfiguracion = function() {

	var config;
	if (_ambienteHeroku) 
		config = CargarVariablesEntorno();

	else		
		config = CargarDesdeArchivoConfig();
	
	return config;
}

function CargarVariablesEntorno() {
	_config = 
	{
		 	"app_host" : process.env.app_host,
		    "app_port" : process.env.PORT,
		    "datasource" : {
		        "NEDB"  : { "Habilitado" : process.env.db_NEDB_Habilitado,
		                    "Sincronizacion" : process.env.db_NEDB_Sincronizacion,
		                    "Debug" : process.env.db_NEDB_Debug,
		                    "Intervalo" : process.env.db_NEDB_Intervalo },
		        "MONGO" : { "Habilitado" : process.env.db_MONGO_Habilitado,
		                     "Sincronizacion" : process.env.db_MONGO_Sincronizacion,
		                     "Intervalo" : process.env.db_MONGO_Intervalo,
		                     "Debug" : process.env.db_MONGO_Debug,
		                     "UserName" : process.env.db_MONGO_Username,
		                     "Password" : process.env.db_MONGO_Password
		                      },
		        "DWEET" : { "Habilitado" : "false",
		                    "Sincronizacion" : "false",
		                    "Intervalo" : "1",
		                    "prefijo_sensor" : "bb_njs_sensor_",
		                    "prefijo_bomba" : "bb_njs_relay_",
		                    "prefijo_dispositivo": "bb_njs_device_"
		                  }
		        },
		    "mail_enabled" : process.env.mailer_mail_enabled,
		    "mailer_service" : process.env.mailer_service,
		    "mailer_user" : process.env.mailer_user,
		    "mailer_pass" : process.env.mailer_pass,
		    "mailer_destinatario" : process.env.mailer_destinatario,
		    "mailer_remitente" : process.env.mailer_remitente,
		    "twitter_enabled" : process.env.twitter_enabled,
		    "twitter_consumer_secret" :process.env.twitter_consumer_secret,
		    "twitter_consumer_key":process.env.twitter_consumer_key,
		    "twitter_access_token":process.env.twitter_access_token,
		    "twitter_access_token_secret":process.env.twitter_access_token_secret,
		    "twitter_callback_url" : process.env.twitter_callback_url,
		    "twitter_autenticacion" : process.env.twitter_autenticacion,
		    "monitor_habilitado" : process.env.monitor_habilitado,
		    "monitor_intervalo" : process.env.monitor_intervalo,
		    "monitor_datasource" : process.env.monitor_datasource
	};
	
	return _config;
}


function CargarDesdeArchivoConfig() {

	_config = require("../../config.json")[_environment];
	return _config;
	
}


module.exports = Configuracion;

