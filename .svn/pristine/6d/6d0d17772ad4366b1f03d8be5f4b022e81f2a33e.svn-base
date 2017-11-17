var express = require('express');
var router = express.Router();
var debug = require('debug')('smartdo:route:sellerRank');
var app = require('../app');

var controller = require('../controllers').sellerRank;

module.exports = {
    path: "/sellerRank",
    route: router
};

router.use(app.authServer.authenticate());

router.get('/rankList', controller.rankList);

router.get('/popupList', controller.popupList);