var debug = require('debug')('smartdo:controller:supplier');
var ServerError = require('../errors/server-error');
var async = require('async');
var moment = require('moment');
var InvincibleDB = require('../models/invincible');
var Supplier = InvincibleDB.getModel('supplier');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;
var Utils = Shared.Utils;

module.exports = {
    name: "supplier",

    supplierList: function (req, res, next) {
        var findRequire = {};
        Supplier.find(findRequire).sort({name: 1}).exec(function (err, supListFound) {
            if(err) {
                debug(err);
                res.error(ERROR_CODE.FIND_FAILED);
                return;
            }
            var supResults = [];
            if (supListFound) {
                supListFound.forEach (function (supplierFound) {
                    var supResult = {
                        supplierId:supplierFound._id,
                        supplierName:supplierFound.name,
                        contacts: supplierFound.contacts,
                        telephone: supplierFound.telephone,
                        cellphone: supplierFound.cellphone
                    };
                    supResults.push(supResult);
                })
            }
            supResults = Utils.pakoZip(JSON.stringify(supResults));
            res.success(supResults);
        })
    },

    supplierSave: function (req, res, next) {
        var name = req.body.name || "";
        var contacts = req.body.contacts || "";
        var telephone = req.body.telephone || "";
        var cellphone = req.body.cellphone || "";

        var newSupplier = new Supplier ({
            _id: new mongoose.Types.ObjectId(),
            name: name,                       // 供应商名字
            contacts: contacts,                   // 联系人
            telephone: telephone,                  // 固定电话
            cellphone: cellphone,                  // 手机号码
            createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
            updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
        });
        newSupplier.save(function (err) {
            if (err) {
                debug(err);
                res.error(ERROR_CODE.CREATE_FAILED);
                return;
            }
            res.success();
        })
    },

    supplierUpdate: function (req, res, next) {
        var findRequire = {};
        findRequire._id = req.body.supplierId;
        Supplier.findOne(findRequire, function (err, supOneFound) {
            if(err) {
                debug(err);
                res.error(ERROR_CODE.FIND_FAILED);
                return;
            }
            if (supOneFound) {
                supOneFound.contacts = req.body.contacts || "";
                supOneFound.telephone = req.body.telephone || "";
                supOneFound.cellphone = req.body.cellphone || "";
                supOneFound.save(function (err) {
                    if (err) {
                        debug(err);
                        res.error(ERROR_CODE.UPDATE_FAILED);
                        return;
                    }
                    res.success();
                })
            }else {
                res.error(ERROR_CODE.NOT_EXISTS);
            }
        })
    },

    supplierOne: function (req, res, next) {
        var findRequire = {};
        findRequire._id = mongoose.Types.ObjectId(req.query.supplierId);
        Supplier.findOne(findRequire, function (err, supOneFound) {
            if (err) {
                debug(err);
                res.error(ERROR_CODE.FIND_FAILED);
                return;
            }
            if (supOneFound) {
                var supplier = {
                    supplierId: supOneFound._id,
                    supplierName: supOneFound.name,
                    contacts: supOneFound.contacts,
                    telephone: supOneFound.telephone,
                    cellphone: supOneFound.cellphone
                };
                res.success(supplier);
            }else {
                res.error(ERROR_CODE.NOT_EXISTS);
            }
        })
    }
};