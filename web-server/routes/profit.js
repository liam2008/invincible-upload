var express = require('express');
var router = express.Router();
var debug = require('debug')('smartdo:route:profit');
var app = require('../app');

var controller = require('../controllers').profit;
var subfilter = require('../middleware/sub-filter');

module.exports = {
    path: "/profit",
    route: router
};

router.use(app.authServer.authenticate());

router.get('/profitShow', subfilter.skuProfit, controller.profitShow);

router.get('/teamProfitShow', subfilter.teamProfit, controller.teamProfitShow);

router.post('/profitDetail', controller.profitDetail);