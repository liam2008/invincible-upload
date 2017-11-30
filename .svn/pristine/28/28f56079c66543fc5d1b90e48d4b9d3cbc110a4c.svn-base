process.env.NODE_ENV = "debug";

var async = require('async');
var moment = require('moment');
var DB = require('../models/invincible');
var Product = DB.getModel('product');
var User = DB.getModel('user');
var Shops = DB.getModel('shops');
var Merchandise = DB.getModel('merchandise');
var UUID = require('uuid');
var debug = require('debug')('smartdo:route:base');
var fs = require('fs');
var Shared = require('../../shared');

var merchandiseArr = [];
var name2teamId = {};

async.series([
        // 从用户表查询出组长信息
        function (callB) {
            User.find({})
                .populate('role')
                .populate('team')
                .exec(function(err, findResults) {
                    if (err) {
                        callB(err);
                        return;
                    }

                    findResults.forEach(function(row) {
                        if (row.role == null) {
                            return;
                        }

                        if (row.role.type != 'leader') {
                            return;
                        }

                        if (row.team == null) {
                            return;
                        }

                        name2teamId[row.name] = row.team._id;
                    });

                    callB(null);
                });
        },
        // 商品表查出所有商品信息 并且添加小组id
        function (callB) {
            Merchandise.find({}, function (err, findMerResults) {
                if (err) {
                    callB(err);
                    return;
                }

                findMerResults.forEach(function(row) {
                    merchandiseArr.push(row);

                    row.team_id = name2teamId[row.team_name] || null;
                });

                callB(null);
            });
        },
        // 获取所有店铺信息 用于匹配到商品表中
        function (callB) {
            Shops.find({}, function(err, findResults) {
                if (err) {
                    callB(err);
                    return;
                }

                var shopName2id = {};
                findResults.forEach(function(row) {
                    shopName2id[row.name] = row._id;
                });

                merchandiseArr.forEach(function(row) {
                    row.shop_id = shopName2id[row.shop_name] || null;
                });

                callB(null);
            });
        },
        // 获取所有产品id 用于匹配到商品表中
        function (callB) {
            Product.find({}, function(err, findResults) {
                if (err) {
                    callB(err);
                    return;
                }

                var store2id = {};
                findResults.forEach(function(row) {
                    store2id[row.store_sku] = row._id;
                });

                merchandiseArr.forEach(function(row) {
                    row.product_id = store2id[row.store_sku] || null;
                });

                callB(null);
            });
        }
    ],
    function (err, result) {
        if (err) {
            console.log(err);
            return;
        }

        var iterator = function (json, cb) {
            if (json == null) {
                cb(null);
                return;
            }

            json.save(function(err) {
                if (err) {
                    cb(err);
                    return;
                }

                cb(null);
            });
        };

        async.eachSeries(merchandiseArr, iterator, function (err) {
            if (err != null) {
                console.log(new Error(err));
                return;
            }

            console.log("all done");
            //process.exit(0);
        });
    }
);