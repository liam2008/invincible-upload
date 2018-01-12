var debug = require('debug')('smartdo:controller:sample');
var ServerError = require('../errors/server-error');
var async = require('async');
var InvincibleDB = require('../models/invincible');
var Sample = InvincibleDB.getModel('sample');
var SplPurchase = InvincibleDB.getModel('sample_purchase');
var User = InvincibleDB.getModel('user');
var Supplier = InvincibleDB.getModel('supplier');
var moment = require('moment');
var PadLeft = require('padleft');
var mongoose = require('mongoose');

var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;
var Utils = Shared.Utils;
var dealErr = require('../errors/controller-error');

//var MysqlCrawler = require('../databases/mysql_crawler');

module.exports = {
    name: "sample",

    orderList: function (req, res, next) {
        var findCondition = {};

        var results = {};
        async.series([
                // 根据样品名称找出相关样品作为查询条件
                function (callB) {
                    if (req.query.name) {
                        findCondition.sampleID = [];
                        var reg = new RegExp(req.query.name);
                        var findRequire = {name: reg};
                        Sample.find(findRequire, [], function (err, sampleListFound) {
                            if (dealErr.findErr(err, res)) return callB(err);
                            console.log(sampleListFound)
                            sampleListFound.forEach(function (sampleFound) {
                                findCondition.sampleID.push(sampleFound._id);
                            });
                            callB(null);
                        })
                    }else {
                        callB(null);
                    }
                },

                // 根据查询条件找出相关样品单
                function (callB) {
                    var list = [];
                    if (req.query.applicantId) findCondition.applicant = req.query.applicantId;
                    if (req.query.startTime) {
                        findCondition.createdAt = findCondition.createdAt || {};
                        findCondition.createdAt.$gte = req.query.startTime;
                    }
                    if (req.query.endTime) {
                        findCondition.createdAt = findCondition.createdAt || {};
                        findCondition.createdAt.$lte = req.query.endTime;
                    }
                    SplPurchase.find(findCondition)
                        .populate("sample_id")
                        .populate("supplier", ["name"])
                        .populate("applicant", ["name"])
                        .sort({sample_number: -1})
                        .exec(function (err, splPurchasesFound) {
                            if (dealErr.findErr(err, res)) return callB(err);
                            splPurchasesFound.forEach(function (splPurchaseFound) {
                                var purchase = {};
                                purchase.purId = splPurchaseFound._id;
                                purchase.sampleNum = splPurchaseFound.sample_number;
                                purchase.purStatus = splPurchaseFound.status;
                                purchase.purPicture = "";
                                if (splPurchaseFound.sample_id) {
                                    purchase.splName = splPurchaseFound.sample_id.name;
                                    purchase.splModel = splPurchaseFound.sample_id.model;
                                    purchase.splSpec = splPurchaseFound.sample_id.spec;
                                    purchase.splColor = splPurchaseFound.sample_id.color;
                                    purchase.splLink = splPurchaseFound.sample_id.link;
                                }
                                if (splPurchaseFound.supplier) purchase.supplier = splPurchaseFound.supplier.name;
                                purchase.purAmt = splPurchaseFound.purchase_amount;
                                purchase.signAmt = splPurchaseFound.sign_amount;
                                purchase.purPrice = splPurchaseFound.price;
                                purchase.freight = splPurchaseFound.freight;
                                if (splPurchaseFound.applicant) purchase.applicant = splPurchaseFound.applicant.name;

                                list.push(purchase);
                            });
                            results.spllist = list;
                            callB(null);
                        })
                },

                // 查询所有申请人返回给下拉框
                function (callB) {
                    var applicants = [];
                    User.find({}, ["name"])
                        .sort({name: 1})
                        .exec(function (err, usersFound) {
                            if (dealErr.findErr(err, res)) return callB(err);
                            usersFound.forEach(function (userFound) {
                                var applicant = {};
                                applicant.applId = userFound._id;
                                applicant.applName = userFound.name;

                                applicants.push(applicant);
                            });
                            results.applicants = applicants;
                            callB(null);
                        })
                }
            ],
            function (err) {
                if (err) {
                    debug(new Error(err));
                    return;
                }
                res.success(results);
            }
        )
    },

    openNewOrder: function (req, res, next) {
        var results = {};
        async.series([
                // 获取所有供应商
                function (callB) {
                    var select = [];
                    Supplier.find({}, ["name"])
                        .sort({name: 1})
                        .exec(function (err, suppliersFound) {
                            if (dealErr.findErr(err, res)) return callB(err);
                            suppliersFound.forEach(function (supplierFound) {
                                var supplier = {};
                                supplier.splId = supplierFound._id;
                                supplier.splName = supplierFound.name;

                                select.push(supplier);
                            });
                            results.splSelect = select;
                            callB(null);
                        })
                },

                // 获取所有样品
                function (callB) {
                    var select = [];
                    Sample.find({}, ["name"])
                        .sort({name: 1})
                        .exec(function (err, samplesFound) {
                            if (dealErr.findErr(err, res)) return callB(err);
                            samplesFound.forEach(function (sampleFound) {
                                var sample = {};
                                sample.splId = sampleFound._id;
                                sample.splName = sampleFound.name;

                                select.push(sample);
                            });
                            results.sampleSelect = select;
                            callB(null);
                        })
                }
            ],
            function (err) {
                if (err) {
                    return debug(new Error(err));
                }
                res.success(results);
            }
        )
    },

    orderSave: function (req, res, next) {
        if (!req.body.applId || !req.body.type || !req.body.splId || !req.body.supplierID || !req.body.mode || !req.body.status || !req.body.purAmt
            || !req.body.price || !req.body.freight) return res.error(ERROR_CODE.MISSING_ARGUMENT);

        var splNum = "";
        async.series([
                function (callB) {
                    var findRequire = {};
                    req.body.type = Utils.toNumber(req.body.type);
                    findRequire.type = req.body.type;
                    findRequire.createdAt = {};
                    findRequire.createdAt.$gte = moment().format("YYYY-MM-DD");
                    findRequire.createdAt.$lte = moment().add(1, 'days').format("YYYY-MM-DD");
                    SplPurchase.aggregate([
                        {$match: findRequire},
                        {$sort: {sample_number: -1}},
                        {$group: {_id: "$sample_number", createdAt: {$first: "$createdAt"}}}
                    ], function (err, purNewFound) {
                        if (dealErr.findErr(err, res)) return callB(err);
                        if (purNewFound.length != 0) {
                            for (var m = 0; m < purNewFound.length; m++) {
                                var splNumer = Utils.toNumber(purNewFound[0]._id.substring(2));
                                splNumer += 1;
                                splNum = purNewFound[0]._id.substring(0, 2) + splNumer.padLeft(4, '0');
                            }
                        }else {
                            if (req.body.type == 1) {
                                splNum = "SS00001";
                            }else {
                                splNum = "US00001";
                            }
                        }
                        callB(null);
                    })
                },

                function (callB) {
                    req.body.applId = mongoose.Types.ObjectId(req.body.applId);
                    req.body.supplierID = mongoose.Types.ObjectId(req.body.supplierID);
                    req.body.splId = mongoose.Types.ObjectId(req.body.splId);
                    if (typeof (req.body.mode) != "number") req.body.mode = Utils.toNumber(req.body.mode);
                    if (typeof (req.body.status) != "number") req.body.status = Utils.toNumber(req.body.status);
                    if (typeof (req.body.purAmt) != "number") req.body.purAmt = Utils.toNumber(req.body.purAmt);
                    if (typeof (req.body.price) != "number") req.body.price = Utils.toNumber(req.body.price);
                    if (typeof (req.body.freight) != "number") req.body.freight = Utils.toNumber(req.body.freight);

                    var newPurchase = new SplPurchase();
                    newPurchase.sample_id = req.body.sampleID;       // 采购样品
                    newPurchase.mode = req.body.mode;                                                  // 采购类型(样品采购)
                    newPurchase.type = req.body.type;                                                // 采购方式（1、国内采购、2、亚马逊采购）
                    newPurchase.sample_number = splNum;                                          // 编号
                    newPurchase.status = req.body.status;                                               // 采购状态(已创建，待编辑、已提交，待采购、采购中，待收货、部分收货、全部收货。)
                    newPurchase.supplier = req.body.supplierID;      // 供应商
                    newPurchase.purchase_amount = req.body.purAmt;                                        // 采购数量
                    newPurchase.price = req.body.price;                                                  // 单价
                    newPurchase.freight = req.body.freight;                                               // 运费
                    newPurchase.applicant = req.body.applId;         // 申请人
                    newPurchase.remarks = [];                                                    // 备注

                    newPurchase.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
                    newPurchase.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

                    newPurchase.save(function (err) {
                        if (dealErr.createErr(err, res)) return callB(err);
                        callB(null);
                    })
                }
            ],
            function (err) {
                if (err) {
                    debug(new Error(err));
                    return;
                }
                res.success();
            }
        )
    },

    orderEdit: function (req, res, next) {
        if (!(req.body.applId && req.body.type && req.body.splId && req.body.supplierId && req.body.mode && req.body.status && req.body.purAmt
            && req.body.price && req.body.freight) || !req.body.extNum || !req.body.signAmt) return res.error(ERROR_CODE.MISSING_ARGUMENT);

        if (typeof (req.body.signAmt) != "number") req.body.signAmt = Utils.toNumber(req.body.signAmt);

        var splNum;
        async.series([
                function (callB) {
                    var findRequire = {};
                    req.body.type = Utils.toNumber(req.body.type);
                    findRequire.type = req.body.type;
                    findRequire.createdAt = {};
                    findRequire.createdAt.$gte = moment().format("YYYY-MM-DD");
                    findRequire.createdAt.$lte = moment().add(1, 'days').format("YYYY-MM-DD");
                    SplPurchase.aggregate([
                        {$match: findRequire},
                        {$sort: {sample_number: -1}},
                        {$group: {_id: "$sample_number", createdAt: {$first: "$createdAt"}}}
                    ], function (err, purNewFound) {
                        if (dealErr.findErr(err, res)) return callB(err);
                        if (purNewFound.length != 0) {
                            for (var m = 0; m < purNewFound.length; m++) {
                                var splNumer = Utils.toNumber(purNewFound[0]._id.substring(2));
                                splNumer += 1;
                                splNum = purNewFound[0]._id.substring(0, 2) + splNumer.padLeft(4, '0');
                            }
                        }else {
                            if (req.body.type == 1) {
                                splNum = "SS00001";
                            }else {
                                splNum = "US00001";
                            }
                        }
                        callB(null);
                    })
                },

                function (callB) {
                    var findRequire = {};
                    findRequire._id = mongoose.Types.ObjectId(req.params.purId);
                    SplPurchase.findOne(findRequire, function (err, splPurFound) {
                        if (dealErr.findErr(err, res)) return callB(err);
                        if (splPurFound) {
                            if (req.body.signAmt) {
                                if (!splPurFound.external_number) {
                                    res.error(ERROR_CODE.INVALID_REQUEST);
                                    return callB(ERROR_CODE.INVALID_REQUEST);
                                }else {
                                    splPurFound.sign_amount = req.body.signAmt;
                                    splPurFound.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
                                    splPurFound.save(function (err) {
                                        if (dealErr.updateErr(err, res)) return callB(err);
                                        return callB(null);
                                    })
                                }
                            }else if (req.body.extNum) {
                                splPurFound.external_number = req.body.extNum;
                                splPurFound.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
                                splPurFound.save(function (err) {
                                    if (dealErr.updateErr(err, res)) return callB(err);
                                    return callB(null);
                                })
                            }else {
                                req.body.applId = mongoose.Types.ObjectId(req.body.applId);
                                req.body.splId = mongoose.Types.ObjectId(req.body.splId);
                                req.body.sampleId = mongoose.Types.ObjectId(req.body.sampleId);

                                splPurFound.sample_id = req.body.sampleId;       // 采购样品
                                splPurFound.mode = req.body.mode;                                                  // 采购类型(样品采购)
                                splPurFound.type = req.body.type;                                                // 采购方式（1、国内采购、2、亚马逊采购）
                                splPurFound.status = req.body.status;                                               // 采购状态(已创建，待编辑、已提交，待采购、采购中，待收货、部分收货、全部收货。)
                                splPurFound.supplier = req.body.splId;      // 供应商
                                splPurFound.purchase_amount = req.body.purAmt;                                        // 采购数量
                                splPurFound.price = req.body.price;                                                  // 单价
                                splPurFound.freight = req.body.freight;                                               // 运费
                                splPurFound.applicant = req.body.applId;         // 申请人

                                splPurFound.save(function (err) {
                                    if (dealErr.updateErr(err, res)) return callB(err);
                                    return callB(null);
                                })
                            }
                        }else {
                            res.error(ERROR_CODE.UNKNOW_ERR);
                            return callB(ERROR_CODE.UNKNOW_ERR);
                        }
                    })
                }
            ],
            function (err) {
                if (err) {
                    return debug(new Error(err));
                }
                res.success();
            }
        )
    }
};