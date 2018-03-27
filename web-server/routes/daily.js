var express = require('express');
var router = express.Router();
var debug = require('debug')('smartdo:route:daily');
var app = require('../app');

var controller = require('../controllers').daily;
var subfilter = require('../middleware/sub-filter');

module.exports = {
	path: "/daily",
	route: router
};

router.use(app.authServer.authenticate());

router.get('/list', subfilter.dailyInfo, controller.list);

router.get('/show', subfilter.dailyReport, controller.report);

router.post('/import/confirm', controller.saveDailySell);

router.get('/import', controller.import);

router.get('/PopupList', controller.PopupList);

// 墓志铭
router.post('/epitaph', controller.epitaph);

// 墓志铭选择
router.get('/epitaph/opt', controller.epitaphOpt);

// 运营销售信息
router.get('/sales', subfilter.operationSales, controller.operationSales);