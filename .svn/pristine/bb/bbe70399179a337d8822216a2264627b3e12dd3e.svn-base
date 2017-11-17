var fs = require('fs');
var path = require('path');
var env = process.env.NODE_ENV || "development";
var config = require('../config/db.adc.json')[env];

var debug = require('debug')('smartdo:mongo');
var mongoose = require('mongoose'); //引用mongoose模块
mongoose.Promise = global.Promise;
var url = null;
if(config.user) {
	url = "mongodb://" + config.user + ":" + config.pass + "@" + config.host + ":" + config.port + "/" + config.db;
} else {
	url = "mongodb://" + config.host + ":" + config.port + "/" + config.db;
}
var mongo = mongoose.createConnection(url); //创建一个数据库连接

var db = {
	mongoose: mongoose,
	mongo: mongo,
	models: {}
};

mongo.on('error', function(err) {
	debug(new Error(err));
});

mongo.once('open', function() {
	debug("mongo is opened");
});

db.getModel = function(name, databaseName) {
	if(db.models[databaseName]) {
		return db.models[databaseName];
	}

	var modelFile = require('./' + name);
	var schema = new mongoose.Schema(modelFile.schema);

	if(databaseName) {
		db.models[databaseName] = mongo.model(databaseName, schema, databaseName);
		return db.models[databaseName];
	} else {
		db.models[name] = mongo.model(modelFile.name, schema, modelFile.name);
		return db.models[name];
	}
};

module.exports = db;