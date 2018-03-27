var debug = require('debug')('smartdo:controller:sample');
var ServerError = require('../errors/server-error');
var async = require('async');
var InvincibleDB = require('../models/invincible');
var Sample = InvincibleDB.getModel('sample');
var SplPurchase = InvincibleDB.getModel('sample_purchase');
var SplManager = InvincibleDB.getModel('sample_manager');
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
                    var curPage = req.query.curPage || 1;
                    if (typeof (curPage) != "number") curPage = Utils.toNumber(curPage);
                    var pageSize = req.query.pageSize || 10;
                    if (typeof (pageSize) != "number") pageSize = Utils.toNumber(pageSize);
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
                        .sort({sample_number: -1})
                        .skip((curPage - 1) * pageSize)
                        .limit(pageSize)
                        .populate("sample_id")
                        .populate("supplier", ["name"])
                        .populate("applicant", ["name"])
                        .exec(function (err, splPurchasesFound) {
                            if (dealErr.findErr(err, res)) return callB(err);
                            splPurchasesFound.forEach(function (splPurchaseFound) {
                                var purchase = {};
                                purchase.purId = splPurchaseFound._id;
                                purchase.purNum = splPurchaseFound.sample_number;
                                purchase.purCreDate = moment(splPurchaseFound.createdAt).format("YYYY-MM-DD HH:mm:ss");
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
                                supplier.supplierId = supplierFound._id;
                                supplier.supplierName = supplierFound.name;

                                select.push(supplier);
                            });
                            results.supplierSelect = select;
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
                            results.splSelect = select;
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
        if (!req.body.applId || !req.body.type || !req.body.splId || !req.body.supplierId || !req.body.mode || !req.body.status || !req.body.purAmt
            || !req.body.price || !req.body.freight) return res.error(ERROR_CODE.MISSING_ARGUMENT);

        var splNum = "";
        async.series([
                function (callB) {
                    var findRequire = {};
                    if (typeof (req.body.type) != "number") req.body.type = Utils.toNumber(req.body.type);
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
                    req.body.supplierId = mongoose.Types.ObjectId(req.body.supplierId);
                    req.body.splId = mongoose.Types.ObjectId(req.body.splId);
                    if (typeof (req.body.mode) != "number") req.body.mode = Utils.toNumber(req.body.mode);
                    if (typeof (req.body.status) != "number") req.body.status = Utils.toNumber(req.body.status);
                    if (typeof (req.body.purAmt) != "number") req.body.purAmt = Utils.toNumber(req.body.purAmt);
                    if (typeof (req.body.price) != "number") req.body.price = Utils.toNumber(req.body.price);
                    if (typeof (req.body.freight) != "number") req.body.freight = Utils.toNumber(req.body.freight);

                    var newPurchase = new SplPurchase();
                    newPurchase._id = mongoose.Types.ObjectId();
                    newPurchase.sample_id = req.body.splId;       // 采购样品
                    newPurchase.mode = req.body.mode;                                                  // 采购类型(样品采购)
                    newPurchase.type = req.body.type;                                                // 采购方式（1、国内采购、2、亚马逊采购）
                    newPurchase.sample_number = splNum;                                          // 编号
                    newPurchase.status = req.body.status;                                               // 采购状态(已创建，待编辑、已提交，待采购、采购中，待收货、部分收货、全部收货。)
                    newPurchase.supplier = req.body.supplierId;      // 供应商
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
        if (!(req.body.applId && req.body.splId && req.body.supplierId && req.body.mode && req.body.status && req.body.purAmt
            && req.body.price && req.body.freight) && !req.body.extNum && !req.body.signAmt) return res.error(ERROR_CODE.MISSING_ARGUMENT);

        if (typeof (req.body.signAmt) != "number") req.body.signAmt = Utils.toNumber(req.body.signAmt);

        async.series([
                function (callB) {
                    var findRequire = {};
                    findRequire._id = mongoose.Types.ObjectId(req.params.purId);
                    SplPurchase.findOne(findRequire, function (err, splPurFound) {
                        if (dealErr.findErr(err, res)) return callB(err);
                        if (splPurFound) {
                            // 签收
                            if (req.body.signAmt) {
                                if (!splPurFound.external_number) {
                                    res.error(ERROR_CODE.INVALID_REQUEST);
                                    return callB(ERROR_CODE.INVALID_REQUEST);
                                }else {
                                    var signAmt = splPurFound.sign_amount + req.body.signAmt;
                                    if (signAmt <= splPurFound.purchase_amount) {
                                        splPurFound.sign_amount = signAmt;
                                    }else {
                                        res.error(ERROR_CODE.OVER_NUMBER);
                                        return callB(ERROR_CODE.OVER_NUMBER);
                                    }
                                    if (splPurFound.sign_amount == splPurFound.purchase_amount) {
                                        splPurFound.status = 5;
                                        splPurFound.stock_in = moment().format("YYYY-MM-DD HH:mm:ss");
                                    }else {
                                        splPurFound.status = 4;
                                    }
                                    splPurFound.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
                                    splPurFound.save(function (err) {
                                        if (dealErr.updateErr(err, res)) return callB(err);
                                        return callB(null);
                                    })
                                }
                            }else if (req.body.extNum) {
                                // 关联单号
                                splPurFound.external_number = req.body.extNum;
                                splPurFound.status = 3;
                                splPurFound.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
                                splPurFound.save(function (err) {
                                    if (dealErr.updateErr(err, res)) return callB(err);
                                    return callB(null);
                                })
                            }else {
                                req.body.applId = mongoose.Types.ObjectId(req.body.applId);
                                req.body.splId = mongoose.Types.ObjectId(req.body.splId);
                                req.body.supplierId = mongoose.Types.ObjectId(req.body.supplierId);

                                splPurFound.sample_id = req.body.splId;       // 采购样品
                                splPurFound.mode = req.body.mode;                                                  // 采购类型(样品采购)
                                splPurFound.status = req.body.status;                                               // 采购状态(1、已创建，待编辑、2、已提交，待采购、3、采购中，待收货、4、部分收货、5、全部收货。)
                                splPurFound.supplier = req.body.supplierId;      // 供应商
                                splPurFound.purchase_amount = req.body.purAmt;                                        // 采购数量
                                splPurFound.price = req.body.price;                                                  // 单价
                                splPurFound.freight = req.body.freight;                                               // 运费
                                splPurFound.applicant = req.body.applId;         // 申请人
                                splPurFound.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

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
    },

    sampleSave: function (req, res, next) {
        if (!req.body.name) return res.error(ERROR_CODE.MISSING_ARGUMENT);

        async.series([
                function (callB) {
                    var newSample = new Sample({});
                    newSample._id = mongoose.Types.ObjectId();
                    newSample.name = req.body.name;
                    if (req.body.model) newSample.model = req.body.model;
                    if (req.body.spec) newSample.spec = req.body.spec;
                    if (req.body.color) newSample.color = req.body.color;
                    if (req.body.link) newSample.link = req.body.link;

                    newSample.save(function (err) {
                        if (dealErr.createErr(err, res)) return callB(err);
                        return callB(null);
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
    },

    splBorrowList: function (req, res, next) {
        if (req.query.splType && typeof (req.query.splType) != "number") req.query.splType = Utils.toNumber(req.query.splType);
        if (req.query.option && typeof (req.query.option) != "number") req.query.option = Utils.toNumber(req.query.option);

        var findCondition = {};
        var orderId2borrow = {};
        var results = {};
        async.series([
                // 根据样品名称找出相应样品再找出采购单
                function (callB) {
                    if (req.query.splName) {
                        var findRequire = {};
                        var reg = new RegExp(req.query.splName);
                        findRequire.name = reg;
                        Sample.find(findRequire, [], function (err, splsFound) {
                            if (dealErr.findErr(err, res)) return callB(err);
                            splsFound.forEach(function (splFound) {
                                findCondition.sample_id = findCondition.sample_id || {};
                                findCondition.sample_id.$in = findCondition.sample_id.$in || [];
                                findCondition.sample_id.$in.push(splFound._id);
                            });
                            callB(null);
                        })
                    }else {
                        callB(null)
                    }
                },

                // 根据搜索条件找出签收数和借出数的关系
                function (callB) {
                    if (req.query.splName || req.query.splType || req.query.option == 2) {
                        SplPurchase.find(findCondition, ["sign_amount"])
                            .exec(function (err, splPursFound) {
                                if (dealErr.findErr(err, res)) return callB(err);
                                findCondition = {};
                                findCondition.$or = [];
                                splPursFound.forEach (function (splPurFound) {
                                    var findRequire = {};
                                    if (req.query.splType == 1) {
                                        if (req.query.option == 3) {
                                            res.error(ERROR_CODE.INVALID_REQUEST);
                                            return callB(ERROR_CODE.INVALID_REQUEST);
                                        }
                                        findRequire.borrow = 0;
                                    }
                                    if (req.query.splType == 2 || req.query.option == 2) {
                                        findRequire.borrow = {$lt: splPurFound.sign_amount};
                                    }
                                    if (req.query.splType == 3) {
                                        if (req.query.option == 2) {
                                            res.error(ERROR_CODE.INVALID_REQUEST);
                                            return callB(ERROR_CODE.INVALID_REQUEST);
                                        }
                                        findRequire.borrow = splPurFound.sign_amount;
                                    }
                                    findRequire.sample_order = splPurFound._id;
                                    findCondition.$or.push(findRequire);
                                });
                                callB(null);
                            })
                    }else {
                        callB(null);
                    }
                },

                // 根据采购单和查询条件找出申请数据
                function (callB) {
                    var findRequire = {deletedAt: null};

                    if (req.query.option == 3) {
                        var applicant = mongoose.Types.ObjectId(req.agent.id);
                        findRequire.applicant = applicant;
                    }
                    if (req.query.startTime) findRequire.createdAt = {$gte: moment(req.query.startTime).format("YYYY-MM-DD HH:mm:ss")};
                    if (req.query.endTime) findRequire.createdAt = {$lte: moment(req.query.endTime).substract(1, 'day').format("YYYY-MM-DD HH:mm:ss")};
                    SplManager.aggregate([
                        {$match: findRequire},
                        {$sort: {forecast_return_time: -1}},
                        {
                            $group: {
                                _id: "$sample_order",
                                borrowVol: {$sum: "$borrow_amount"},
                                returnVol: {$sum: "$return_amount"}
                            }
                        },
                        {$project: {borrowed: {"$subtract": ["$borrowVol", "$returnVol"]}}},
                        {$match: findCondition}
                    ], function (err, sqlMgrsFound) {
                        if (dealErr.findErr(err, res)) return callB(err);
                        findCondition = {_id: {$in: []}};
                        sqlMgrsFound.forEach(function (sqlMgrFound) {
                            orderId2borrow[sqlMgrFound._id] = sqlMgrFound.borrowed;
                            findCondition._id.$in.push(sqlMgrFound._id);
                        });
                        callB(null);
                    })
                },

                function (callB) {
                    var list = [];
                    var curPage = req.query.curPage || 1;
                    if (typeof (curPage) != "number") curPage = Utils.toNumber(curPage);
                    var pageSize = req.query.pageSize || 10;
                    if (typeof (pageSize) != "number") pageSize = Utils.toNumber(pageSize);
                    SplPurchase.find(findCondition)
                        .skip((curPage - 1) * pageSize)
                        .limit(pageSize)
                        .populate("sample_id")
                        .populate("supplier")
                        .exec(function (err, splPursFound) {
                            if (dealErr.findErr(err, res)) return callB(err);
                            splPursFound.forEach(function (splPurFound) {
                                var sample = {};
                                sample.splPurId = splPurFound._id;
                                sample.splNum = splPurFound.sample_number;
                                sample.picture = "";
                                if (splPurFound.sample_id) {
                                    sample.name = splPurFound.sample_id.name;
                                    sample.model = splPurFound.sample_id.model;
                                    sample.spec = splPurFound.sample_id.spec;
                                    sample.color = splPurFound.sample_id.color;
                                    sample.unit = splPurFound.sample_id.unit;
                                }
                                if (splPurFound.supplier) sample.supplier = splPurFound.supplier.name;
                                sample.price = splPurFound.price;
                                sample.total = splPurFound.sign_amount;
                                sample.borrow = orderId2borrow[splPurFound._id];

                                list.push(sample);
                            });
                            results.list = list;
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

    splBorrowSave: function (req, res, next) {
        if (!req.body.splPurId || !req.body.applyAmt || !req.body.fcstRtnT) return res.error(ERROR_CODE.MISSING_ARGUMENT);

        req.body.splPurId = mongoose.Types.ObjectId(req.body.splPurId);
        if (typeof (req.body.applyAmt) != "number") req.body.applyAmt = Utils.toNumber(req.body.applyAmt);

        async.series([
                function (callB) {
                    var findRequire = {};
                    findRequire.sample_order = req.body.splPurId;
                    SplManager.aggregate([
                        {$match: findRequire},
                        {$group : {_id : "$sample_order", borrowVol: {$sum: "$borrow_amount"}, returnVol:{$sum: "$return_amount"}}},
                        {$project:{borrowed:{"$subtract":["$borrowVol","$returnVol"]}} },
                        {$match: {"borrowed" : {$gte: 0}}}
                    ], function (err, splsAggFound) {
                        if (dealErr.findErr(err, res)) return callB(err);
                        var borrow = 0;
                        if (splsAggFound.length  > 1) {
                            res.error(ERROR_CODE.UNKNOW_ERR);
                            return callB(ERROR_CODE.UNKNOW_ERR);
                        }
                        splsAggFound.forEach(function (splAggFound) {
                            borrow = splAggFound.borrowed;
                        });
                        if (borrow < 0) {
                            res.error(ERROR_CODE.DB_VAL_ERROR);
                            return callB(ERROR_CODE.DB_VAL_ERROR);
                        }
                        findRequire = {};
                        findRequire._id = req.body.splPurId;
                        SplPurchase.findOne(findRequire, ["sign_amount"])
                            .exec(function (err, splPurFound) {
                                if (dealErr.findErr(err, res)) return callB(err);
                                if (splPurFound) {
                                    if (!splPurFound.sign_amount) splPurFound.sign_amount = 0;
                                    if (splPurFound.sign_amount >= borrow + req.body.applyAmt) {
                                        return callB(null);
                                    }else {
                                        res.error(ERROR_CODE.OVER_NUMBER);
                                        return callB(ERROR_CODE.OVER_NUMBER);
                                    }
                                }
                                res.error(ERROR_CODE.UNKNOW_ERR);
                                return callB(ERROR_CODE.UNKNOW_ERR);
                            })
                    })

                },

                function (callB) {
                    var newSplBorrow = new SplManager({});
                    newSplBorrow._id = mongoose.Types.ObjectId();
                    newSplBorrow.applicant = req.agent.id;
                    newSplBorrow.sample_order = req.body.splPurId;
                    newSplBorrow.apply_amount = req.body.applyAmt;                                      // 借出样品数
                    newSplBorrow.forecast_return_time = req.body.fcstRtnT;                                                   // 预计归还时间
                    newSplBorrow.reamarks = [];                                                                        // 备注

                    newSplBorrow.save(function (err) {
                        if (dealErr.createErr(err, res)) return callB(err);
                        callB(null);
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
    },

    splBorrowed: function (req, res, next) {
        var results = {};
        async.series([
                function (callB) {
                    var list = [];
                    var findRequire = {};
                    findRequire.applicant = mongoose.Types.ObjectId(req.agent.id);
                    SplManager.find(findRequire, ["apply_amount", "sample_order"])
                        .populate({path: "sample_order", select: "_id sample_id supplier sample_number price",
                            populate: [{path: "sample_id", select: "_id name model spec color"}, {path: "supplier", select: "_id name"}]})
                        .exec(function (err, splMgrsFound) {
                            if (dealErr.findErr(err, res)) return callB(err);
                            splMgrsFound.forEach(function (splMgrFound) {
                                var splManager = {};
                                splManager.borrowId = splMgrFound._id;
                                if (splMgrFound.sample_order) {
                                    splManager.splNum = splMgrFound.sample_order.sample_number;
                                    splManager.price= splMgrFound.sample_order.price;
                                    if (splMgrFound.sample_order.sample_id) {
                                        splManager.name = splMgrFound.sample_order.sample_id.name;
                                        if (splMgrFound.sample_order.sample_id.model) splManager.model = splMgrFound.sample_order.sample_id.model;
                                        if (splMgrFound.sample_order.sample_id.spec) splManager.spec = splMgrFound.sample_order.sample_id.spec;
                                        if (splMgrFound.sample_order.sample_id.color) splManager.color = splMgrFound.sample_order.sample_id.color;
                                    }
                                    if (splMgrFound.sample_order.supplier) {
                                        splManager.supplier = splMgrFound.sample_order.supplier.name
                                    }
                                }

                                splManager.picture = "";
                                splManager.applyAmt = splMgrFound.apply_amount;

                                list.push(splManager);
                            });
                            results.list = list;
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

    borrowCancel: function (req, res, next) {
        req.params.borrowId = mongoose.Types.ObjectId(req.params.borrowId);
        var findRequire = {
            _id: req.params.borrowId
        };
        SplManager.findOne(findRequire, function (err, splMgrFound) {
            if (dealErr.findErr(err, res)) return debug(new Error(err));
            if (splMgrFound) {
                if (splMgrFound.borrow_amount == splMgrFound.return_amount) {
                    splMgrFound.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
                    splMgrFound.deletedAt = moment().format("YYYY-MM-DD HH:mm:ss");
                    splMgrFound.save(function (err) {
                        if (dealErr.removeErr(err, res)) return debug(new Error(err));
                    })
                }else {
                    return res.error(ERROR_CODE.IS_BORROWING);
                }
            }else {
                return res.error(ERROR_CODE.UNKNOW_ERR);
            }
        })
    },

    splManager: function (req, res, next) {
        if (req.query.splType && typeof (req.query.splType) != "number") req.query.splType = Utils.toNumber(req.query.splType);
        if (req.query.option && typeof (req.query.option) != "number") req.query.option = Utils.toNumber(req.query.option);

        var findCondition = {};
        var orderId2borrow = {};
        var results = {};
        async.series([
                // 根据样品名称找出相应样品再找出采购单
                function (callB) {
                    if (req.query.splName) {
                        var findRequire = {};
                        var reg = new RegExp(req.query.splName);
                        findRequire.name = reg;
                        Sample.find(findRequire, [], function (err, splsFound) {
                            if (dealErr.findErr(err, res)) return callB(err);
                            splsFound.forEach(function (splFound) {
                                findCondition.sample_id = findCondition.sample_id || {};
                                findCondition.sample_id.$in = findCondition.sample_id.$in || [];
                                findCondition.sample_id.$in.push(splFound._id);
                            });
                            callB(null);
                        })
                    }else {
                        callB(null)
                    }
                },

                // 根据搜索条件找出签收数和借出数的关系
                function (callB) {
                    if (req.query.splName || req.query.splType || req.query.option == 2) {
                        SplPurchase.find(findCondition, ["sign_amount"])
                            .exec(function (err, splPursFound) {
                                if (dealErr.findErr(err, res)) return callB(err);
                                findCondition = {};
                                findCondition.$or = [];
                                splPursFound.forEach (function (splPurFound) {
                                    var findRequire = {};
                                    if (req.query.splType == 1) {
                                        if (req.query.option == 3) {
                                            res.error(ERROR_CODE.INVALID_REQUEST);
                                            return callB(ERROR_CODE.INVALID_REQUEST);
                                        }
                                        findRequire.borrow = 0;
                                    }
                                    if (req.query.splType == 2 || req.query.option == 2) {
                                        findRequire.borrow = {$lt: splPurFound.sign_amount};
                                    }
                                    if (req.query.splType == 3) {
                                        if (req.query.option == 2) {
                                            res.error(ERROR_CODE.INVALID_REQUEST);
                                            return callB(ERROR_CODE.INVALID_REQUEST);
                                        }
                                        findRequire.borrow = splPurFound.sign_amount;
                                    }
                                    findRequire.sample_order = splPurFound._id;
                                    findCondition.$or.push(findRequire);
                                });
                                callB(null);
                            })
                    }else {
                        callB(null);
                    }
                },

                // 根据采购单和查询条件找出申请数据
                function (callB) {
                    var curPage = req.query.curPage || 1;
                    if (typeof (curPage) != "number") curPage = Utils.toNumber(curPage);
                    var pageSize = req.query.pageSize || 10;
                    if (typeof (pageSize) != "number") pageSize = Utils.toNumber(pageSize);
                    var findRequire = {deletedAt: null};

                    if (req.query.option == 3) {
                        var applicant = mongoose.Types.ObjectId(req.agent.id);
                        findRequire.applicant = applicant;
                    }
                    if (req.query.startTime) findRequire.createdAt = {$gte: moment(req.query.startTime).format("YYYY-MM-DD HH:mm:ss")};
                    if (req.query.endTime) findRequire.createdAt = {$lte: moment(req.query.endTime).substract(1, 'day').format("YYYY-MM-DD HH:mm:ss")};
                    SplManager.aggregate([
                        {$match: findRequire},
                        {$sort: {forecast_return_time: -1}},
                        {
                            $group: {
                                _id: "$sample_order",
                                borrowVol: {$sum: "$borrow_amount"},
                                returnVol: {$sum: "$return_amount"}
                            }
                        },
                        {$project: {borrowed: {"$subtract": ["$borrowVol", "$returnVol"]}}},
                        {$match: findCondition},
                        {$skip: ((curPage - 1) * pageSize)},
                        {$limit: pageSize}
                    ], function (err, sqlMgrsFound) {
                        if (dealErr.findErr(err, res)) return callB(err);
                        findCondition = {_id: {$in: []}};
                        sqlMgrsFound.forEach(function (sqlMgrFound) {
                            orderId2borrow[sqlMgrFound._id] = sqlMgrFound.borrowed;
                            findCondition._id.$in.push(sqlMgrFound._id);
                        });
                        callB(null);
                    })
                },

                function (callB) {
                    var list = [];
                    SplPurchase.find(findCondition)
                        .populate("sample_id")
                        .populate("supplier")
                        .exec(function (err, splPursFound) {
                            if (dealErr.findErr(err, res)) return callB(err);
                            splPursFound.forEach(function (splPurFound) {
                                var sample = {};
                                sample.splPurId = splPurFound._id;
                                sample.splNum = splPurFound.sample_number;
                                sample.picture = "";
                                if (splPurFound.sample_id) {
                                    sample.name = splPurFound.sample_id.name;
                                    sample.model = splPurFound.sample_id.model;
                                    sample.spec = splPurFound.sample_id.spec;
                                    sample.color = splPurFound.sample_id.color;
                                    sample.unit = splPurFound.sample_id.unit;
                                }
                                if (splPurFound.supplier) sample.supplier = splPurFound.supplier.name;
                                sample.price = splPurFound.price;
                                sample.total = splPurFound.sign_amount;
                                sample.borrow = orderId2borrow[splPurFound._id];

                                list.push(sample);
                            });
                            results.list = list;
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
    }
};