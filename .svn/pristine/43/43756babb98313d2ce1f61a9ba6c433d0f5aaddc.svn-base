/*
 * Base Dependencies
 */
var express = require('express');
var router = express.Router();

/*
 * Server Dependencies
 */
var debug = require('debug')('smartdo:route:users');
var app = require('../app');
var users = require('../controllers').users;

/*
 * UModules Dependencies
 */

module.exports = {
    path: "/users",
    route: router
};

router.use(app.authServer.authenticate());

router.get('/', users.list);
router.post('/', users.create);

router.get('/:id', users.get);
router.put('/:id', users.update);
router.delete('/:id', users.delete);
