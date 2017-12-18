var express = require('express');
var router = express.Router();
var app = require('../app');

var controller = require('../controllers').purchase;

module.exports = {
    path: "/purchase",
    route: router
};

router.use(app.authServer.authenticate());

router.get('/purList', controller.purchaseList);

router.post('/purSave', controller.purchaseSave);

router.get('/productList', controller.productList);

router.get('/purchaseOne', controller.purchaseOne);

router.post('/purUpdate', controller.purUpdate);

router.get('/detailList', controller.detailList);

router.get('/statusList', controller.statusList);

router.post('/statusUpdate', controller.statusUpdate);

router.get('/purTotal', controller.purTotal);

