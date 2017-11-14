var express = require('express');
var router = express.Router();
var debug = require('debug')('smartdo:route:profit');
var app = require('../app');

var controller = require('../controllers').profit;

module.exports = {
    path: "/profit",
    route: router
};

router.use(app.authServer.authenticate());

router.get('/profitShow', controller.profitShow);

router.get('/teamProfitShow', controller.teamProfitShow);