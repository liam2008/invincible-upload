var debug = require('debug')('smartdo:controller:purchase');
var ServerError = require('../errors/server-error');
var async = require('async');
var moment = require('moment');
var InvincibleDB = require('../models/invincible');
var Purchase = InvincibleDB.getModel('purchase');
var PurchaseDetail = InvincibleDB.getModel('purchaseDetail');
var Product = InvincibleDB.getModel('product');
var Merchandise = InvincibleDB.getModel('merchandise');
var Supplier = InvincibleDB.getModel('supplier');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = require('objectid');

var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;
var Utils = Shared.Utils;

module.exports = {
    name: "purchase",

    purchaseList: function (req, res, next) {
        var supIdRequire = [];
        //var supplierID2Name = {};
        var detIDRequire = [];
        var purchases = [];

        async.series([
                // 找出对应供应商
                function (callB) {
                    if (req.query.supplierName) {
                        var regSupplier = new RegExp(req.query.supplierName);
                        Supplier.find({name: regSupplier}, function (err, supListFound) {
                            if(err) {
                                callB(err);
                                res.error(ERROR_CODE.FIND_FAILED);
                                return;
                            }
                            if (supListFound.length > 0) {
                                supListFound.forEach (function (supFound) {
                                    supIdRequire.push(supFound._id);
                                    //supplierID2Name[supFound._id] = supFound.name;
                                })
                            }
                            callB(null);
                        })
                    }else {
                        callB(null);
                    }
                },
                // 找出对应商品中文名
                function (callB) {
                    if (req.query.proNameCn) {
                        var regProNameCn = new RegExp(req.query.proNameCn);
                        Product.find({name_cn: regProNameCn}, function (err, proListFound) {
                            if(err) {
                                callB(err);
                                res.error(ERROR_CODE.FIND_FAILED);
                                return;
                            }
                            if (proListFound.length > 0) {
                                var storeSkuReq = [];
                                proListFound.forEach (function (productFound) {
                                    storeSkuReq.push(productFound.store_sku)
                                });
                                if (storeSkuReq.length > 0) {
                                    PurchaseDetail.find({store_sku: {$in: storeSkuReq}}, function (err, detListFound) {
                                        if(err) {
                                            callB(err);
                                            res.error(ERROR_CODE.FIND_FAILED);
                                            return;
                                        }
                                        if (detListFound) {
                                            detListFound.forEach (function (detFound) {
                                                detIDRequire.push(detFound._id);
                                            });
                                        }
                                    })
                                }
                            }
                            callB(null);
                        })
                    }else {
                        callB(null);
                    }
                },
                //
                function (callB) {
                    var findRequire = {};
                    if (req.query.orderNumber) findRequire.order_number = req.query.orderNumber;
                    if (req.query.contractNumber) findRequire.contract_number = req.query.contractNumber;
                    if (supIdRequire.length > 0) findRequire.supplier = {$in: supIdRequire};
                    if (req.query.contractNumber) findRequire.contract_number = req.query.contractNumber;
                    if (detIDRequire.length > 0) findRequire.purDetails = {$in: detIDRequire};
                    if (req.query.orderStatus) findRequire.contract_number = req.query.orderStatus;

                    Purchase.find(findRequire).populate("supplier").sort({order_number: 1}).exec(function (err, purListFound) {
                        if(err) {
                            callB(err);
                            res.error(ERROR_CODE.FIND_FAILED);
                            return;
                        }
                        if (purListFound) {
                            purListFound.forEach (function (purchaseFound) {
                                var supplierName = '';
                                if (purchaseFound.supplier) supplierName = purchaseFound.supplier.name;
                                var purResult = {
                                    "orderNumber": purchaseFound.order_number,
                                    "contractNumber": purchaseFound.contract_number,
                                    "supplierName": supplierName,
                                    "purTotalPrice": purchaseFound.purchase_total_price,
                                    "orderStatus": purchaseFound.order_status  || '',
                                    "remark": purchaseFound.remark  || ''
                                };
                                purchases.push(purResult);
                            })
                        }
                        callB(null)
                    })
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
        Purchase.findOne(findRequire, function (err, purOne) {
            if(err) {
                debug(err);
                res.error(ERROR_CODE.FIND_FAILED);
                return;
            }
            if (!purOne) {
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

                    //
                    async.series([
                            //
                            function (callB) {
                                var _id = new ObjectId();
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
                        _id: new ObjectId(),
                        order_number: req.body.orderNumber,                                               // 订单号
                        contract_number: req.body.contractNumber,                                            // 合同号
                        order_time: orderTime,                                                   // 下单时间
                        supplier: mongoose.Types.ObjectId(req.body.supplierId),                                            // 供应商
                        buyer: req.body.buyer || "",                                                      // 采购员
                        purDetails: skuIds,                                                  // 库存SKU的ID
                        order_status: orderStatus,                                               // 订单基本状态
                        purchase_total_price: purTotalPrice,                                               // 订单总金额
                        pickup_way: req.body.pickupWay || "",                                                 // 提货方式
                        remark: req.body.remark || "",                                                      // 详细备注
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
                res.success(false);
            }
        })
    },

    productList: function (req, res, next) {
        var findRequire= {};
        //if (req.query.storeSku) findRequire.store_sku = req.query.storeSku;
        //if (req.query.nameCN) {
        //    var proName = req.query.proName.trim();
        //    proName = new RegExp(proName);
        //    findRequire.name_cn = proName;
        //}
        Product.find(findRequire).sort({store_sku: 1}).exec(function (err, proListFound) {
            if(err) {
                debug(err);
                res.error(ERROR_CODE.FIND_FAILED);
                return;
            }
            findRequire = {};
            //findRequire.name = proName;
            Merchandise.find(findRequire, function (err, merListFound) {
                if(err) {
                    debug(err);
                    res.error(ERROR_CODE.FIND_FAILED);
                    return;
                }
                var results = [];
                var storeSku2NameEn = {};
                if (merListFound.length > 0) {
                    merListFound.forEach (function (merFound) {
                        storeSku2NameEn[merFound.store_sku] = merFound.name;
                    })
                }
                if (proListFound.length > 0) {
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
        Purchase.findOne(findRequire, function (err, purOneFound) {
            if(err) {
                debug(err);
                res.error(ERROR_CODE.FIND_FAILED);
                return;
            }
            if (purOneFound) {
                var supplierId = "";
                if (purOneFound.supplier) supplierId = purOneFound.supplier.id;
                var purResult = {
                    "purchaseId": purOneFound._id,
                    "orderNumber": purOneFound.order_number,
                    "contractNumber": purOneFound.contract_number,
                    "supplierId": supplierId,
                    "orderTime": purOneFound.order_time || "",
                    "buyer": purOneFound.buyer || "",
                    "orderStatus": purOneFound.order_status || "",
                    "pickupWay": purOneFound.pickup_way || "",
                    "remarks": purOneFound.remark || "",
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
                            PurchaseDetail.find(findRequire).sort({store_sku: 1}).exec(function (err, detListFound) {
                                if(err) {
                                    callB(err);
                                    res.error(ERROR_CODE.FIND_FAILED);
                                    return;
                                }
                                if (detListFound.length > 0) {
                                    findRequire = {};
                                    findRequire.store_sku = {$in: []};
                                    detListFound.forEach (function (detailFound) {
                                        var detResult = {
                                            "storeSkuId": detailFound._id,
                                            "storeSku": detailFound.store_sku,
                                            "unitPrice":detailFound.unit_price,
                                            "purQuantity":detailFound.purchase_quantity,
                                            "totalPrice":detailFound.total_price,
                                            "conCovDate":detailFound.contract_covenant_date,
                                            "delQuantity":detailFound.deliver,
                                            "deliverDate":detailFound.deliver_total,
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
                            if (findRequire.store_sku.$in.length > 0) {
                                Product.find(findRequire, function (err, proListFound) {
                                    if(err) {
                                        callB(err);
                                        res.error(ERROR_CODE.FIND_FAILED);
                                        return;
                                    }
                                    if (proListFound.length > 0) {
                                        proListFound.forEach (function (productFound) {
                                            storeSku2nameCN[productFound.store_sku] = productFound.name_cn;
                                        })
                                    }
                                    callB(null);
                                })
                            }
                        },

                        // 找出storeSku中文名
                        function (callB) {
                            if (findRequire.store_sku.$in.length > 0) {
                                Merchandise.find(findRequire, function (err, merListFound) {
                                    if(err) {
                                        callB(err);
                                        res.error(ERROR_CODE.FIND_FAILED);
                                        return;
                                    }
                                    if (merListFound.length > 0) {
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
                                    detailResult.proNameCN = storeSku2nameCN[detailResult.store_sku];
                                    detailResult.proNameEN = storeSku2nameEN[detailResult.store_sku];
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
        Purchase.findOne(findRequire, function (err, purOneFound) {
            if (err) {
                debug(err);
                res.error(ERROR_CODE.FIND_FAILED);
                return;
            }
            if (purOneFound) {
                var orderStatus = 0;
                if (req.body.orderStatus) orderStatus = Utils.toNumber(req.body.orderStatus);

                purOneFound.buyer = req.body.buyer || "";
                purOneFound.order_status = orderStatus;
                purOneFound.pickup_way = req.body.pickupWay || "";
                purOneFound.remark = req.body.remark || "";

                var editDelIDs = [];
                if (req.body.purDetails) {
                    req.body.purDetails.forEach (function (purDetail) {
                        editDelIDs.push(mongoose.Types.ObjectId(purDetail.storeSkuId));
                    })
                }

                var bothIDs = [];
                // 订单状态为待处理
                if (req.body.order_status == 0) {
                    purOneFound.order_number = req.body.orderNumber;
                    purOneFound.contract_number = req.body.contractNumber;
                    purOneFound.supplier = req.body.supplierId;
                    purOneFound.order_time = req.body.orderTime;

                    if (purOneFound.purDetails) {
                        var deleteIterator = function (storeSkuId, cb) {
                            // 执行循环
                            async.series([
                                    // 删除已经不存在的订单详情
                                    function (callB) {
                                        if (editDelIDs.indexOf (storeSkuId) == -1) {
                                            PurchaseDetail.remove({_id: storeSkuId}, function (err) {
                                                if (err) {
                                                    callB(err);
                                                    res.error(ERROR_CODE.DELETE_FAILED);
                                                    return;
                                                }
                                            })
                                        }else {
                                            bothIDs.push(json.storeSkuId);
                                        }
                                    }
                                ],
                                function (err) {
                                    if (err) {
                                        cb(err);
                                        return;
                                    }
                                }
                            );
                        };

                        async.eachSeries(purOneFound.purDetails, deleteIterator, function (err) {
                            if (err != null) {
                                debug(err);
                                return;
                            }
                        });
                    }
                }else {
                    bothIDs = editDelIDs;
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

                        // 执行循环
                        async.series([
                                // 添加或修改
                                function (callB) {
                                    // 添加
                                    if (bothIDs.indexOf(json.storeSkuId) == -1) {
                                        var _id = new ObjectId();
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
                                            detListFound.forEach (function (detFound) {
                                                if (detFound._id == json.storeSkuId) {
                                                    detFound.logistics_number = json.logNumber;
                                                    detFound.salesman = json.salesman;
                                                    if (req.body.order_status == 0) {
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
                                                        return false;
                                                    })
                                                }
                                            });
                                        }
                                    }
                                }
                            ],
                            function (err) {
                                if (err) {
                                    cb(err);
                                    return;
                                }
                                purOneFound.purDetails = editDelIDs;
                                purOneFound.save (function (err) {
                                    if (err) {
                                        debug(err);
                                        res.error(ERROR_CODE.UPDATE_FAILED);
                                        return;
                                    }
                                })
                            }
                        );
                    };

                    async.eachSeries(arr, iterator, function (err) {
                        if (err != null) {
                            debug(err);
                            return;
                        }
                    });
                })
            }
        })
    },

    detailList: function (req, res, next) {
        var findRequire = {};
        findRequire.order_number = req.query.orderNumber;
        Purchase.findOne(findRequire, function (err, purOneFound) {
            if(err) {
                debug(err);
                res.error(ERROR_CODE.FIND_FAILED);
                return;
            }

            var purchase = {
                "orderNumber":purOneFound.order_number,
                "contractNumber": purOneFound.contract_number,
                "orderTime": purOneFound.order_time,
                "supplierName": purOneFound.supplier.name,
                "buyer": purOneFound.buyer,
                "orderStatus": purOneFound.order_status,
                "purTotalPrice": purOneFound.purchase_total_price,
                "pickupWay": purOneFound.pickup_way,
                "remarks": purOneFound.remark
            };

            var purDetails = [];
            var storeSku2nameCN = {};
            var storeSku2nameEN = {};
            async.series([
                    // 找出
                    function (callB) {
                        findRequire = {};
                        findRequire._id = {$in: purOneFound.purDetails};
                        PurchaseDetail.find(findRequire).sort({store_sku: 1}).exec(function (err, detListFound) {
                            if (err) {
                                callB(err);
                                res.error(ERROR_CODE.FIND_FAILED);
                                return;
                            }

                            if (detListFound.length > 0) {
                                detListFound.forEach(function (detFound) {
                                    var deliverDate = moment("1970-01-01").format('YYYY-MM-DD');
                                    for (var date in detFound.deliver) {
                                        if (deliverDate < date) deliverDate = date
                                    }
                                    findRequire = {};
                                    findRequire.store_sku = {$in: []};
                                    var purDetail = {
                                        "storeSku": detFound.store_sku,
                                        "unitPrice": detFound.unit_price,
                                        "purQuantity": detFound.purchase_quantity,
                                        "totalPrice": detFound.total_price,
                                        "conCovDate": detFound.contract_covenant_date,
                                        "deliverTotal": detFound.deliver_total,
                                        "deliverDate": deliverDate,
                                        "salesman": detFound.salesman,
                                        "logNumber": detFound.logistics_number
                                    };
                                    purDetails.push(purDetail);
                                    findRequire.store_sku.$in.push(detFound.store_sku);
                                })
                            }
                        })
                    },
                    // 找出对应商品中文名
                    function (callB) {
                        if (findRequire.store_sku.$in.length > 0) {
                            Product.find(findRequire, function (err, proListFound) {
                                if(err) {
                                    callB(err);
                                    res.error(ERROR_CODE.FIND_FAILED);
                                    return;
                                }
                                if (proListFound.length > 0) {
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
                        if (findRequire.store_sku.$in.length > 0) {
                            Merchandise.find(findRequire, function (err, merListFound) {
                                if(err) {
                                    callB(err);
                                    res.error(ERROR_CODE.FIND_FAILED);
                                    return;
                                }
                                if (merListFound.length > 0) {
                                    merListFound.forEach (function (merchandiseFound) {
                                        storeSku2nameEN[merchandiseFound.store_sku] = merchandiseFound.name;
                                    })
                                }
                                callB(null);
                            })
                        }
                    },

                    function (callB) {
                        if (purDetails.length > 0) {
                            purDetails.forEach(function (purDetail) {
                                purDetail.proNameCN = storeSku2nameCN[purDetail.store_sku];
                                purDetail.proNameEN = storeSku2nameEN[purDetail.store_sku];
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
        findRequire.order_number = orderNumber;
        Purchase.findOne(findRequire, function (err, purOneFound) {
            if (err) {
                debug(err);
                res.error(ERROR_CODE.FIND_FAILED);
                return;
            }
            if (purOneFound) {
                var follow = {
                    orderStatus: purOneFound.order_status,
                    purDetails: []
                };

                findRequire = {};
                findRequire._id = {$in: purOneFound.purDetails};
                PurchaseDetail.find(findRequire).sort({store_sku: 1}).exec(function (err, detListFound) {
                    if (err) {
                        debug(err);
                        res.error(ERROR_CODE.FIND_FAILED);
                        return;
                    }

                    findRequire = {};
                    findRequire.store_sku = [];
                    var purDetails = {};
                    if (detListFound) {
                        detListFound.forEach (function (detFound) {
                            findRequire.store_sku.push(detFound.store_sku);
                            purDetails = {
                                "deliverId": detFound._id,
                                "storeSku": detFound.store_sku,
                                "purQuantity": detFound.purchase_quantity,
                                "deliverTotal": detFound.deliver_total
                            }
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
                            purDetail.proNameCN = storeSku2nameCN[purDetail.store_sku]
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
                purOneFound.order_status = req.body.orderStatus;

                var iterator = function (json, cb) {
                    var delQuantity = 0;
                    if (json.delQuantity) delQuantity = Utils.toNumber(json.delQuantity);

                    async.series([
                        function (callB) {
                            PurchaseDetail.findOne({_id:mongoose.Types.ObjectId(json.deliverId)}, function (err, detOneFound) {
                                if (err) {
                                    callB(err);
                                    res.error(ERROR_CODE.FIND_FAILED);
                                    return;
                                }
                                if (detOneFound) {
                                    detOneFound.deliver[req.body.deliverDate] = delQuantity;
                                    detOneFound.deliver_total += delQuantity;
                                    detOneFound.save(function (err) {
                                        if (err) {
                                            callB(err);
                                            res.error(ERROR_CODE.UPDATE_FAILED);
                                            return;
                                        }
                                        callB(null);
                                    })
                                }else {
                                    res.error(ERROR_CODE.NOT_EXISTS);
                                }
                            })
                        }
                    ],
                    function (err) {
                        if (err) {
                            cb(err);
                            return;
                        }
                    })
                };

                async.eachSeries(req.body.purDetails, iterator, function (err) {
                    if (err != null) {
                        debug(err);
                        return;
                    }
                });

            }else {
                res.error(ERROR_CODE.NOT_EXISTS);
            }
        })
    }
};