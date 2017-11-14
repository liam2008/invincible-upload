
var fs = require('fs');
var path = require('path');
var async = require('async');

var debug = require('debug')('smartdo:service:cache');

var CacheManager = module.exports = {};

CacheManager.name = "CacheManager";

CacheManager.init = function(cb) {
    var self = this;
    
    async.series([
        function(callback) {
            self.load(callback);
        }
    ], function(err, results) {
        if (err != null) {
            debug("%s init error: ", self.name, err);
            return;
        }

        debug("%s inited...", self.name);
        process.nextTick(cb);
    });
};

CacheManager.start = function(cb) {
    debug("%s started...", this.name);
    process.nextTick(cb);
};

CacheManager.stop = function(cb) {
    debug("%s stopped...", this.name);
    process.nextTick(cb);
};

CacheManager.load = function(cb) {
    cb && cb(null);
};
