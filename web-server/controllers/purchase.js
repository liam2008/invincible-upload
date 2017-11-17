var debug = require('debug')('smartdo:controller:purchase');
var ServerError = require('../errors/server-error');
var async = require('async');
var moment = require('moment');
var InvincibleDB = require('../models/invincible');
var Purchase = InvincibleDB.getModel('purchase');
var PurchaseDetail = InvincibleDB.getModel('purchaseDetail');
var Product = InvincibleDB.getModel('product');
var Merchandise = InvincibleDB.getModel('merchandise');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;
var Utils = Shared.Utils;

var dealErr = {
    findErr: function (err) {
        if(err) {
            debug(err);
            res.error(ERROR_CODE.FIND_FAILED);
            return true;
        }else {
            return false;
        }
    }
}

module.exports = {
    name: "purchase",

    purchaseList: function (req, res, next) {
        var detIDRequire = [];
        var purchases = [];
        var storeSkuReq = [];
        var NotFound = true;

        async.series([
                // 找出对应商品中文名
                function (callB) {
                    if (req.query.proNameCN) {
                        var regProNameCn = new RegExp(req.query.proNameCN);
                        Product.find({name_cn: regProNameCn}, function (err, proListFound) {
                            if(err) {
                                callB(err);
                                res.error(ERROR_CODE.FIND_FAILED);
                                return;
                            }
                            if (proListFound.length > 0) {
                                proListFound.forEach (function (productFound) {
                                    storeSkuReq.push(productFound.store_sku)
                                });
                            }else {
                                NotFound = false;
                            }
                            callB(null);
                        })
                    }else {
                        callB(null);
                    }
                },

                function (callB) {
                    if (storeSkuReq.length > 0) {
                        PurchaseDetail.find({store_sku: {$in: storeSkuReq}}, function (err, detListFound) {
                            if(err) {
                                callB(err);
                                res.error(ERROR_CODE.FIND_FAILED);
                                return;
                            }
                            if (detListFound.length > 0) {
                                detListFound.forEach (function (detFound) {
                                    detIDRequire.push(detFound._id);
                                });
                            }else {
                                NotFound = false;
                            }
                            callB(null);
                        })
                    }else {
                        callB(null);
                    }
                },
                // 根据库存sku找出订单
                function (callB) {
                    if (req.query.storeSku) {
                        var findRequire = {};
                        findRequire.store_sku = new RegExp(req.query.storeSku);
                        PurchaseDetail.find(findRequire, function (err, detListFound) {
                            if(err) {
                                callB(err);
                                res.error(ERROR_CODE.FIND_FAILED);
                                return;
                            }
                            if (detListFound.length > 0) {
                                detListFound.forEach (function (detFound) {
                                    if (detIDRequire.indexOf(detFound._id) == -1) detIDRequire.push(detFound._id);
                                })
                            }else {
                                NotFound = false;
                            }
                            callB(null)
                        })
                    }else {
                        callB(null)
                    }
                },
                //
                function (callB) {
                    if (NotFound) {
                        var findRequire = {};
                        if (req.query.orderNumber) findRequire.order_number = new RegExp(req.query.orderNumber);
                        if (req.query.contractNumber) findRequire.contract_number = new RegExp(req.query.contractNumber);
                        if (req.query.supplierId) findRequire.supplier = mongoose.Types.ObjectId(req.query.supplierId);
                        if (req.query.storeSku || req.query.proNameCN) findRequire.purDetails = {$in: detIDRequire};
                        if (req.query.orderStatus) findRequire.order_status = Utils.toNumber(req.query.orderStatus);

                        Purchase.find(findRequire)
                            .populate("supplier")
                            .sort({order_number: 1})
                            .exec(function (err, purListFound) {
                                if(err) {
                                    callB(err);
                                    res.error(ERROR_CODE.FIND_FAILED);
                                    return;
                                }
                                if (purListFound) {
                                    purListFound.forEach (function (purchaseFound) {
                                        var supplierName = '';
                                        if (purchaseFound.supplier) supplierName = purchaseFound.supplier.name;
                                        purchaseFound.order_status = (purchaseFound.order_status || '').toString() ;
                                        var purResult = {
                                            "orderNumber": purchaseFound.order_number,
                                            "contractNumber": purchaseFound.contract_number,
                                            "supplierName": supplierName,
                                            "purTotalPrice": purchaseFound.purchase_total_price,
                                            "orderStatus": purchaseFound.order_status,
                                            "remarks": purchaseFound.remarks || '',
                                            "isDeclare": purchaseFound.isDeclare + ""
                                        };
                                        purchases.push(purResult);
                                    })
                                }
                                callB(null)
                            })
                    }else {
                        callB(null);
                    }
                }
            ],
            function (err) {
                if (err) {
                    debug(new Error(err));
                    return;
                }
                res.success(purchases);
            }
        );
    },

    purchaseSave: function (req, res, next) {
        var findRequire = {};
        findRequire.order_number = req.body.orderNumber;
        // 库存sku不能有重复
        var skuNotRepeat = true;
        if (req.body.purDetails) {
            var allSku = [];
            req.body.purDetails.forEach(function (purDetail) {
                if (allSku.indexOf(purDetail.storeSku) == -1) {
                    allSku.push (purDetail.storeSku);
                }else {
                    skuNotRepeat = false;
                }
            })
        }
        Purchase.findOne(findRequire, function (err, purOne) {
            if(err) {
                debug(err);
                res.error(ERROR_CODE.FIND_FAILED);
                return;
            }
            if (!purOne && skuNotRepeat) {
                var arr = req.body.purDetails || [];
                var skuIds = [];
                var orderStatus = 0;
                var purTotalPrice = 0;
                if (req.body.orderStatus) orderStatus = Utils.toNumber(req.body.orderStatus);

                var iterator = function (json, cb) {
                    if (json == null || json.storeSku == null) {
                        cb(null);
                        return;
                    }

                    var unitPrice = 0;
                    if (json.unitPrice) unitPrice = Utils.toNumber(json.unitPrice);
                    var purQuantity = 0;
                    if (json.purQuantity) purQuantity = Utils.toNumber(json.purQuantity);
                    var totalPrice = 0;
                    if (json.totalPrice) totalPrice = Utils.toNumber(json.totalPrice);
                    var delQuantity = 0;
                    if (json.delQuantity) delQuantity = Utils.toNumber(json.delQuantity);
                    purTotalPrice += totalPrice;
                    var deliver = {};
                    deliver[json.deliverDate] = delQuantity;
                    // 不为负数
                    if (unitPrice < 0 && purQuantity <= 0 && totalPrice < 0 && delQuantity <= 0) {
                        cb(null);
                        res.error(ERROR_CODE.INVALID_ARGUMENT);
                        return;
                    }

                    // 往下执行
                    async.series([
                            // 添加订单详情
                            function (callB) {
                                var _id = new mongoose.Types.ObjectId();
                                var newPurDetail = new PurchaseDetail ({
                                    _id: _id,
                                    store_sku: json.storeSku,                                                        // 库存SKU
                                    unit_price: unitPrice,                                                 // 单价
                                    purchase_quantity: purQuantity,                                          // 采购数量
                                    total_price: totalPrice,                                                // 总金额(含运费)
                                    contract_covenant_date: json.conCovDate,                                       // 合同约定交期
                                    deliver: deliver,                                                    // 实际交期:交货数量
                                    deliver_total: delQuantity,                                               // 已交货数量
                                    logistics_number: json.logNumber,                                            // 物流追踪单号
                                    salesman: json.salesman,                                                    // 业务员
                                    updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                                    createdAt: moment().format('YYYY-MM-DD HH:mm:ss')
                                });
                                newPurDetail.save(function (err) {
                                    if (err) {
                                        callB(err);
                                        res.error(ERROR_CODE.CREATE_FAILED);
                                        return;
                                    }
                                    skuIds.push(_id);
                                    callB(null);
                                });
                            }
                        ],
                        function (err) {
                            if (err) {
                                cb(err);
                                return;
                            }
                            cb(null);
                        }
                    );
                };

                async.eachSeries(arr, iterator, function (err) {
                    if (err != null) {
                        debug(err);
                        return;
                    }
                    // 添加采购单
                    var orderTime = moment(req.body.orderTime).format('YYYY-MM-DD');
                    var newPurchase = new Purchase ({
                        _id: new mongoose.Types.ObjectId(),
                        order_number: req.body.orderNumber,                                               // 订单号
                        contract_number: req.body.contractNumber,                                            // 合同号
                        order_time: orderTime,                                                   // 下单时间
                        supplier: mongoose.Types.ObjectId(req.body.supplierId),                                            // 供应商
                        buyer: req.body.buyer || "",                                                      // 采购员
                        purDetails: skuIds,                                                  // 库存SKU的ID
                        order_status: orderStatus,                                               // 订单基本状态
                        purchase_total_price: purTotalPrice,                                               // 订单总金额
                        pickup_way: req.body.pickupWay || "",                                                 // 提货方式
                        isDeclare: Utils.toNumber(req.body.isDeclare || ""),                                                 // 是否报关
                        remarks: (moment().format('YYYY-MM-DD HH:mm:ss') + "：\n" + (req.body.remark || "")).toString(),                                                      // 详细备注
                        updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                        createdAt: moment().format('YYYY-MM-DD HH:mm:ss')
                    });
                    newPurchase.save(function (err) {
                        if (err) {
                            debug(err);
                            res.error(ERROR_CODE.CREATE_FAILED);
                            return;
                        }
                        res.success();
                    });
                });
            }else {
                res.error(ERROR_CODE.INVALID_ARGUMENT);
            }
        })
    },

    productList: function (req, res, next) {
        var findRequire= {};
        if (req.query.storeSku) findRequire.store_sku = req.query.storeSku;
        if (req.query.proName) {
            var proName = req.query.proName.trim();
            proName = new RegExp(proName);
            findRequire.name_cn = proName;
        }
        Product.find(findRequire)
            .sort({store_sku: 1})
            .exec(function (err, proListFound) {
            if(err) {
                debug(err);
                res.error(ERROR_CODE.FIND_FAILED);
                return;
            }
            findRequire = {};
            if (req.query.proName) findRequire.name = proName;
            // 英文名
            Merchandise.find(findRequire, function (err, merListFound) {
                if(err) {
                    debug(err);
                    res.error(ERROR_CODE.FIND_FAILED);
                    return;
                }
                var results = [];
                var storeSku2NameEn = {};
                if (merListFound) {
                    merListFound.forEach (function (merFound) {
                        storeSku2NameEn[merFound.store_sku] = merFound.name;
                    })
                }
                if (proListFound) {
                    proListFound.forEach (function (proFound) {
                        var result = {
                            storeSku: proFound.store_sku,
                            nameCN: proFound.name_cn,
                            nameEn: storeSku2NameEn[proFound.store_sku]
                        };
                        results.push(result);
                    })
                }

                res.success(results);
            });
        })
    },

    purchaseOne: function (req, res, next) {
        var findRequire = {};
        findRequire.order_number = req.query.orderNumber;
        Purchase.findOne(findRequire)
            .populate('supplier')
            .exec(function (err, purOneFound) {
            if(err) {
                debug(err);
                res.error(ERROR_CODE.FIND_FAILED);
                return;
            }
            if (purOneFound) {
                if (purOneFound.supplier.name) purOneFound.supplier._id = purOneFound.supplier._id.toString();
                var orderStatus = (purOneFound.order_status || "").toString();
                var purResult = {
                    "purchaseId": purOneFound._id,
                    "orderNumber": purOneFound.order_number,
                    "contractNumber": purOneFound.contract_number,
                    "supplier": {
                        supplierId: purOneFound.supplier._id,
                        supplierName: purOneFound.supplier.name
                    },
                    "orderTime": moment((purOneFound.order_time || "")).format('YYYY-MM-DD'),
                    "buyer": purOneFound.buyer || "",
                    "orderStatus": orderStatus,
                    "pickupWay": purOneFound.pickup_way || "",
                    "remarks": purOneFound.remarks || "",
                    "isDeclare": purOneFound.isDeclare + "",
                    "purDetails": []
                };
                findRequire = {};
                findRequire._id = {"$in": purOneFound.purDetails};
                var storeSku2nameCN = {};
                var storeSku2nameEN = {};
                var detailResults = [];

                async.series([
                        // 找出所有对应订单明细
                        function (callB) {
                            PurchaseDetail.find(findRequire)
                                .sort({store_sku: 1})
                                .exec(function (err, detListFound) {
                                if(err) {
                                    callB(err);
                                    res.error(ERROR_CODE.FIND_FAILED);
                                    return;
                                }
                                if (detListFound) {
                                    findRequire = {};
                                    findRequire.store_sku = {$in: []};
                                    detListFound.forEach (function (detailFound) {
                                        var delQuantity = "";
                                        var deliverDate = "";
                                        if (detailFound.deliver) {
                                            for (var date in detailFound.deliver) {
                                                delQuantity = detailFound.deliver[date];
                                                deliverDate = date;
                                                break;
                                            }
                                        }
                                        var detResult = {
                                            "storeSkuId": detailFound._id,
                                            "storeSku": detailFound.store_sku,
                                            "unitPrice":detailFound.unit_price,
                                            "purQuantity":detailFound.purchase_quantity,
                                            "totalPrice":detailFound.total_price,
                                            "conCovDate":moment((detailFound.contract_covenant_date || "")).format('YYYY-MM-DD'),
                                            "delQuantity":delQuantity,
                                            "deliverDate":deliverDate,
                                            "salesman": detailFound.salesman,
                                            "logNumber": detailFound.logistics_number
                                        };
                                        detailResults.push(detResult);
                                        findRequire.store_sku.$in.push(detailFound.store_sku);
                                    });

                                }
                                callB(null);
                            })
                        },

                        // 找出storeSku中文名
                        function (callB) {
                            if (findRequire.store_sku) {
                                Product.find(findRequire, function (err, proListFound) {
                                    if(err) {
                                        callB(err);
                                        res.error(ERROR_CODE.FIND_FAILED);
                                        return;
                                    }
                                    if (proListFound) {
                                        proListFound.forEach (function (productFound) {
                                            storeSku2nameCN[productFound.store_sku] = productFound.name_cn;
                                        })
                                    }
                                    callB(null);
                                })
                            }
                        },

                        // 找出storeSku英文名
                        function (callB) {
                            if (findRequire.store_sku) {
                                Merchandise.find(findRequire, function (err, merListFound) {
                                    if(err) {
                                        callB(err);
                                        res.error(ERROR_CODE.FIND_FAILED);
                                        return;
                                    }
                                    if (merListFound) {
                                        merListFound.forEach (function (merchandiseFound) {
                                            storeSku2nameEN[merchandiseFound.store_sku] = merchandiseFound.name;
                                        })
                                    }
                                    callB(null);
                                })
                            }
                        },

                        function (callB) {
                            if (detailResults.length > 0) {
                                detailResults.forEach(function (detailResult) {
                                    detailResult.proNameCN = storeSku2nameCN[detailResult.storeSku];
                                    detailResult.proNameEN = storeSku2nameEN[detailResult.storeSku];
                                })
                            }
                            purResult.purDetails = detailResults;
                            callB(null);
                        }
                ],
                function (err) {
                    if (err) {
                        debug(new Error(err));
                        return;
                    }
                    res.success(purResult);
                })
            }else {
                res.error(ERROR_CODE.NOT_EXISTS);
                return;
            }
        })
    },

    purUpdate: function (req, res, next) {
        var findRequire = {};
        findRequire._id = mongoose.Types.ObjectId(req.body.purchaseId);
        // 库存sku不能有重复
        var skuNotRepeat = true;
        if (req.body.purDetails) {
            var allSku = [];
            req.body.purDetails.forEach(function (purDetail) {
                if (allSku.indexOf(purDetail.storeSku) == -1) {
                    allSku.push (purDetail.storeSku);
                }else {
                    skuNotRepeat = false;
                }
            })
        }
        Purchase.findOne(findRequire, function (err, purOneFound) {
            if (err) {
                debug(err);
                res.error(ERROR_CODE.FIND_FAILED);
                return;
            }
            if (purOneFound && skuNotRepeat) {
                if (req.body.orderStatus) req.body.orderStatus = Utils.toNumber(req.body.orderStatus);

                purOneFound.buyer = req.body.buyer || "";
                purOneFound.pickup_way = req.body.pickupWay || "";
                if (req.body.remark) purOneFound.remarks.push(moment().format('YYYY-MM-DD HH:mm:ss') + "：\n" + req.body.remark.toString());
                purOneFound.isDeclare = Utils.toNumber(req.body.isDeclare);

                var editDelIDs = [];
                if (req.body.purDetails) {
                    req.body.purDetails.forEach (function (purDetail) {
                        editDelIDs.push(mongoose.Types.ObjectId(purDetail.storeSkuId));
                    })
                }

                var bothIDs = [];
                // 订单状态为待处理
                if (req.body.orderStatus == 10) {
                    purOneFound.order_number = req.body.orderNumber;
                    purOneFound.contract_number = req.body.contractNumber;
                    purOneFound.supplier = mongoose.Types.ObjectId(req.body.supplierId);
                    purOneFound.order_time = req.body.orderTime;
                }else {
                    bothIDs = editDelIDs;
                }
                if (purOneFound.purDetails) {
                    var deleteIterator = function (storeSkuId, cb) {
                        // 执行循环
                        async.series([
                                // 删除已经不存在的订单详情
                                function (callB) {
                                    var IsDel = true;
                                    for (var m = 0; m < editDelIDs.length; m++) {
                                        if (editDelIDs[m].toString() == storeSkuId.toString()) {
                                            IsDel = false;
                                            break;
                                        }
                                    }
                                    if (IsDel) {
                                        PurchaseDetail.remove({_id: storeSkuId}, function (err) {
                                            if (err) {
                                                callB(err);
                                                res.error(ERROR_CODE.DELETE_FAILED);
                                                return;
                                            }
                                            callB(null);
                                        })
                                    }else {
                                        bothIDs.push(storeSkuId);
                                        callB(null);
                                    }
                                }
                            ],
                            function (err) {
                                if (err) {
                                    cb(err);
                                    return;
                                }
                                cb(null)
                            }
                        );
                    };
                    async.eachSeries(purOneFound.purDetails, deleteIterator, function (err) {
                        if (err != null) {
                            debug(err);
                            return;
                        }
                        findRequire = {};
                        findRequire._id = {$in: bothIDs};
                        PurchaseDetail.find(findRequire, function (err, detListFound) {
                            if (err) {
                                debug(err);
                                res.error(ERROR_CODE.FIND_FAILED);
                                return;
                            }

                            var arr = req.body.purDetails || [];
                            var purTotalPrice = 0;

                            var iterator = function (json, cb) {
                                if (json == null || json.storeSku == null) {
                                    cb(null);
                                    return;
                                }

                                var unitPrice = 0;
                                if (json.unitPrice) unitPrice = Utils.toNumber(json.unitPrice + "");
                                var purQuantity = 0;
                                if (json.purQuantity) purQuantity = Utils.toNumber(json.purQuantity + "");
                                var totalPrice = 0;
                                if (json.totalPrice) totalPrice = Utils.toNumber(json.totalPrice + "");
                                var delQuantity = 0;
                                if (json.delQuantity) delQuantity = Utils.toNumber(json.delQuantity + "");
                                purTotalPrice += totalPrice;
                                var deliver = {};
                                deliver[json.deliverDate] = delQuantity;
                                // 不为负数
                                if (unitPrice < 0 && purQuantity <= 0 && totalPrice < 0 && delQuantity <= 0) {
                                    cb(null);
                                    res.error(ERROR_CODE.INVALID_ARGUMENT);
                                    return;
                                }

                                // 执行循环
                                async.series([
                                        // 添加或修改
                                        function (callB) {
                                            //if (bothIDs){
                                            //    for (var i = 0; i < bothIDs.length;i ++) {
                                            //        bothIDs[i] = bothIDs[i].toString();
                                            //    }
                                            //}
                                            var IsAdd = true;
                                            for (var l = 0; l < bothIDs.length; l++) {
                                                if (bothIDs[l].toString() == json.storeSkuId.toString()) {
                                                    IsAdd = false;
                                                    break;
                                                }
                                            }
                                            if (IsAdd) {
                                                // 添加
                                                var _id = new mongoose.Types.ObjectId();
                                                var newPurDetail = new PurchaseDetail ({
                                                    _id: _id,
                                                    store_sku: json.storeSku,                                                        // 库存SKU
                                                    unit_price: unitPrice,                                                 // 单价
                                                    purchase_quantity: purQuantity,                                          // 采购数量
                                                    total_price: totalPrice,                                                // 总金额(含运费)
                                                    contract_covenant_date: json.conCovDate,                                       // 合同约定交期
                                                    deliver: deliver,                                                    // 实际交期:交货数量
                                                    deliver_total: delQuantity,                                               // 已交货数量
                                                    logistics_number: json.logNumber,                                            // 物流追踪单号
                                                    salesman: json.salesman,                                                    // 业务员
                                                    updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                                                    createdAt: moment().format('YYYY-MM-DD HH:mm:ss')
                                                });
                                                newPurDetail.save(function (err) {
                                                    if (err) {
                                                        callB(err);
                                                        res.error(ERROR_CODE.CREATE_FAILED);
                                                        return;
                                                    }
                                                    callB(null);
                                                })
                                            }else {
                                                // 修改
                                                if (detListFound) {
                                                    var IDNumbers = 0;
                                                    for (var j = 0; j < detListFound.length; j++) {
                                                        if (detListFound[j]._id.toString() == json.storeSkuId) {
                                                            IDNumbers = j;
                                                            break;
                                                        }
                                                    }
                                                    var detFound = detListFound[j];
                                                    detFound.logistics_number = json.logNumber;
                                                    detFound.salesman = json.salesman;
                                                    if (req.body.orderStatus == 10) {
                                                        detFound.store_sku = json.storeSku;                                                  // 库存SKU
                                                        detFound.unit_price= json.unitPrice;                                                 // 单价
                                                        detFound.purchase_quantity= json.purQuantity;                                          // 采购数量
                                                        detFound.total_price= json.totalPrice;                                                // 总金额(含运费)
                                                        detFound.contract_covenant_date= json.conCovDate;                                       // 合同约定交期
                                                        detFound.deliver[json.deliverDate] = json.delQuantity;                                                    // 实际交期=交货数量
                                                        detFound.deliver_total= purTotalPrice;                                              // 已交货数量
                                                    }
                                                    detFound.save(function (err) {
                                                        if (err) {
                                                            callB(err);
                                                            res.error(ERROR_CODE.UPDATE_FAILED);
                                                            return;
                                                        }
                                                        callB(null);
                                                    })
                                                }
                                            }
                                        }
                                    ],
                                    function (err) {
                                        if (err) {
                                            cb(err);
                                            return;
                                        }
                                        cb(null);
                                    }
                                );
                            };

                            async.eachSeries(arr, iterator, function (err) {
                                if (err != null) {
                                    debug(err);
                                    return;
                                }
                                for (var k = 0; k < editDelIDs.length; k++) {
                                    editDelIDs[k] = mongoose.Types.ObjectId(editDelIDs[k]);
                                }
                                purOneFound.purDetails = editDelIDs;
                                purOneFound.save (function (err) {
                                    if (err) {
                                        debug(err);
                                        res.error(ERROR_CODE.UPDATE_FAILED);
                                        return;
                                    }
                                    res.success();
                                })
                            });
                        })
                    });
                }
            }else {
                res.error(ERROR_CODE.INVALID_ARGUMENT);
            }
        })
    },

    detailList: function (req, res, next) {
        var findRequire = {};
        findRequire.order_number = req.query.orderNumber;
        Purchase.findOne(findRequire)
            .populate('supplier')
            .exec(function (err, purOneFound) {
            if(err) {
                debug(err);
                res.error(ERROR_CODE.FIND_FAILED);
                return;
            }

            var orderStatus = (purOneFound.order_status || "").toString();
            var purchase = {
                "orderNumber":purOneFound.order_number,
                "contractNumber": purOneFound.contract_number,
                "orderTime": moment(purOneFound.order_time).format('YYYY-MM-DD'),
                "supplierName": purOneFound.supplier.name,
                "buyer": purOneFound.buyer,
                "orderStatus": orderStatus,
                "purTotalPrice": purOneFound.purchase_total_price,
                "pickupWay": purOneFound.pickup_way,
                "remarks": purOneFound.remarks,
                "isDeclare": purOneFound.isDeclare + ""
            };

            var purDetails = [];
            var storeSku2nameCN = {};
            var storeSku2nameEN = {};
            async.series([
                    // 找出
                    function (callB) {
                        if(purOneFound.purDetails) {
                            findRequire = {};
                            findRequire._id = {$in: purOneFound.purDetails};
                            PurchaseDetail.find(findRequire)
                                .sort({store_sku: 1})
                                .exec(function (err, detListFound) {
                                    if (err) {
                                        callB(err);
                                        res.error(ERROR_CODE.FIND_FAILED);
                                        return;
                                    }

                                    if (detListFound) {
                                        detListFound.forEach(function (detFound) {
                                            var deliverDate = moment("1970-01-01").format('YYYY-MM-DD');
                                            for (var date in detFound.deliver) {
                                                if (deliverDate < date) deliverDate = date
                                            }
                                            findRequire = {};
                                            findRequire.store_sku = {$in: []};
                                            var purDetail = {
                                                "storeSku": detFound.store_sku,
                                                "unitPrice": detFound.unit_price || "",
                                                "purQuantity": detFound.purchase_quantity || "",
                                                "totalPrice": detFound.total_price,
                                                "conCovDate": moment(detFound.contract_covenant_date).format('YYYY-MM-DD'),
                                                "deliverTotal": detFound.deliver_total || "",
                                                "deliverDate": deliverDate,
                                                "salesman": detFound.salesman || "",
                                                "logNumber": detFound.logistics_number || ""
                                            };
                                            purDetails.push(purDetail);
                                            findRequire.store_sku.$in.push(detFound.store_sku);
                                        })
                                    }
                                    callB(null);
                                });
                        }
                    },
                    // 找出对应商品中文名
                    function (callB) {
                        if (findRequire.store_sku) {
                            Product.find(findRequire, function (err, proListFound) {
                                if(err) {
                                    callB(err);
                                    res.error(ERROR_CODE.FIND_FAILED);
                                    return;
                                }
                                if (proListFound) {
                                    proListFound.forEach (function (productFound) {
                                        storeSku2nameCN[productFound.store_sku] = productFound.name_cn;
                                    })
                                }
                                callB(null);
                            })
                        }else {
                            callB(null);
                        }
                    },
                    // 找出storeSku英文名
                    function (callB) {
                        if (findRequire.store_sku) {
                            Merchandise.find(findRequire, function (err, merListFound) {
                                if(err) {
                                    callB(err);
                                    res.error(ERROR_CODE.FIND_FAILED);
                                    return;
                                }
                                if (merListFound) {
                                    merListFound.forEach (function (merchandiseFound) {
                                        storeSku2nameEN[merchandiseFound.store_sku] = merchandiseFound.name;
                                    })
                                }
                                callB(null);
                            })
                        }else {
                            callB(null);
                        }
                    },

                    function (callB) {
                        if (purDetails.length > 0) {
                            purDetails.forEach(function (purDetail) {
                                purDetail.proNameCN = storeSku2nameCN[purDetail.storeSku];
                                purDetail.proNameEN = storeSku2nameEN[purDetail.storeSku];
                            })
                        }
                        purchase.purDetails = purDetails;
                        callB(null);
                    }
                ],
                function (err) {
                    if (err) {
                        debug(new Error(err));
                        return;
                    }
                    res.success(purchase);
                }
            );
        })
    },

    statusList: function (req, res, next) {
        var findRequire = {};
        findRequire.order_number = req.query.orderNumber;
        Purchase.findOne(findRequire, function (err, purOneFound) {
            if (err) {
                debug(err);
                res.error(ERROR_CODE.FIND_FAILED);
                return;
            }
            if (purOneFound) {
                if (!purOneFound.order_status) res.error(ERROR_CODE.NOT_EXISTS);
                var follow = {
                    orderStatus: purOneFound.order_status.toString(),
                    purDetails: []
                };

                findRequire = {};
                findRequire._id = {$in: purOneFound.purDetails};
                PurchaseDetail.find(findRequire)
                    .sort({store_sku: 1})
                    .exec(function (err, detListFound) {
                    if (err) {
                        debug(err);
                        res.error(ERROR_CODE.FIND_FAILED);
                        return;
                    }

                    findRequire = {};
                    findRequire.store_sku = [];
                    var purDetails = [];
                    if (detListFound) {
                        detListFound.forEach (function (detFound) {
                            findRequire.store_sku.push(detFound.store_sku);
                            var purDetail = {
                                "deliverId": detFound._id,
                                "storeSku": detFound.store_sku,
                                "purQuantity": detFound.purchase_quantity,
                                "deliverTotal": detFound.deliver_total
                            };
                            purDetails.push(purDetail);
                        })
                    }

                    Product.find(findRequire, function (err, proListFound) {
                        if (err) {
                            debug(err);
                            res.error(ERROR_CODE.FIND_FAILED);
                            return;
                        }

                        var storeSku2nameCN = {};
                        if (proListFound) {
                            proListFound.forEach (function (proOneFound) {
                                storeSku2nameCN[proOneFound.store_sku] = proOneFound.name_cn;
                            })
                        }
                        purDetails.forEach (function (purDetail) {
                            purDetail.proNameCN = storeSku2nameCN[purDetail.storeSku]
                        });
                        follow.purDetails = purDetails;
                        res.success(follow);
                    });
                })
            }else {
                res.error(ERROR_CODE.NOT_EXISTS);
            }
        })
    },

    statusUpdate: function (req, res, next) {
        var findRequire = {};
        findRequire.order_number = req.body.orderNumber;
        Purchase.findOne(findRequire, function (err, purOneFound) {
            if (err) {
                debug(err);
                res.error(ERROR_CODE.FIND_FAILED);
                return;
            }

            if (purOneFound) {
                purOneFound.order_status = Utils.toNumber(req.body.orderStatus);

                var iterator = function (json, cb) {
                    var delQuantity = 0;
                    if (json.delQuantity) delQuantity = Utils.toNumber(json.delQuantity);
                    // 不为负数
                    if (delQuantity <= 0) {
                        cb(null);
                        res.error(ERROR_CODE.INVALID_ARGUMENT);
                        return;
                    }

                    async.series([
                        function (callB) {
                            PurchaseDetail.findOne({_id:mongoose.Types.ObjectId(json.deliverId)}, function (err, detOneFound) {
                                if (err) {
                                    callB(err);
                                    res.error(ERROR_CODE.FIND_FAILED);
                                    return;
                                }
                                if (detOneFound) {
                                    var deliver = {};
                                    deliver[moment(json.deliverDate).format('YYYY-MM-DD')] = delQuantity;
                                    for (var key in detOneFound.deliver) {
                                        deliver[key] = detOneFound.deliver[key];
                                    }
                                    detOneFound.deliver = deliver;
                                    detOneFound.deliver_total += delQuantity;
                                    if (detOneFound.purchase_quantity >= detOneFound.deliver_total) {
                                        detOneFound.save(function (err) {
                                            if (err) {
                                                callB(err);
                                                res.error(ERROR_CODE.UPDATE_FAILED);
                                                return;
                                            }
                                            callB(null);
                                        })
                                    }else {
                                        res.error(ERROR_CODE.OVER_NUMBER);
                                        callB(null);
                                    }
                                }else {
                                    res.error(ERROR_CODE.NOT_EXISTS);
                                    callB(null);
                                }
                            })
                        }
                    ],
                    function (err) {
                        if (err) {
                            cb(err);
                            return;
                        }
                        cb(null);
                    })
                };

                async.eachSeries(req.body.delivers, iterator, function (err) {
                    if (err != null) {
                        debug(err);
                        return;
                    }
                    purOneFound.save(function (err) {
                        if (err) {
                            debug(err);
                            res.error(ERROR_CODE.UPDATE_FAILED);
                            return;
                        }
                        res.success();
                    })
                });

            }else {
                res.error(ERROR_CODE.NOT_EXISTS);
            }
        })
    },

    addRemark: function (req, res, next) {
        if (req.body.remark) {
            var findRequire = {};
            findRequire.order_number = req.body.orderNumber;
            Purchase.findOne(findRequire, function(err, PurOneFound) {
                if(err) {
                    debug(err);
                    res.error(ERROR_CODE.FIND_FAILED);
                    return;
                }
                if (PurOneFound) {
                    PurOneFound.remarks.push(moment().format('YYYY-MM-DD HH:mm:ss') + "：\n" + req.body.remark);
                    PurOneFound.save(function (err) {
                        if(err) {
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
        }else {
            res.error(ERROR_CODE.MISSING_ARGUMENT);
        }
    },

    purTotal: function (req, res, next) {
        var findRequire = {};
        var key = {};
        var ID2detail = {};
        var purTotal = {};

        //if (req.query.storeSku) findRequire. = req.query.storeSkustoreSku;
        //if (req.query.nameCN) findRequire = req.query.nameCN
        //if (req.query.) findRequire =
        //if (req.query.) findRequire =
        async.series([
                function (callB) {
                    PurchaseDetail.find({}, function (err, DTLListFound) {
                        if (dealErr.findErr(err)) return;

                        if (DTLListFound) {
                            DTLListFound.forEach (function (DTLFound) {
                                ID2detail[DTLFound._id] = DTLFound;
                            })
                        }
                    })
                },

                function (callB) {
                    Purchase.find(findRequire)
                        .populate("supplier")
                        .sort({order_number: 1})
                        .exec(function (err, purListFound) {
                            if (dealErr.findErr(err)) return;

                            if (purListFound.length > 0) {
                                purListFound.forEach(function (purFound) {
                                    if (purFound.purDetails) {
                                        purFound.purDetails.forEach(function (purDetailID) {
                                            var detail = ID2detail[purDetailID];
                                            key = purFound.buyer + purFound.supplier.name + detail.store_sku;
                                            purTotal[key] = purTotal[key] || {
                                                    orderProduct: 0,
                                                    orderTransit: 0
                                                };
                                            if (purFound.order_status <= 40) {
                                                purTotal[key].orderProduct += detail.deliver_total;                                                             // 订单库存（生产中）
                                            }else {
                                                purTotal[key].orderTransit += detail.deliver_total;                                                             // 订单库存（到仓库途中）
                                            }
                                        })
                                    }
                                })
                            }
                        })
                }
            ],
            function (err) {
                if (err) {
                    cb(err);
                    return;
                }
                cb(null);
            });




    }
};