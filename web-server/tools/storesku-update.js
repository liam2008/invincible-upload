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

var baseInfo = fs.readFileSync("./skuChange.txt");
if (baseInfo == null) {
    console.log("./skuChange.txt not exist!!!");
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

    var oldSku = json['库存SKU(旧)'];
    var newSku = json['SKU编码（新）'];

    var time = moment().format('YYYY-MM-DD HH:mm:ss');

    if (oldSku == null || oldSku == "" || newSku == null || newSku == "") {
        cb(null);
        return;
    }

    debug("running produce %s -> %s", oldSku, newSku);

    //正常数据 往下走
    async.series([
            function (callB) {
                debug("dealing Merchandise...");
                Merchandise.find({
                    store_sku: oldSku
                }, function (err, findMerResults) {
                    if (err) {
                        callB(err);
                        return;
                    }

                    findMerResults.forEach(function(row) {
                        row.store_sku = newSku;
                        row.updatedAt = time;

                        debug(row.toJSON());
                        row.save();
                    });

                    callB(null);
                });
            },
            // 检查产品表有没有相关信息 store_sku
            function (callB) {
                debug("dealing Product...");
                Product.find({
                    store_sku: oldSku
                }, function (err, findProResults) {
                    if (err) {
                        callB(err);
                        return;
                    }

                    findProResults.forEach(function(row) {
                        row.store_sku = newSku;
                        row.old_store_sku = oldSku;
                        row.updatedAt = time;

                        debug(row.toJSON());
                        row.save();
                    });

                    callB(null);
                });
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
});