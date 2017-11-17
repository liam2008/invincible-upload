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

/*
 * UModules Dependencies
 */

module.exports = {
    path: "/roles",
    route: router
};

router.use(app.authServer.authenticate());

router.get('/', roles.list);
router.post('/', roles.create);

router.get('/:id', roles.get);
router.put('/:id', roles.update);
router.delete('/:id', roles.delete);
