var express = require('express');
var router = express.Router();
var debug = require('debug')('smartdo:route:appraise');
var app = require('../app');

var controller = require('../controllers').appraise;

module.exports = {
    path: "/appraise",
    route: router
};

router.use(app.authServer.authenticate());

router.get('/EVALTotal', controller.EVALTotal);

router.get('/EVALDetail', controller.EVALDetail);

router.post('/EVALTask', controller.EVALTask);

