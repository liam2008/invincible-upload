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

router.post('/createOrder', subfilter.createOrder, controller.workOrderCreate);

router.post('/dealOrder', subfilter.workOrder, controller.dealOrder);

// 查询小组
router.get('/orderReady', subfilter.workOrder, controller.orderReady);

// 工单详情
router.get('/openOrder', subfilter.workOrder, controller.openOrder);

// 保存备注
router.post('/saveRemark', subfilter.workOrder, controller.saveRemark);

// 处理状态
router.post('/handle', subfilter.workOrder, controller.handle);

// 待处理列表
router.get('/newOrderList', subfilter.workOrder, controller.newOrders);

// 已处理列表
router.get('/dealtList', subfilter.workOrder, controller.dealtList);

// 点击任务列表
router.get('/clickTask', controller.clickTaskList);

// 点击任务保存
router.post('/clickTask', controller.clickTaskSave);