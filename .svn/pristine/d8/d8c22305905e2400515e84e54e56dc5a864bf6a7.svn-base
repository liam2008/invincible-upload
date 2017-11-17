/*
 * Base Dependencies
 */
var express = require('express');
var router = express.Router();

/*
 * Server Dependencies
 */
var debug = require('debug')('smartdo:route:me');
var app = require('../app');

var controller = require('../controllers').me;

/*
 * UModules Dependencies
 */

module.exports = {
    path: "/me",
    route: router
};

router.use(app.authServer.authenticate());

router.get('/',function(req, res, next) {
    var agent = req.agent || {};
    var data = JSON.parse(JSON.stringify(agent));

    delete data.password;

    res.success(data);
});

router.put('/password', controller.password);
