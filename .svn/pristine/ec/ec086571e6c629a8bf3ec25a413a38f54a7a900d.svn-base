var express = require('express');
var router = express.Router();
var debug = require('debug')('smartdo:route:profit');
var app = require('../app');

var controller = require('../controllers').profit;
var subfilter = require('../middleware/sub-filter');
var helper = require('../middleware/helper');

module.exports = {
    path: "/profit",
    route: router
};

router.use(app.authServer.authenticate());

router.get('/profitShow', helper.team_list, subfilter.skuProfit, controller.profitShow);

router.get('/teamProfitShow', helper.team_list, subfilter.teamProfit, controller.teamProfitShow);

router.get('/profitDetail', controller.profitDetail);