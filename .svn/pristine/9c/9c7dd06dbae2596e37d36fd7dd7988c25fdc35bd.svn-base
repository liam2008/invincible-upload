/*
 * Base Dependencies
 */
var express = require('express');
var router = express.Router();

/*
 * Server Dependencies
 */
var debug = require('debug')('smartdo:route:roles');
var app = require('../app');
var roles = require('../controllers').roles;
var helper = require('../middleware/helper');

/*
 * UModules Dependencies
 */

module.exports = {
    path: "/roles",
    route: router
};

router.use(app.authServer.authenticate());

router.get('/', helper.role_management, roles.list);
router.post('/', roles.create);
router.get('/department', helper.department_list, roles.department);

router.get('/:id', roles.get);
router.put('/:id', roles.update);
router.delete('/:id', roles.delete);
