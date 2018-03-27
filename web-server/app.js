/*
 * Base Dependencies
 */
var fs = require('fs');
var path = require('path');
var UUID = require('uuid');
var async = require('async');
var moment = require('moment');
var debug = require('debug')('smartdo:app');
var express = require('express');
var favicon = require('serve-favicon');
var log4js = require('log4js');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var xmlParser = require('express-xml-bodyparser');

var Shared = require('../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;

/*
 * Server Dependencies
 */

/*
 * UModules Dependencies
 */

// exports to app

express.response.error = function(code, message, name) {
    var req = this.req;
    var res = this;
    var path = (typeof req.originalUrl === "string") ? req.originalUrl.split('?')[0] : "";

    var status = MESSAGE[code][0];
    var error = {
        code: code,
        error: name || MESSAGE[code][1],
        description: message || MESSAGE[code][1] || ""
    };

    res.status(status).send(error);

    debug('RESPONSE(%d) method=%s path=%s req=%j body=%j data=%j', status, req.method, path, req.query, req.body, error);
};

express.response.success = function(data) {
    var req = this.req;
    var res = this;
    var path = (typeof req.originalUrl === "string") ? req.originalUrl.split('?')[0] : "";

    res.send(data);

    debug('RESPONSE(200) method=%s path=%s req=%j body=%j data=%j', req.method, path, req.query, req.body, data);
};

// 初始化应用
var app = module.exports = express();
var dirname = path.resolve(__dirname, '');

// 设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length,Authorization,Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");

    if (req.method === "OPTIONS") {
        res.sendStatus(200);
    }
    else  {
        next();
    }
});

// view engine setup
app.set('views', path.join(dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(dirname, 'public', 'favicon.ico')));
app.use(log4js.connectLogger(log4js.getLogger('access'), { level: "auto" }));
app.use(bodyParser.json({limit:'100mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw());
app.use(bodyParser.text());
app.use(xmlParser({ explicitArray: false, normalize: false, normalizeTags: false, trim: true }));
app.use(cookieParser());
app.use(express.static(path.join(dirname, 'public'), { index: false }));

app.use(function(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    debug("%s %s %j %j", req.method, req.originalUrl, req.headers, req.body);
    next();
});

app.config = require('./config/project.json');
app.authServer = require('./middleware/auth-server');

// 加载所有路由
fs.readdirSync(dirname + '/routes').forEach(function(filename) {
    if (!/\.js$/.test(filename)) {
        return;
    }

    var name = path.resolve(dirname, "./routes/", path.basename(filename, '.js'));
    var router = require(name);

    app.use(router.path, router.route);

    debug("mount on path: %s", router.path);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.status(404).send();
});

// error handler
app.use(function(err, req, res, next) {
    var code = err.value || ERROR_CODE.INTERNAL_ERROR;
    var path = (typeof req.originalUrl === "string") ? req.originalUrl.split('?')[0] : "";

    debug('Exception method=%s path=%s req=%j body=%j error=%s:%s', req.method, path, req.query, req.body, err.name, err.message);
    debug(err);

    res.status(err.status || 500);

    if (req.app.get('env') !== 'production') {
        res.error(code, err.message, err.name);
    } else {
        res.error(code);
    }
});

var services = {};
/**
 * Manager init
 */
app.init = function(cb) {
    var files = fs.readdirSync(dirname + '/service');

    var iterator = function(file, callback) {
        if (!/\.js$/.test(file)) {
            return callback();
        }

        var name = path.resolve(dirname, "./service/", path.basename(file, '.js'));
        var Manager = require(name);

        services[Manager.name] = Manager;
        Manager.init(function() {
            callback();
        });
    };

    async.eachSeries(files, iterator, function(err) {
        if (err != null) {
            debug(err);
            process.exit(-1);
        }

        debug("app inited...");
        process.nextTick(cb);
    });
};

app.start = function(cb) {
    var keys = Object.keys(services);

    var iterator = function(name, callback) {
        services[name].start(function() {
            callback();
        });
    };

    async.eachSeries(keys, iterator, function(err) {
        if (err != null) {
            debug(err);
            process.exit(-1);
        }

        debug("app started...");
        process.nextTick(cb);
    });
};

app.stop = function(cb) {
    var keys = Object.keys(services);

    var iterator = function(name, callback) {
        services[name].stop(function() {
            callback();
        });
    };

    async.eachSeries(keys, iterator, function(err) {
        if (err != null) {
            debug(err);
            process.exit(-1);
        }

        debug("app stopped...");
        process.nextTick(cb);
    });
};

app.getService = function(name) {
    return services[name] || null;
};
