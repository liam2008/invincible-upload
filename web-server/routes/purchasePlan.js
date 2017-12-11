var express = require('express');
var router = express.Router();

var app = require('../app');

var controller = require('../controllers').purchasePlan;

module.exports = {
    path: "/purchasePlan",
    route: router
};

router.use(app.authServer.authenticate());

router.post('/submit', controller.submit);

router.get('/show', controller.show);

router.get('/edit', controller.edit);
