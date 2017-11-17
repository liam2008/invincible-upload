/*
 * Base Dependencies
 */
var express = require('express');
var router = express.Router();

/*
 * Server Dependencies
 */
var debug = require('debug')('smartdo:route:index');
var app = require('../app');
var tokenUtils = require('../utils/token-utils');
var communal = require('../controllers').communal;

/*
 * UModules Dependencies
 */

module.exports = {
    path: "/",
    route: router
};

router.get('/', function(req, res, next) {
    res.send();
});

router.post('/token', app.authServer.token());

router.get('/summary', function(req, res, next) {

});
