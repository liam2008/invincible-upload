var express = require('express');
var router = express.Router();
var controller = require('../controllers').files;

module.exports = {
	path: "/files",
	route: router
};

router.get('/fileManager', controller.fileManager);

router.post('/fileManager/uoload', controller.fileManagerUpload);

router.post('/fileManager/update', controller.fileManagerUpdate);

router.post('/fileManager/remove', controller.fileManagerRemove);