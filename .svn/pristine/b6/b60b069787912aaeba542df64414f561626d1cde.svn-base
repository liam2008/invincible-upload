/*
 * Base Dependencies
 */
var express = require('express');
var router = express.Router();

/*
 * Server Dependencies
 */
var debug = require('debug')('smartdo:route:teams');
var app = require('../app');
var controller = require('../controllers').teams;
var helper = require('../middleware/helper');

/*
 * UModules Dependencies
 */

module.exports = {
    path: "/teams",
    route: router
};

router.use(app.authServer.authenticate());

router.get('/', helper.team_list, controller.list);
router.post('/', controller.create);

router.get('/:id', controller.get);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
