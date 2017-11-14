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
            " rejects_quantify, rejects_cost, rejects_cost_rate, other_cost, gross_profit, gross_profit_rate,data_load_date FROM gpr_sku_cost_rate AS gpr_sku_cost_rate WHERE 1=1 ";
        if (req.query.group_name) sql += ("AND group_name = '" + req.query.group_name + "'");
        if (req.query.store_name) sql += ("AND store_name = '" + req.query.store_name + "'");
        if (req.query.sku) sql += ("AND sku = '" + req.query.sku + "'");
        if (req.query.startDate) sql += (" AND yyyymmdd >= '" + req.query.startDate + "'");
        if (req.query.endDate) sql += (" AND yyyymmdd <= '" + req.query.endDate + "'");
        MysqlCrawler.query(sql, null, function(err, mysqlResult) {
            if (err) {
                debug(err);
                res.error(ERROR_CODE.FIND_FAILED);
                return;
            }
            var results = {};
            var list = [];
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
                result.selling_fees_rate = result.selling_fees_rate.toFixed(2) + "%";
                result.ful_cost_rate = result.ful_cost_rate.toFixed(2) + "%";
                result.merge_inventory_fees_rate = result.merge_inventory_fees_rate.toFixed(2) + "%";
                result.ad_fee_rate = result.ad_fee_rate.toFixed(2) + "%";
                result.promotion_fees_rate = result.promotion_fees_rate.toFixed(2) + "%";
                result.product_cost_rate = result.product_cost_rate.toFixed(2) + "%";
                result.first_ship_fees_rate = result.first_ship_fees_rate.toFixed(2) + "%";
                result.last_ship_fees_rate = result.last_ship_fees_rate.toFixed(2) + "%";
                result.withdrawal_service_fee_rate = result.withdrawal_service_fee_rate.toFixed(2) + "%";
                result.rejects_cost_rate = result.rejects_cost_rate.toFixed(2) + "%";
                result.gross_profit_rate = result.gross_profit_rate.toFixed(2) + "%";

                total.sales_quantify += result.sales_quantify;
                total.sales_volume += result.sales_volume;
                total.refund_quantify += result.refund_quantify;
                total.refund_volume += result.refund_volume;
                total.actual_sales_volume += result.actual_sales_volume;
                total.selling_fees += result.selling_fees;
                total.ful_cost += result.ful_cost;
                total.merge_inventory_fees += result.merge_inventory_fees;
                total.ad_fee += result.ad_fee;
                total.promotion_fees += result.promotion_fees;
                total.product_cost += result.product_cost;
                total.first_ship_fees += result.first_ship_fees;
                total.last_ship_fees += result.last_ship_fees;
                total.withdrawal_service_fee += result.withdrawal_service_fee;
                total.rejects_cost += result.rejects_cost;
                total.gross_profit += result.gross_profit;

                result.sales_quantify = result.sales_quantify.toFixed(2);
                result.sales_volume = result.sales_volume.toFixed(2);
                result.refund_quantify = result.refund_quantify.toFixed(2);
                result.refund_volume = result.refund_volume.toFixed(2);
                result.actual_sales_volume = result.actual_sales_volume.toFixed(2);
                result.selling_fees = result.selling_fees.toFixed(2);
                result.ful_cost = result.ful_cost.toFixed(2);
                result.merge_inventory_fees = result.merge_inventory_fees.toFixed(2);
                result.ad_fee = result.ad_fee.toFixed(2);
                result.promotion_fees = result.promotion_fees.toFixed(2);
                result.product_unit_price = result.product_unit_price.toFixed(2);
                result.product_cost = result.product_cost.toFixed(2);
                result.first_ship_unit_price = result.first_ship_unit_price.toFixed(2);
                result.first_ship_fees = result.first_ship_fees.toFixed(2);
                result.last_ship_fees = result.last_ship_fees.toFixed(2);
                result.withdrawal_service_fee = result.withdrawal_service_fee.toFixed(2);
                result.rejects_cost = result.rejects_cost.toFixed(2);
                result.gross_profit = result.gross_profit.toFixed(2);

                list.push(result)
            }
            results.list= list;
            total.sales_volume = total.sales_volume.toFixed(2);
            total.refund_volume = total.refund_volume.toFixed(2);
            total.actual_sales_volume = total.actual_sales_volume.toFixed(2);
            total.selling_fees_rate = (total.selling_fees / total.actual_sales_volume * 100).toFixed(2) + "%";
            total.selling_fees  = total.selling_fees.toFixed(2);
            total.ful_cost_rate = (total.ful_cost / total.actual_sales_volume * 100).toFixed(2) + "%";
            total.ful_cost = total.ful_cost.toFixed(2);
            total.merge_inventory_fees_rate = (total.merge_inventory_fees / total.actual_sales_volume * 100).toFixed(2) + "%";
            total.merge_inventory_fees = total.merge_inventory_fees.toFixed(2);
            total.ad_fee_rate = (total.ad_fee / total.actual_sales_volume * 100).toFixed(2) + "%";
            total.ad_fee = total.ad_fee.toFixed(2);
            total.promotion_fees_rate = (total.promotion_fees / total.actual_sales_volume * 100).toFixed(2) + "%";
            total.promotion_fees = total.promotion_fees.toFixed(2);
            total.product_cost_rate = (total.product_cost / total.actual_sales_volume * 100).toFixed(2) + "%";
            total.product_cost = total.product_cost.toFixed(2);
            total.product_unit_price = "#";
            total.first_ship_fees_rate = (total.first_ship_fees / total.actual_sales_volume * 100).toFixed(2) + "%";
            total.first_ship_fees = total.first_ship_fees.toFixed(2);
            total.first_ship_unit_price = "#";
            total.last_ship_fees_rate = (total.last_ship_fees / total.actual_sales_volume * 100).toFixed(2) + "%";
            total.last_ship_fees = total.last_ship_fees.toFixed(2);
            total.withdrawal_service_fee_rate = (total.withdrawal_service_fee / total.actual_sales_volume * 100).toFixed(2) + "%";
            total.withdrawal_service_fee = total.withdrawal_service_fee.toFixed(2);
            total.rejects_cost_rate = (total.rejects_cost / total.actual_sales_volume * 100).toFixed(2) + "%";
            total.rejects_cost = total.rejects_cost.toFixed(2);
            total.gross_profit_rate = (total.gross_profit / total.actual_sales_volume * 100).toFixed(2) + "%";
            total.gross_profit = total.gross_profit.toFixed(2);
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
                    var grossProfitRate = (group.gross_profit / group.actual_sales_volume * 100).toFixed(2) + "%";
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
                results.list = list;
                results.total = total;

                res.success(results);
            }
        });
    }
};