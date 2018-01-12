var express = require('express');
var router = express.Router();
var controller = require('../controllers').files;

module.exports = {
	path: "/files",
	route: router
};

router.get('/list', controller.List);

router.get('/update', controller.Update);

router.get('/remove', controller.Remove);

router.post('/upload', controller.Upload);