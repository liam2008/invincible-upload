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

router.get('/customerList', subfilter.merchandise_edit, controller.customerList);

router.post('/saveCustomer', subfilter.merchandise_edit, controller.saveCustomer);

router.post('/updateCustomer', subfilter.merchandise_edit, controller.updateCustomer);

router.get('/deleteCustomer', subfilter.merchandise_edit, controller.deleteCustomer);

router.post('/CreateOrder', subfilter.merchandise_edit, controller.workOrderCreate);

