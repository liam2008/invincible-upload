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
var client = new OSS({
    region: region,
    accessKeyId: AccessID,
    accessKeySecret: AccessSecret,
    bucket: "sdit-erp"
});

var AssetsManager = module.exports = {};

AssetsManager.name = "AssetsManager";
AssetsManager.uri = "http://sdit-erp.oss-cn-shenzhen.aliyuncs.com";

AssetsManager.init = function(cb) {
    var self = this;

    async.series([
    ], function(err, results) {
        if (err != null) {
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

AssetsManager.putTrainingFile = function(file, callback) {
    var type = file.type;
    var buffer = file.buffer;
    var uuid = "";
    var uri = "/training/" + type + "/" + uuid;
    switch (type) {
        case "pdf": {
            uri = "/training/pdf/" + uuid + ".pdf";
            break;
        }
        default : {
            callback('type err');
            return;
        }
    }

    client.put(uri, buffer)
        .then(function(result) {
            callback && callback(null);
        })
        .catch(function(e) {
            callback && callback(e);
        });
};
