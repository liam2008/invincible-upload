var express = require('express');
var router = express.Router();
var debug = require('debug')('smartdo:route:supplier');
var app = require('../app');

var controller = require('../controllers').supplier;

module.exports = {
    path: "/supplier",
    route: router
};

router.use(app.authServer.authenticate());

router.get('/supplierList', controller.supplierList);

router.post('/supplierSave', controller.supplierSave);

router.post('/supplierUpdate', controller.supplierUpdate);

router.get('/supplierOne', controller.supplierOne);