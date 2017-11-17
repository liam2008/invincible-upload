var express = require('express');
var router = express.Router();
var debug = require('debug')('smartdo:route:counted');
var app = require('../app');

var controller = require('../controllers').counted;

module.exports = {
    path: "/count",
    route: router
};

router.use(app.authServer.authenticate());

router.post('/counted', controller.counted);

router.get('/listFormula', controller.listFormula);

router.post('/updateFormula', controller.updateFormula);

router.post('/saveFormula', controller.saveFormula);

router.post('/deleteFormula', controller.deleteFormula);