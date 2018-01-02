
var fs = require('fs');
var path = require('path');
var async = require('async');
var Moment = require('moment');

var debug = require('debug')('smartdo:service:cache');
var app = require('../app');

var CacheManager = module.exports = {};

CacheManager.name = "CacheManager";

CacheManager.init = function(cb) {
    var self = this;
    var currTime = Number(Moment().format("X"));

    // 主定时器运行频率 1000 毫秒
    self.interval                   = 1000;
    self.timerId                    = null;

    // 半个小时重载一次客服订单数据
    self.reloadOrderInterval        = 1800;
    self.nextReloadOrder            = currTime + self.reloadOrderInterval;

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
    this.clearTimer();

    // 1000毫秒运行一次主定时器
    this.timerId = setTimeout(this.onTimer.bind(this), this.interval);

    debug("%s started...", this.name);
    process.nextTick(cb);
};

CacheManager.onTimer = function() {
    var orderManager = app.getService('OrderManager') || {};
    var currTime = Number(Moment().format("X"));

    // 根据时间确定是否运行相关功能
    if (currTime >= this.nextReloadOrder) {
        orderManager.resetOrder(function() {});
        this.nextReloadOrder = currTime + this.reloadOrderInterval;
    }

    this.clearTimer();

    // 1000毫秒运行一次主定时器
    this.timerId = setTimeout(this.onTimer.bind(this), this.interval);
};

CacheManager.stop = function(cb) {
    this.clearTimer();
    debug("%s stopped...", this.name);
    process.nextTick(cb);
};

CacheManager.load = function(cb) {
    cb && cb(null);
};

CacheManager.clearTimer = function() {
    if (this.timerId) {
        clearTimeout(this.timerId);
        this.timerId = null;
    }
};
