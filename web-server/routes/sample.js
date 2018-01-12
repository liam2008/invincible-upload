var express = require('express');
var router = express.Router();
var debug = require('debug')('smartdo:route:sample');
var app = require('../app');

var controller = require('../controllers').sample;
var subfilter = require('../middleware/sub-filter');

module.exports = {
    path: "/sample",
    route: router
};

router.use(app.authServer.authenticate());

router.get('/order', controller.orderList);

router.get('/order/openNew', controller.openNewOrder);

router.post('/order', controller.orderSave);

router.put('/order/:purId', controller.orderEdit);
