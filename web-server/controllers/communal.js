var debug = require('debug')('smartdo:controller:daily');
var ServerError = require('../errors/server-error');
var uuid = require('uuid');
var moment = require('moment');
var UUID = require('uuid');
var DB = require('../models/invincible');
var Merchandise = DB.getModel('merchandise');
var Product = DB.getModel('product');
var Shops = DB.getModel('shops');

var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;

/*
 * UModules Dependencies
 */

module.exports = {
    name: "communal",

    shops: function (req, res, next) {
        var results = [];
        Shops.find({}, function(err, findResults) {
            if(err) {
                debug(err);
                res.error(ERROR_CODE.NOT_EXISTS);
                return;
            }

            findResults.forEach(function(row) {
                results.push(row.name);
            });

            results.sort();

            res.success(results);
        })
    }
};