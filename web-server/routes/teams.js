var express = require('express');
var router = express.Router();
var debug = require('debug')('smartdo:route:teams');
var app = require('../app');
var controller = require('../controllers').team;
var helper = require('../middleware/helper');

module.exports = {
	path: "/team",
	route: router
};

router.use(app.authServer.authenticate());

// 小组选项
router.get('/opt', controller.teamOpt);

// 小组列表
router.get('/list', controller.teamList);

// 小组添加
router.post('/save', controller.teamSave)

// 小组更新
router.post('/update', controller.teamUpdate)

// 小组删除
router.get('/remove', controller.teamRemove)