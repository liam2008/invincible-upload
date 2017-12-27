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

router.get('/show', controller.report);

router.post('/import/confirm', controller.saveDailySell);

router.get('/import', controller.import);

router.get('/PopupList', controller.PopupList);
