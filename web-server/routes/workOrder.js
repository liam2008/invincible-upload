var express = require('express');
var router = express.Router();
var debug = require('debug')('smartdo:route:workOrder');
var app = require('../app');

var controller = require('../controllers').workOrder;
var subfilter = require('../middleware/sub-filter');

module.exports = {
    path: "/workOrder",
    route: router
};

router.use(app.authServer.authenticate());

router.get('/customerList', subfilter.operativeCustomer, controller.customerList);

router.post('/saveCustomer', subfilter.operativeCustomer, controller.saveCustomer);

router.post('/updateCustomer', subfilter.operativeCustomer, controller.updateCustomer);

router.post('/deleteCustomer', subfilter.operativeCustomer, controller.deleteCustomer);

router.post('/createOrder', subfilter.workOrder, controller.workOrderCreate);

router.get('/newOrderList', subfilter.workOrder, controller.newOrderList);

router.post('/dealOrder', subfilter.workOrder, controller.dealOrder);

router.get('/dealtList', subfilter.workOrder, controller.dealtList);

router.get('/orderReady', subfilter.workOrder, controller.orderReady);

router.get('/openOrder', subfilter.workOrder, controller.openOrder);

