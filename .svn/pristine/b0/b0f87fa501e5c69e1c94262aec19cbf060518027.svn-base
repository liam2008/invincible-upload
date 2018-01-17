var debug = require('debug')('smartdo:controller:profit');
var ServerError = require('../errors/server-error');
var async = require('async');
var InvincibleDB = require('../models/invincible');
var Merchandise = InvincibleDB.getModel('merchandise');
var Shops = InvincibleDB.getModel('shops');
var Team = InvincibleDB.getModel('team');
var Product = InvincibleDB.getModel('product');

var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;
var Utils = Shared.Utils;
var dealErr = require('../errors/controller-error');

var MysqlCrawler = require('../databases/mysql_crawler');

module.exports = {
    name: "profit",

    profitShow: function (req, res, next) {
        var subFilter = req.subfilterSkuProfit || {};
        var teamName;
        if (subFilter.view == "*") {
            teamName = null;
        }
        else if (subFilter.view != null) {
            teamName = subFilter.view;
        }
        else {
            res.success();
            return;
        }

        var results = {};
        async.series([
                function (callB) {
                    var sql = "SELECT group_name, store_name, sku, sales_quantify, sales_volume, refund_quantify, refund_volume, actual_sales_volume, selling_fees, selling_fees_rate, " +
                        "ful_cost, ful_cost_rate, merge_inventory_fees,merge_inventory_fees_rate, fba_inventory_fees, ad_fee, ad_fee_rate, promotion_fees, promotion_fees_rate,product_unit_price, " +
                        "product_cost, product_cost_rate, first_ship_unit_price, first_ship_fees, first_ship_fees_rate, last_ship_fees, last_ship_fees_rate,withdrawal_service_fee, withdrawal_service_fee_rate," +
                        " rejects_quantify, rejects_cost, rejects_cost_rate, other_cost, gross_profit, gross_profit_rate,data_load_date FROM gpr_sku_cost_rate AS gpr_sku_cost_rate WHERE 1=1";
                    if (teamName) {
                        sql += (" AND group_name = '" + teamName + "'");
                    }else if (req.query.group_name) {
                        if (req.query.group_name == "other") {
                            sql += (" AND IsNull(group_name)");
                        }else {
                            sql += (" AND group_name = '" + req.query.group_name + "'");
                        }
                    }
                    if (req.query.store_name) sql += (" AND store_name = '" + req.query.store_name + "'");
                    if (req.query.sku) sql += (" AND sku = '" + req.query.sku + "'");
                    if (req.query.startDate) sql += (" AND yyyymmdd >= '" + req.query.startDate + "'");
                    if (req.query.endDate) sql += (" AND yyyymmdd <= '" + req.query.endDate + "'");
                    MysqlCrawler.query(sql, null, function(err, mysqlResult) {
                        if (dealErr.findErr(err, res)) return callB(err);
                        var list = {};
                        var total = {};
                        for (var i = 0; i < mysqlResult.length; i++) {
                            if (i == 0) {
                                for (var key in mysqlResult[0]) {
                                    if (key == "group_name") total[key] = "合计";
                                    else if (key.indexOf("_rate") != -1) total[key] = 0;
                                    else if (key == "store_name" || key == "sku" || key == "product_unit_price" || key == "first_ship_unit_price" || key == "data_load_date") continue;
                                    else total[key] = 0;
                                }
                            }
                            var result = mysqlResult[i];
                            var key = result.group_name + result.store_name + result.sku;
                            if (!list[key]) {
                                list[key] = {};
                                list[key].group_name = result.group_name;
                                list[key].store_name = result.store_name;
                                list[key].sku = result.sku;
                            }

                            for (var resultKey in result) {
                                if (resultKey == "group_name" || resultKey == "store_name" || resultKey == "sku" || resultKey == "data_load_date") {
                                    continue;
                                } else if (resultKey == "product_unit_price" || resultKey == "first_ship_unit_price") {
                                    list[key][resultKey] = result[resultKey];
                                } else if (resultKey.indexOf("_rate") == -1) {
                                    total[resultKey] += result[resultKey];
                                    list[key][resultKey] = list[key][resultKey] || 0;
                                    list[key][resultKey] += result[resultKey];
                                } else {
                                    list[key][resultKey] = 0;
                                }
                            }
                        }

                        for (var listKey in list) {
                            for (var keyInListKey in list[listKey]) {
                                if (keyInListKey.indexOf("_rate") != -1) {
                                    if (list[listKey].actual_sales_volume != 0) list[listKey][keyInListKey] = (list[listKey][keyInListKey.substring(0, keyInListKey.indexOf("_rate"))] / list[listKey].actual_sales_volume * 100);
                                    else list[listKey][keyInListKey] = 0;
                                }
                            }
                            for (var key2 in list[listKey]) {
                                if (key2 != "group_name" && key2 != "store_name" && key2 != "sku") {
                                    if (list[listKey][key2] == "Infinity" || isNaN(list[listKey][key2]) || list[listKey][key2] == "-Infinity") list[listKey][key2] = 0;
                                    list[listKey][key2] = list[listKey][key2].toFixed(2);
                                    if (key2.indexOf("_rate") != -1) list[listKey][key2] += "%";
                                }
                            }
                        }
                        results.list = list;

                        for (var key in total) {
                            if (key.indexOf("_rate") != -1) {
                                total[key] = (total[key.substring(0, key.indexOf("_rate"))] / total.actual_sales_volume * 100);
                                if (total[key] == "Infinity" || isNaN(total[key]) || total[key] == "-Infinity") total[key] = 0;
                                total[key] = total[key].toFixed(2);
                                total[key] += "%";
                            } else if (key != "group_name" && key != "store_name" && key != "sku") {
                                total[key] = total[key].toFixed(2);
                            }
                        }
                        total.product_unit_price = "#";
                        total.first_ship_unit_price = "#";
                        if (subFilter.total) {
                            results.total = total;
                            results.hasTotal = true;
                        }else {
                            results.hasTotal = false;
                        }
                        callB(null);
                    })
                },

                function (callB) {
                    if (!teamName) {
                        var where = "";
                        if (req.query.startDate) where += (" AND yyyymmdd >= '" + req.query.startDate + "'");
                        if (req.query.endDate) where += (" AND yyyymmdd <= '" + req.query.endDate + "'");
                        var sql2 = "SELECT DISTINCT group_name FROM gpr_sku_cost_rate WHERE 1=1 ";
                        sql2 += where;
                        MysqlCrawler.query(sql2, null, function (err, nameResult) {
                            if (dealErr.findErr(err, res)) return debug(new Error(err));
                            results.teamName = nameResult;
                            var sql3 = "SELECT DISTINCT store_name FROM gpr_sku_cost_rate WHERE 1=1 ";
                            sql3 += where;
                            MysqlCrawler.query(sql3, null, function (err, storeResult) {
                                if (dealErr.findErr(err, res)) return debug(new Error(err));
                                results.storeName = storeResult;
                                callB(null);
                            })
                        })
                    }else {
                        results.storeName = [teamName];
                        callB(null);
                    }
                },

                function (callB) {
                    results = Utils.pakoZip(JSON.stringify(results));
                    res.success(results);
                    callB(null);
                }
            ],
            function (err) {
                if (err) {
                    debug(new Error(err));
                    return;
                }
            }
        )
    },

    teamProfitShow: function (req, res, next) {
        var subFilter = req.subfilterTeamProfit || {};
        var teamName;
        if (subFilter.view == "*") {
            teamName = null;
        }
        else if (subFilter.view != null) {
            teamName = subFilter.view;
        }
        else {
            res.success();
            return;
        }

        var results = {};
        var teamName;
        async.series([
                function (callB) {
                    var sql = "SELECT group_name, SUM(actual_sales_volume) AS actual_sales_volume, SUM(gross_profit) AS gross_profit " +
                        " FROM gpr_sku_cost_rate AS gpr_sku_cost_rate WHERE 1=1";
                    if (req.query.startDate) sql += (" AND yyyymmdd >= '" + req.query.startDate + "'");
                    if (req.query.endDate) sql += (" AND yyyymmdd <= '" + req.query.endDate + "'");
                    sql += " GROUP BY group_name";
                    var total = {
                        group_name: "合计",
                        actual_sales_volume: 0,
                        gross_profit: 0,
                        gross_profit_rate: 0
                    };
                    MysqlCrawler.query(sql, null, function (err, groupResult) {
                        if (dealErr.findErr(err, res)) return debug(new Error(err));
                        var list = [];
                        if (groupResult) {
                            groupResult.forEach(function (group) {
                                var grossProfitRate = "";
                                if (group.actual_sales_volume == 0) {
                                    grossProfitRate = "0%";
                                }else {
                                    grossProfitRate = (group.gross_profit / group.actual_sales_volume * 100).toFixed(2) + "%";
                                }
                                var result;
                                if (teamName) {
                                    if (!group.group_name) group.group_name = "";
                                    if (teamName.toString() == group.group_name.toString()) {
                                        result = {
                                            group_name: group.group_name,
                                            actual_sales_volume: group.actual_sales_volume.toFixed(2),
                                            gross_profit: group.gross_profit.toFixed(2),
                                            gross_profit_rate: grossProfitRate
                                        };
                                    }
                                }else {
                                    result = {
                                        group_name: group.group_name,
                                        actual_sales_volume: group.actual_sales_volume.toFixed(2),
                                        gross_profit: group.gross_profit.toFixed(2),
                                        gross_profit_rate: grossProfitRate
                                    };
                                }
                                total.actual_sales_volume += group.actual_sales_volume;
                                total.gross_profit += group.gross_profit;
                                if (result) list.push(result);
                            });
                            total.gross_profit_rate = (total.gross_profit / total.actual_sales_volume * 100).toFixed(2) + "%";
                            total.gross_profit = total.gross_profit.toFixed(2);
                            total.actual_sales_volume = total.actual_sales_volume.toFixed(2);
                            results.list = list;
                            if (subFilter.total) {
                                results.total = total;
                                results.hasTotal = true;
                            }else {
                                results.hasTotal = false;
                            }
                        }
                        callB(null);
                    });
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

    profitDetail: function (req, res, next) {
        var result = {};
        var require = {};
        async.series([
                // 根据店铺名找出店铺id
                function (callB) {
                    var findRequire = {};
                    findRequire.name = req.query.shopName;
                    Shops.findOne(findRequire, function (err, shopOneFound) {
                        if (dealErr.findErr(err, res)) return callB(err);
                        if (shopOneFound) {
                            require.shop_id = shopOneFound._id;
                            callB(null);
                        }else {
                            res.error(ERROR_CODE.NOT_EXISTS);
                            callB(ERROR_CODE.NOT_EXISTS);
                            return;
                        }
                    })
                },

                // 找出对应asin数据
                function (callB) {
                    require.seller_sku = req.query.sellerSku;
                    Merchandise.findOne(require)
                        .populate("product_id")
                        .exec(function (err, merdOneFound) {
                        if (dealErr.findErr(err, res)) return callB(err);
                        if (merdOneFound) {
                            result.asin = merdOneFound.asin;

                            if (merdOneFound.product_id) {
                                result.nameCN = merdOneFound.product_id.name_cn;
                                result.storeSku = merdOneFound.product_id.store_sku;
                            }else {
                                result.storeSku = merdOneFound.store_sku || "";
                            }
                        }
                        callB(null);
                    })
                }
            ],
            function (err) {
                if (err) {
                    debug(err);
                    return;
                }
                res.success(result);
            }
        );
    }
};