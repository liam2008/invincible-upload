var express = require('express');
var router = express.Router();
var debug = require('debug')('smartdo:route:base');
var app = require('../app');

var controller = require('../controllers').base;

module.exports = {
    path: "/base",
    route: router
};

router.use(app.authServer.authenticate());

router.get('/list', controller.list);

router.post('/update', controller.update);

router.post('/saveMerchandise', controller.saveMerchandise);

router.get('/shops', controller.shops);

router.post('/addShops', controller.addShops);

router.post('/updateShops', controller.updateShops);

router.get('/product', controller.listProduct);

router.post('/saveProduct', controller.saveProduct);

router.get('/removeProduct', controller.removeProduct);

router.post('/updateProduct', controller.updateProduct);

router.post('/StoreJournal', controller.StoreJournal);