var express = require('express');
var router = express.Router();
var controller = require('../controllers').samples;

module.exports = {
	path: "/samples",
	route: router
};

//样品单列表
router.get('/buys', controller.buyList);
//样品单编辑
router.post('/buys', controller.buySave);
//样品单删除
router.post('/buys/remove', controller.buyRemove);
//样品单标记
router.post('/buys/update', controller.buyUpdate);
//样品单详情
router.get('/buy/:id', controller.buyDetails);
//样品单关联
router.post('/buys/oddNumber', controller.buyOddNumber);
//样品单签收
router.post('/buys/signNumber', controller.buySignNumber);