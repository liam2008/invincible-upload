var express = require('express');
var router = express.Router();
var controller = require('../controllers').stores;

module.exports = {
	path: "/stores",
	route: router
};

router.get('/list', controller.storesList);

router.get('/register', controller.storesRegister);

router.get('/journal', controller.storesJournal);