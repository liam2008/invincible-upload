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

var baseInfo = fs.readFileSync("./baseImport.txt");
if (baseInfo == null) {
    console.log("./baseImport.txt not exist!!!");
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

    var asin = json['ASIN'];
    asin = asin.replace(/ /g, "");
    var seller_sku = json['卖家SKU'];
    seller_sku = seller_sku.replace(/ /g, "");
    var fnsku = json['FNSKU'] || "";
    fnsku = fnsku.replace(/ /g, "");
    var FBA = fnsku ? 1 : 0;
    var store_sku = json['仓库SKU'];
    store_sku = store_sku.replace(/ /g, "");
    var combination = [];
    var name_cn = json['中文名'];
    var name = json['英文名'];
    var shop_name = json['所属店铺'];
    shop_name = shop_name.replace(/ /g, "");
    shop_name = shop_name.toUpperCase();
    var team_name = json['所属小组'];
    team_name = team_name.replace(/ /g, "");
    var state = json['商品销售状态'] || 0;
    var projected_sales = json['预计日销量'] || 0;

    var time = moment().format('YYYY-MM-DD HH:mm:ss');

    if (asin == null) {
        cb(null);
        return;
    }

    var merchandiseNew = true;
    var productNeedSave = true;

    //正常数据 往下走
    async.series([
            // 检查商品表有没有相关信息 asin 和 seller_sku
            function (callB) {
                Merchandise.findOne({
                    asin: asin,
                    seller_sku: seller_sku
                }, function (err, findMerResult) {
                    if (err) {
                        callB(err);
                        return;
                    }

                    if (findMerResult != null) {
                        merchandiseNew = false;
                        findMerResult.seller_sku        = seller_sku; // 卖家SKU
                        findMerResult.store_sku         = store_sku; // 仓库SKU
                        findMerResult.FBA               = FBA; // 是否FBA 1是 0否
                        findMerResult.fnsku             = fnsku; // FNSKU
                        findMerResult.asin              = asin; // ASIN
                        findMerResult.name              = name; // 当地语言名字 =英文\日文等
                        findMerResult.shop_name         = shop_name; // 店铺名
                        findMerResult.team_name         = team_name; // 小组名
                        findMerResult.state             = state; // 在售状态
                        findMerResult.projected_sales   = projected_sales;   //预计日销量
                        findMerResult.updatedAt         = time; // 修改时间

                        findMerResult.save(function (err) {
                            if (err) {
                                callB(err);
                                return;
                            }

                            callB(null);
                        });
                    }
                    else {
                        callB(null);
                    }
                });
            },
            // 如果需要保存商品表信息 merchandiseNew == true 则保存一下
            function (callB) {
                if (merchandiseNew) {
                    var newMer = new Merchandise({
                        id:             UUID.v4(), // id 使用UUID
                        seller_sku:     seller_sku, // 卖家SKU
                        store_sku:      store_sku, // 仓库SKU
                        FBA:            FBA, // 是否FBA 1是 0否
                        fnsku:          fnsku, // FNSKU
                        asin:           asin, // ASIN
                        name:           name, // 当地语言名字:英文\日文等
                        shop_name:      shop_name, // 店铺名
                        team_name:      team_name, // 小组名
                        state:          state, // 在售状态
                        projected_sales: projected_sales,   //预计日销量
                        createdAt:      time, // 创建时间
                        updatedAt:      time // 修改时间
                    });

                    newMer.save(function (err) {
                        if (err) {
                            callB(err);
                            return;
                        }

                        callB(null);
                    });
                }
                else {
                    callB(null);
                }
            },
            // 检查产品表有没有相关信息 store_sku
            function (callB) {
                Product.find({
                    store_sku: store_sku
                }, function (err, findProResult) {
                    if (err) {
                        callB(err);
                        return;
                    }

                    if (findProResult.length > 0) {
                        productNeedSave = false;
                    }

                    callB(null);
                });
            },
            // 如果需要保存产品表信息 productNeedSave == true 则保存一下
            function (callB) {
                if (productNeedSave) {
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

                    newPro.save(function (err) {
                        if (err) {
                            callB(err);
                            return;
                        }

                        callB(null);
                    });
                } else {
                    callB(null);
                }
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