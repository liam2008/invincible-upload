var debug = require('debug')('smartdo:controller:counted');
var ServerError = require('../errors/server-error');
var ADC = require('../models/adc');
var Formula = ADC.getModel('Formula');
var moment = require('moment');

var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;
var dealErr = require('../errors/controller-error');

module.exports = {
    name: "counted",

    counted: function(req, res, next) {
        var results = {};
        if (!req.body.meichandisePrice && !req.body.goodScost && !req.body.weight && !req.body.projectedSales) {
            results.merFriFreight = 0;
            results.commission = 0;
            results.fulfillmentCost = 0;
            results.platformCost = 0;
            results.cost = 0;
            results.netReceipts = 0;
            results.profit = 0;
            results.profitRate = 0;
            results.dailyProfit = 0;
            results.monthTurnover = 0;
            results.monthProfit = 0;
        }else {
            var meichandisePrice = req.body.meichandisePrice || 0;
            meichandisePrice = Number(meichandisePrice);
            var goodScost = req.body.goodScost || 0;
            goodScost = Number(goodScost);
            var weight = req.body.weight || 0;
            weight = Number(weight);
            var comCoefficient = req.body.comCoefficient || 0;
            comCoefficient = Number(comCoefficient.replace(/%/g, "")) * 0.01;
            var projectedSales = req.body.projectedSales || 0;
            projectedSales = Number(projectedSales);
            var exchangeRate = req.body.exchangeRate || 0;
            exchangeRate = Number(exchangeRate);
            var firstFreight = req.body.firstFreight || 0;
            firstFreight = Number(firstFreight);

            results.merFriFreight = firstFreight * weight;         // 商品头程运费
            results.commission = meichandisePrice * comCoefficient;              // 佣金
            results.fulfillmentCost = 0;
            if (moment().format('MM') >= 10) {
                if (weight / 0.45 > 6) results.fulfillmentCost = 6.69 + parseInt(((weight / 0.45 + 1) + 1) - 2)*0.35;
                else if ((weight / 0.45 + 0.25) < 1) results.fulfillmentCost = 2.88;
                else if ((weight / 0.45 + 0.25 ) <= 2) results.fulfillmentCost = 3.96;
                else results.fulfillmentCost = 3.96+(parseInt((weight / 0.45 + 0.25) + 1) - 2) * 0.35;
            }else {
                if ((weight / 0.45) > 6) {
                    results.fulfillmentCost = 6.85 + parseInt(((weight / 0.45 + 1) + 1) - 2) * 0.39;
                }else if ((weight / 0.45 + 0.25) < 1) {
                    results.fulfillmentCost = 3.02;
                }else if ((weight / 0.45 + 0.25) <= 2) {
                    results.fulfillmentCost = 4.18;
                }else {
                    results.fulfillmentCost = 4.18+(parseInt((weight / 0.45 + 0.25) + 1) - 2) * 0.39;
                }
            }
            results.platformCost = results.commission + results.fulfillmentCost;         // 平台费用
            results.cost = goodScost + results.merFriFreight + 0;                  // 成本
            results.netReceipts = (meichandisePrice - results.platformCost) * exchangeRate;	        // 实收
            results.profit = results.netReceipts - results.cost;             	// 毛利
            results.profitRate = (results.profit / exchangeRate) / meichandisePrice;         	// 毛利率
            if (results.profitRate == NaN) results.profitRate = 0;
            results.dailyProfit = results.profit * projectedSales;          // 日毛利
            results.monthTurnover = meichandisePrice * projectedSales * 30;        // 月营业额
            results.monthProfit = results.dailyProfit * 30 / exchangeRate;         // 月利润
            if (results.monthProfit == NaN) results.monthProfit = 0;
        }

        Formula.find({}, function (err, formulaListResult) {
            if (dealErr.findErr(err, res)) return debug(new Error(err));
            var formula = {};
            if (formulaListResult) {
                formulaListResult.forEach(function (formulaResult) {
                    formula[formulaResult.name] = formulaResult.explain;
                });
            }
            results.formula = formula;
            res.success(results);
        })
    },

    listFormula: function(req, res, next) {
        Formula.find({}, function (err, formulaListResult) {
            if (dealErr.findErr(err, res)) return debug(new Error(err));
            res.success(formulaListResult);
        })
    },

    updateFormula: function(req, res, next) {
        Formula.findOne({name: req.body.name}, function (err, formulaResult) {
            if (dealErr.findErr(err, res)) return debug(new Error(err));
            if (formulaResult) {
                formulaResult.explain = req.body.explain;
                formulaResult.save(function (err) {
                    if (dealErr.updateErr(err, res)) return debug(new Error(err));
                    res.success(true);
                })
            }else {
                res.success(false);
            }
        })
    },

    saveFormula: function(req, res, next) {
        Formula.findOne({name: req.body.name}, function (err, formulaResult) {
            if (dealErr.findErr(err, res)) return debug(new Error(err));
            if (!formulaResult) {
                var newFormula = new Formula({
                    name: req.body.name,
                    explain: req.body.explain
                });
                newFormula.save(function (err) {
                    if (dealErr.findErr(err, res)) return debug(new Error(err));
                    res.success(true);
                });
            }else {
                res.success(false);
            }
        })
    },

    deleteFormula: function(req, res, next) {
        Formula.remove({_id: req.body._id}, function (err) {
            if (dealErr.removeErr(err, res)) return debug(new Error(err));
            res.success(true);
        })
    }
};