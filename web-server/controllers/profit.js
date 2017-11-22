var debug = require('debug')('smartdo:controller:profit');
var ServerError = require('../errors/server-error');

var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;

var MysqlCrawler = require('../databases/mysql_crawler');

module.exports = {
    name: "profit",

    profitShow: function (req, res, next) {
        var sql = "SELECT group_name, store_name, sku, sales_quantify, sales_volume, refund_quantify, refund_volume, actual_sales_volume, selling_fees, selling_fees_rate, " +
            "ful_cost, ful_cost_rate, merge_inventory_fees,merge_inventory_fees_rate, fba_inventory_fees, ad_fee, ad_fee_rate, promotion_fees, promotion_fees_rate,product_unit_price, " +
            "product_cost, product_cost_rate, first_ship_unit_price, first_ship_fees, first_ship_fees_rate, last_ship_fees, last_ship_fees_rate,withdrawal_service_fee, withdrawal_service_fee_rate," +
            " rejects_quantify, rejects_cost, rejects_cost_rate, other_cost, gross_profit, gross_profit_rate,data_load_date FROM gpr_sku_cost_rate AS gpr_sku_cost_rate WHERE 1=1";
        if (req.query.group_name) {
            if (req.query.group_name == "other") {
                sql += (" AND IsNull(group_name)")
            }else {
                sql += (" AND group_name = '" + req.query.group_name + "'")
            }
        }
        if (req.query.store_name) sql += (" AND store_name = '" + req.query.store_name + "'");
        if (req.query.sku) sql += (" AND sku = '" + req.query.sku + "'");
        if (req.query.startDate) sql += (" AND yyyymmdd >= '" + req.query.startDate + "'");
        if (req.query.endDate) sql += (" AND yyyymmdd <= '" + req.query.endDate + "'");
        MysqlCrawler.query(sql, null, function(err, mysqlResult) {
            if (err) {
                debug(err);
                res.error(ERROR_CODE.FIND_FAILED);
                return;
            }
            var results = {};
            var list = {};
            var total = {
                group_name: "合计",
                sales_quantify:0,
                sales_volume: 0,
                refund_quantify: 0,
                refund_volume: 0,
                actual_sales_volume: 0,
                selling_fees: 0,
                selling_fees_rate: "",
                ful_cost: 0,
                ful_cost_rate: "",
                merge_inventory_fees: 0,
                merge_inventory_fees_rate: "",
                fba_inventory_fees: 0,
                ad_fee: 0,
                ad_fee_rate: "",
                promotion_fees: 0,
                promotion_fees_rate: "",
                product_unit_price: 0,
                product_cost: 0,
                product_cost_rate: "",
                first_ship_unit_price: 0,
                first_ship_fees: 0,
                first_ship_fees_rate: "",
                last_ship_fees: 0,
                last_ship_fees_rate: "",
                withdrawal_service_fee: 0,
                withdrawal_service_fee_rate: "",
                rejects_quantify: 0,
                rejects_cost: 0,
                rejects_cost_rate: "",
                other_cost: 0,
                gross_profit: 0,
                gross_profit_rate: ""
            };
            for (var i = 0; i < mysqlResult.length; i++) {
                var result = mysqlResult[i];
                var key = result.group_name + result.store_name + result.sku;
                if (list[key]) {
                    list[key] = list[key];
                }else {
                    list[key] = {};
                    list[key].group_name = result.group_name;
                    list[key].store_name = result.store_name;
                    list[key].sku = result.sku;
                }
                total.sales_quantify += result.sales_quantify;
                total.sales_volume += result.sales_volume;
                total.refund_quantify += result.refund_quantify;
                total.refund_volume += result.refund_volume;
                total.actual_sales_volume += result.actual_sales_volume;
                total.selling_fees += result.selling_fees;
                total.ful_cost += result.ful_cost;
                total.merge_inventory_fees += result.merge_inventory_fees;
                total.fba_inventory_fees += result.fba_inventory_fees;
                total.ad_fee += result.ad_fee;
                total.promotion_fees += result.promotion_fees;
                total.product_cost += result.product_cost;
                total.first_ship_fees += result.first_ship_fees;
                total.last_ship_fees += result.last_ship_fees;
                total.withdrawal_service_fee += result.withdrawal_service_fee;
                total.rejects_quantify += result.rejects_quantify;
                total.rejects_cost += result.rejects_cost;
                total.other_cost += result.other_cost;
                total.gross_profit += result.gross_profit;

                list[key].sales_quantify = list[key].sales_quantify || 0;
                list[key].sales_quantify += result.sales_quantify;
                list[key].sales_volume = list[key].sales_volume || 0;
                list[key].sales_volume += result.sales_volume;
                list[key].refund_quantify = list[key].refund_quantify || 0;
                list[key].refund_quantify += result.refund_quantify;
                list[key].refund_volume = list[key].refund_volume || 0;
                list[key].refund_volume += result.refund_volume;
                list[key].actual_sales_volume = list[key].actual_sales_volume || 0;
                list[key].actual_sales_volume += result.actual_sales_volume;
                list[key].selling_fees = list[key].selling_fees || 0;
                list[key].selling_fees += result.selling_fees;
                list[key].ful_cost = list[key].ful_cost || 0;
                list[key].ful_cost += result.ful_cost;
                list[key].merge_inventory_fees = list[key].merge_inventory_fees || 0;
                list[key].merge_inventory_fees += result.merge_inventory_fees;
                list[key].fba_inventory_fees = list[key].fba_inventory_fees || 0;
                list[key].fba_inventory_fees += result.fba_inventory_fees;
                list[key].ad_fee = list[key].ad_fee || 0;
                list[key].ad_fee += result.ad_fee;
                list[key].promotion_fees = list[key].promotion_fees || 0;
                list[key].promotion_fees += result.promotion_fees;
                list[key].product_unit_price = list[key].product_unit_price || 0;
                if (list[key].product_unit_price < result.product_unit_price) list[key].product_unit_price = result.product_unit_price;
                list[key].product_cost = list[key].product_cost || 0;
                list[key].product_cost += result.product_cost;
                list[key].first_ship_unit_price = list[key].first_ship_unit_price || 0;
                if (list[key].first_ship_unit_price < result.first_ship_unit_price) list[key].first_ship_unit_price = result.first_ship_unit_price;
                list[key].first_ship_fees = list[key].first_ship_fees || 0;
                list[key].first_ship_fees += result.first_ship_fees;
                list[key].last_ship_fees = list[key].last_ship_fees || 0;
                list[key].last_ship_fees += result.last_ship_fees;
                list[key].withdrawal_service_fee = list[key].withdrawal_service_fee || 0;
                list[key].withdrawal_service_fee += result.withdrawal_service_fee;
                list[key].rejects_quantify = list[key].rejects_quantify || 0;
                list[key].rejects_quantify += result.rejects_quantify;
                list[key].rejects_cost = list[key].rejects_cost || 0;
                list[key].rejects_cost += result.rejects_cost;
                list[key].other_cost = list[key].other_cost || 0;
                list[key].other_cost += result.other_cost;
                list[key].gross_profit = list[key].gross_profit || 0;
                list[key].gross_profit += result.gross_profit;
            }

            for(var key in list) {
                list[key].selling_fees_rate = (list[key].selling_fees / list[key].actual_sales_volume * 100);
                list[key].ful_cost_rate = (list[key].ful_cost / list[key].actual_sales_volume * 100);
                list[key].merge_inventory_fees_rate = (list[key].merge_inventory_fees / list[key].actual_sales_volume * 100);
                list[key].ad_fee_rate = (list[key].ad_fee / list[key].actual_sales_volume * 100);
                list[key].promotion_fees_rate = (list[key].promotion_fees / list[key].actual_sales_volume * 100);
                list[key].product_cost_rate = (list[key].product_cost / list[key].actual_sales_volume * 100);
                list[key].first_ship_fees_rate = (list[key].first_ship_fees / list[key].actual_sales_volume * 100);
                list[key].last_ship_fees_rate = (list[key].last_ship_fees / list[key].actual_sales_volume * 100);
                list[key].withdrawal_service_fee_rate = (list[key].withdrawal_service_fee / list[key].actual_sales_volume * 100);
                list[key].rejects_cost_rate = (list[key].rejects_cost / list[key].actual_sales_volume * 100);
                list[key].gross_profit_rate = (list[key].gross_profit / list[key].actual_sales_volume * 100);
                for(var key2 in list[key]) {
                    if (key2 != "group_name" && key2 != "store_name" && key2 != "sku") {
                        if (list[key][key2] == "Infinity" || isNaN(list[key][key2]) || list[key][key2] == "-Infinity") list[key][key2] = 0;
                        list[key][key2] = list[key][key2].toFixed(2);
                    }
                }
                list[key].selling_fees_rate += "%";
                list[key].ful_cost_rate += "%";
                list[key].merge_inventory_fees_rate += "%";
                list[key].ad_fee_rate += "%";
                list[key].promotion_fees_rate += "%";
                list[key].product_cost_rate += "%";
                list[key].first_ship_fees_rate += "%";
                list[key].last_ship_fees_rate += "%";
                list[key].withdrawal_service_fee_rate += "%";
                list[key].rejects_cost_rate += "%";
                list[key].gross_profit_rate += "%";
            }
            results.list= list;

            total.selling_fees_rate = (total.selling_fees / total.actual_sales_volume * 100);
            total.ful_cost_rate = (total.ful_cost / total.actual_sales_volume * 100);
            total.merge_inventory_fees_rate = (total.merge_inventory_fees / total.actual_sales_volume * 100);
            total.ad_fee_rate = (total.ad_fee / total.actual_sales_volume * 100);
            total.promotion_fees_rate = (total.promotion_fees / total.actual_sales_volume * 100);
            total.product_cost_rate = (total.product_cost / total.actual_sales_volume * 100);
            total.first_ship_fees_rate = (total.first_ship_fees / total.actual_sales_volume * 100);
            total.last_ship_fees_rate = (total.last_ship_fees / total.actual_sales_volume * 100);
            total.withdrawal_service_fee_rate = (total.withdrawal_service_fee / total.actual_sales_volume * 100);
            total.rejects_cost_rate = (total.rejects_cost / total.actual_sales_volume * 100);
            total.gross_profit_rate = (total.gross_profit / total.actual_sales_volume * 100);
            for(var key4 in total) {
                if (key4 != "group_name" && key4 != "store_name" && key4 != "sku") {
                    if (total[key4] == "Infinity" || isNaN(total[key4]) || total[key4] == "-Infinity") total[key4] = 0;
                    total[key4] = total[key4].toFixed(2);
                }
            }
            total.selling_fees_rate += "%";
            total.ful_cost_rate += "%";
            total.merge_inventory_fees_rate += "%";
            total.ad_fee_rate+= "%";
            total.promotion_fees_rate += "%";
            total.product_cost_rate += "%";
            total.first_ship_fees_rate += "%";
            total.last_ship_fees_rate += "%";
            total.withdrawal_service_fee_rate += "%";
            total.rejects_cost_rate +="%";
            total.gross_profit_rate += "%";

            total.product_unit_price = "#";
            total.first_ship_unit_price = "#";
            results.total= total;

            var sql2 = "SELECT DISTINCT group_name FROM gpr_sku_cost_rate ";
            MysqlCrawler.query(sql2, null, function (err, nameResult) {
                if (err) {
                    debug(err);
                    res.error(ERROR_CODE.FIND_FAILED);
                    return;
                }
                results.teamName = nameResult;
                var sql3 = "SELECT DISTINCT store_name FROM gpr_sku_cost_rate ";
                MysqlCrawler.query(sql3, null, function (err, storeResult) {
                    if (err) {
                        debug(err);
                        res.error(ERROR_CODE.FIND_FAILED);
                        return;
                    }
                    results.storeName = storeResult;
                    res.success(results);
                })
            })
        });
    },

    teamProfitShow: function (req, res, next) {
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
            if (err) {
                debug(err);
                res.error(ERROR_CODE.FIND_FAILED);
                return;
            }
            var results = {};
            var list = [];
            if (groupResult) {
                groupResult.forEach(function (group) {
                    var grossProfitRate = "";
                    if (group.actual_sales_volume == 0) {
                        grossProfitRate = "0%";
                    }else {
                        grossProfitRate = (group.gross_profit / group.actual_sales_volume * 100).toFixed(2) + "%";
                    }
                    var result = {
                        group_name: group.group_name,
                        actual_sales_volume: group.actual_sales_volume.toFixed(2),
                        gross_profit: group.gross_profit.toFixed(2),
                        gross_profit_rate: grossProfitRate
                    };
                    total.actual_sales_volume += group.actual_sales_volume;
                    total.gross_profit += group.gross_profit;
                    list.push(result);
                });
                total.gross_profit_rate = (total.gross_profit / total.actual_sales_volume * 100).toFixed(2) + "%";
                total.gross_profit = total.gross_profit.toFixed(2);
                total.actual_sales_volume = total.actual_sales_volume.toFixed(2);
                results.list = list;
                results.total = total;
            }
            res.success(results);
        });
    }
};