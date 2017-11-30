process.env.NODE_ENV = "debug";

var async = require('async');
var moment = require('moment');
var DB = require('../models/invincible');
var Product = DB.getModel('product');
var Merchandise = DB.getModel('merchandise');
var UUID = require('uuid');
var debug = require('debug')('smartdo:route:base');
var fs = require('fs');
var Shared = require('../../shared');
var GenTSVTable = Shared.Utils.genTSVTable;

var baseInfo = fs.readFileSync("./productInfo.txt");
if (baseInfo == null) {
    console.log("./productInfo.txt not exist!!!");
    process.exit(1);
    return;
}
baseInfo = baseInfo.toString();

var arr = GenTSVTable(baseInfo);

var iterator = function (json, cb) {
    if (json == null) {
        cb(null);
        return;
    }

    var store_sku = json['库存SKU'];
    store_sku = store_sku.replace(/ /g, "");
    var combination = [];
    var name_cn = json['库存SKU中文名称'];

    var time = moment().format('YYYY-MM-DD HH:mm:ss');

    if (store_sku == null) {
        cb(null);
        return;
    }

    var state = -1;              // -1: 不需修改, 0: 不存在, 1: 存在需修改

    //正常数据 往下走
    async.series([
            // 检查产品表有没有相关信息 store_sku
            function (callB) {
                Product.findOne({
                    store_sku: store_sku
                }, function (err, findProResult) {
                    if (err) {
                        callB(err);
                        return;
                    }

                    // 存在
                    if (findProResult != null) {
                        // 要修改
                        if (name_cn != findProResult.name_cn) {
                            state = 1;
                            findProResult.name_cn = name_cn;

                            console.log("change: " + store_sku);
                            console.log(findProResult);
                            //callB(null);
                            findProResult.save(function(e, d) {
                                if (e) {
                                    callB(e);
                                    return;
                                }
                                callB(null);
                            });
                            return;
                        }
                        // 不修改
                        state = -1;
                        console.log("no need change: " + store_sku);
                        callB(null);
                        return;
                    }
                    // 不存在
                    state = 0;
                    callB(null);
                });
            },
            // 按照 state 进行修改或添加
            function (callB) {
                // 新增
                if (state == 0) {
                    var newPro = new Product({
                        id: UUID.v4(), // id 使用UUID
                        store_sku: store_sku, // 仓库SKU
                        combination: combination, // 商品组合信息 {store_sku: xxx, count: nnn}
                        name_cn: name_cn, // 中文名
                        origin: "", // 原产地
                        material: "", // 材质
                        usefor: "", // 用途
                        declare_value: 0, // 申报价值
                        hs_code: "", // 海关编码
                        weight: 0, // 重量
                        size: {}, // 体积信息
                        createdAt: time, // 创建时间
                        updatedAt: time // 修改时间
                    });

                    console.log("new: " + store_sku);
                    console.log(newPro);
                    //callB(null);
                    newPro.save(function (err) {
                        if (err) {
                            callB(err);
                            return;
                        }

                        callB(null);
                    });
                    return;
                }

                callB(null);
            }
        ],
        function (err, result) {
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
        console.log(new Error(err));
        return;
    }

    console.log("all done");
    process.exit(0);
});