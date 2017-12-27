var debug = require('debug')('smartdo:controller:sellerRank');
var ServerError = require('../errors/server-error');
var ADC = require('../models/adc');
var SellerRank = ADC.getModel('SellerRank');

var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;
var dealErr = require('../errors/controller-error');

var env = process.env.NODE_ENV || "development";

module.exports = {
    name: "sellerRank",

    rankList: function(req, res, next) {
        var results = {};
        var current = req.query.current || 1;
        var pageSize = 10;
        var sort = req.query.sort || "{}";
        sort = JSON.parse(sort);
        var findRequire = {};
        var month = req.query.month || moment.format('YYYY-MM');
        findRequire.TimeId = month;
        if (req.query.From) findRequire.From = req.query.From;
        if (req.query.IsFba) {
            if (req.query.IsFba == "true") {
                findRequire.IsFba = Boolean(req.query.IsFba);
            }else if (req.query.IsFba == "null"){
                findRequire.IsFba = null;
            }else {
                debug(findRequire.IsFba);
            }
        }
        if(req.query.allKeyword) {
            var allKeyword = req.query.allKeyword.trim();
            allKeyword = allKeyword.split(/\s+/);
            findRequire.$and = [];
            for(var i = 0;i < allKeyword.length; i++) {
                var allKeywordStr;
                var allKeywordNum = "";
                allKeywordStr = new RegExp(allKeyword[i]);
                (findRequire.$and).push({});
                (findRequire.$and)[i].$or = [];
                var $or = [
                    {"SellerName": allKeywordStr},
                    {"SellerId": allKeywordStr}
                ];
                var regNum = /^[0-9]+.?[0-9]*$/;
                if (regNum.test(allKeyword[i])) {
                    allKeywordNum = Number(allKeyword[i]);
                    $or.push({"MonthRank": allKeywordNum});
                    $or.push({"YearRank": allKeywordNum});
                    $or.push({"LifetimeRank": allKeywordNum});
                    $or.push({"Lifetime": allKeywordNum});
                    $or.push({"M12.3": allKeywordNum});
                    $or.push({"M3.3": allKeywordNum});
                    $or.push({"M1.3": allKeywordNum});
                    $or.push({"M12.0": allKeywordNum});
                }
                (findRequire.$and)[i].$or = $or;
            }
        }
        SellerRank.find(findRequire).sort(sort).skip((current - 1) * pageSize).limit(parseInt(pageSize)).exec(function (err, SellerRankListResult) {
            if (dealErr.findErr(err, res)) return debug(new Error(err));
            var list = [];
            if (SellerRankListResult) {
                SellerRankListResult.forEach(function (SellerRankResult) {
                    if (SellerRankResult.Lifetime == null) {
                        SellerRankResult.Lifetime = ["","","",null];
                    }
                    if (SellerRankResult.M12 == null) {
                        SellerRankResult.M12 = [null,"","",null];
                    }
                    if (SellerRankResult.M3 == null) {
                        SellerRankResult.M3 = ["","","",null];
                    }
                    if (SellerRankResult.M1 == null) {
                        SellerRankResult.M1 = ["","","",null];
                    }
                    var reg = new RegExp("&amp;tag=mk");
                    var test = reg.test(SellerRankResult.SellerId);
                    if (test) {
                        var num = SellerRankResult.SellerId.indexOf("&amp;tag=mk");
                        SellerRankResult.SellerId = SellerRankResult.SellerId.substring(0, num);
                    }
                    if ((SellerRankResult.M12)[0]) (SellerRankResult.M12)[0] = (SellerRankResult.M12)[0] + "%";
                    var result = {
                        _id: SellerRankResult._id,
                        From: SellerRankResult.From,
                        SellerName: SellerRankResult.SellerName,
                        SellerId: SellerRankResult.SellerId,
                        IsFba: SellerRankResult.IsFba,
                        Growth: SellerRankResult.Growth,
                        MonthRank: SellerRankResult.MonthRank,
                        YearRank: SellerRankResult.YearRank,
                        LifetimeRank: SellerRankResult.LifetimeRank,
                        Lifetime: (SellerRankResult.Lifetime)[3],
                        M12: (SellerRankResult.M12)[3],
                        M3: (SellerRankResult.M3)[3],
                        M1: (SellerRankResult.M1)[3],
                        Pos: (SellerRankResult.M12)[0]
                    };
                    list.push(result);
                });
                results["data"] = list;
            }
            SellerRank.count(findRequire, function (err, maxNum) {
                results["total"] = maxNum;
                if (env != "development") {
                    res.success(results);
                }else {
                    res.success();
                }
            })
        });
    },

    popupList: function(req, res, next) {
        var results = [];
        var findRequire = {};
        findRequire._id = req.query._id;
        SellerRank.findOne(findRequire, function (err, SellerRankResult) {
            if (dealErr.findErr(err, res)) return debug(new Error(err));
            for (var i = 0; i < (SellerRankResult.M1).length; i ++) {
                var result = [(SellerRankResult.M1)[i], (SellerRankResult.M3)[i], (SellerRankResult.M12)[i], (SellerRankResult.Lifetime)[i]];
                results.push(result);
            }
            if (env != "development") {
                res.success(results);
            }else {
                res.success();
            }
        });
    }
};
