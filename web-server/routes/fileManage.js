var express = require('express');
var router = express.Router();
var app = require('../app');
var subFileter = require('../middleware/sub-filter');
var controller = require('../controllers').fileManage;

module.exports = {
	path: "/files",
	route: router
};

// 文件下载
router.get('/download', controller.Download);

// 访问权限
router.use(app.authServer.authenticate());

// 文件列表
router.get('/list', controller.List);

// 文件更新
router.post('/update', controller.Update);

// 文件移除
router.get('/remove', controller.Remove);

// 文件判断
router.get('/exists', controller.Exists);

// 文件上传
router.post('/upload', controller.Upload);

// 用户列表
router.get('/users', controller.Users);

// 文件权限
router.post('/authorize', controller.Authorize);