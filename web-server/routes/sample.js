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

// 样品单主页
router.get('/order', controller.orderList);

// 打开创建样品单页面
router.get('/order/openNew', controller.openNewOrder);

// 创建样品单
router.post('/order', controller.orderSave);

// 样品单编辑/关联/签收
router.put('/order/:purId', controller.orderEdit);

// 创建样品
router.post('/', controller.sampleSave);

// 样品申请列表
router.get('/borrow', controller.splBorrowList);

// 样品申请借出
router.post('/borrow', controller.splBorrowSave);

// 样品已申请借出列表
router.get('/borrow/borrowed', controller.splBorrowed);

// 样品申请借出取消
router.put('/borrow/borrowed/:borrowId', controller.borrowCancel);

// 样品列表借还管理
router.get('/borrow/manager', controller.splManager);
