var express = require('express');
var router = express.Router();

var app = require('../app');

var controller = require('../controllers').purchasePlan;
var subFileter = require('../middleware/sub-filter');
var procedure = require('../middleware/procedure');
var helper = require('../middleware/helper');

module.exports = {
    path: "/purchasePlan",
    route: router
};

router.use(app.authServer.authenticate());

router.post('/submit', controller.submit);

router.get('/show', helper.team_list, subFileter.purchase_plan, procedure.purchase_plan, controller.show);

router.get('/editShow', controller.editShow);

router.post('/editSubmit', controller.editSubmit);

router.post('/review', helper.team_list, subFileter.purchase_plan, procedure.purchase_plan, controller.review);

router.get('/getPeoples', controller.getPeoples);