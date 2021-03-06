/*
 * Base Dependencies
 */
var fs = require('fs');
var path = require('path');
var async = require('async');
var OSS = require('ali-oss').Wrapper;
var UUID = require('uuid');

/*
 * Server Dependencies
 */
var debug = require('debug')('smartdo:service:asset');
var DB = require('../models/invincible');
var User = DB.getModel('user');
var env = process.env.NODE_ENV || "development";
var envPath = "/test";
if(env == "production") {
	envPath = "/production";
}

/*
 * UModules Dependencies
 */

/**
 * OSS存储规则
 *
 * 培训资料:   /{Bucket}/training/{type}/{uuid}.{type}
 */

var AccessID = "LTAIWMPSDwKNzjqF";
var AccessSecret = "xn857jlicEbj7FjmSeUFiCaXxnGQkG";
var region = "oss-cn-shenzhen";
var bucket = "sdit-erp";
var client = new OSS({
	region: region,
	accessKeyId: AccessID,
	accessKeySecret: AccessSecret,
	bucket: bucket
});

var AssetsManager = module.exports = {};

AssetsManager.name = "AssetsManager";
AssetsManager.uri = "http://sdit-erp.oss-cn-shenzhen.aliyuncs.com";

AssetsManager.init = function(cb) {
	var self = this;

	async.series([], function(err, results) {
		if(err != null) {
			debug("%s init error: ", self.name, err);
			return;
		}

		debug("%s inited...", self.name);
		process.nextTick(cb);
	});
};

AssetsManager.start = function(cb) {
	debug("%s started...", this.name);
	process.nextTick(cb);
};

AssetsManager.stop = function(cb) {
	debug("%s stopped...", this.name);
	process.nextTick(cb);
};

AssetsManager.getTeamUri = function(uuid, complete) {
	var url = envPath + '/team/' + uuid + '/avatar.jpg';
	if(complete) {
		return this.uri + url;
	}
	return url;
};

AssetsManager.putTeamFile = function(file, callback) {
	var data = file.data;
	var uuid = file.uuid;
	var path = this.getTeamUri(uuid);

	data = data.replace(/^data:image\/jpeg;base64,/, '');

	client.put(path, new Buffer(data, 'base64'))
		.then(function(result) {
			callback && callback(null, result)
		})
		.catch(function(e) {
			callback && callback(e)
		})
};

AssetsManager.getTrainingUri = function(uuid, suffix, complete) {
	var url = envPath + "/training/" + uuid + "." + suffix;
	if(complete) {
		return this.uri + url;
	}
	return url;
};

AssetsManager.putTrainingFile = function(file, callback) {
	var self = this;
	var type = file.type;
	var data = file.data;
	var uuid = file.uuid || UUID.v4();
	var uri = self.getTrainingUri(uuid, type);

	if(['doc', 'pdf', 'mp4', 'zip'].indexOf(type) == -1) {
		debug(type, data);
		callback('type err');
		return;
	};

	client.put(uri, data)
		.then(function(result) {
			callback && callback(null, result);
		})
		.catch(function(e) {
			callback && callback(e);
		});
};