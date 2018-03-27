var express = require('express');
var router = express.Router();
var debug = require('debug')('smartdo:route:base');
var app = require('../app');

var controller = require('../controllers').base;
var subfilter = require('../middleware/sub-filter');

module.exports = {
	path: "/base",
	route: router
};

router.use(app.authServer.authenticate());

router.get('/list', subfilter.merchandise_edit, controller.list);

router.post('/update', subfilter.merchandise_edit, controller.update);

router.post('/saveMerchandise', subfilter.merchandise_edit, controller.saveMerchandise);

router.delete('/deleteMerd/:id', subfilter.merchandise_edit, controller.deleteMerd);

router.get('/shops', subfilter.shop, controller.shops);

router.post('/addShops', subfilter.shop, controller.addShops);

router.post('/updateShops', subfilter.shop, controller.updateShops);

router.get('/product', subfilter.stockControls, controller.listProduct);

router.post('/saveProduct', controller.saveProduct);

router.get('/removeProduct', controller.removeProduct);

router.post('/updateProduct', controller.updateProduct);