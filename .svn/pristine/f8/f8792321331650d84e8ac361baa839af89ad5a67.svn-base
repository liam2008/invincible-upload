var debug = require('debug')('smartdo:controller:appraise');
var ServerError = require('../errors/server-error');
var async = require('async');
var moment = require('moment');
var UUID = require('uuid');
var SQLCrawlerTest = require('../models/mysql.crawler_test');
var AmwsGoods = SQLCrawlerTest.getModel('amws_goods');
var AmwsReviews = SQLCrawlerTest.getModel('amws_reviews');
var MysqlCrawlerTask = require('../databases/mysql_crawler_task');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Math = require('math');
var decodeUriComponent = require('decode-uri-component')

var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;
var Utils = Shared.Utils;

module.exports = {
    name: "appraise",

    EVALTotal: function (req, res, next) {
        var result = {};
        var EVALTotalResult = [];
        var taskSide = [];
        var where = {};
        if (req.query.asin) where.asin = req.query.asin;
        if (req.query.side) where.side = req.query.side;
        AmwsGoods.findAll({
            where: where,
            order: [
                ['asin', 'ASC']
            ]
        }).then(function(amwsGoodsFounds) {
            amwsGoodsFounds.forEach (function (amwsGoodsFound) {
                var result = {};
                result.inTime = amwsGoodsFound.in_time;
                result.asin = amwsGoodsFound.asin;
                result.imgUrl = amwsGoodsFound.img_url;
                result.title = amwsGoodsFound.title;
                result.price = amwsGoodsFound.price;
                result.side =  amwsGoodsFound.side;
                result.totalStar = amwsGoodsFound.total_star;
                result.reviewsCnt = amwsGoodsFound.reviews_cnt;
                result.vpCnt = amwsGoodsFound.vp_cnt;
                result.vpProportion = amwsGoodsFound.vp_proportion;
                result.nvpCnt = amwsGoodsFound.nvp_cnt;
                result.nvpProportion = amwsGoodsFound.nvp_proportion;
                result.reviewFirstTime = amwsGoodsFound.review_first_time;
                result.reviewLastTime = amwsGoodsFound.review_last_time;

                EVALTotalResult.push(result);
            });
            var sql = "SELECT code, name, type, type_code, status, val, create_time " +
                "FROM t_sys_parament AS t_sys_parament WHERE 1=1";
            MysqlCrawlerTask.query(sql, null, function (err, paramentFound) {
                if (err) {
                    debug(new Error(err));
                    res.error(ERROR_CODE.FIND_FAILED);
                    return;
                }
                paramentFound.forEach(function (parament) {
                    if (parament.type_code == "SI") {
                        taskSide.push({code: parament.code, name: parament.name});
                    }
                });
                result.list = EVALTotalResult;
                result.taskSide = taskSide;
                res.success(result);
            })
        }).catch(function(err) {
            // 出错了
            debug(new Error(err));
            res.error(ERROR_CODE.FIND_FAILED);
        });
    },

    EVALDetail: function (req, res, next) {
        var result = {};
        var EVALDetailResult = [];
        var lineTime = [];
        var isPv = [];
        var isNotPv = [];
        var lineStartDate;
        var isPvCount = [];
        var isNotPvCount = [];
        var startDate = req.query.startDate || moment().subtract(1, "month").format("YYYY-MM-DD");
        var endDate = req.query.endDate || moment().format("YYYY-MM-DD");

        var where = {
            review_time: {
                gte: startDate,
                lte: endDate
            }
        };
        if (req.query.asin && req.query.side) {
            where.asin = req.query.asin;
            where.side = req.query.side;
        }else {
            return res.error(ERROR_CODE.NOT_EXISTS);
        }
        if (req.query.verifiedPurchase) {
            if (req.query.verifiedPurchase == "true") where.verified_purchase = "true";
            else if (req.query.verifiedPurchase == "false") where.verified_purchase = "false";
            else return res.error(ERROR_CODE.INVALID_ARGUMENT);
        }

        var lineStartMoment =  moment(req.query.startDate).subtract(1, "month");
        lineStartDate = lineStartMoment.format("YYYY-MM-DD");
        while (lineStartDate <= endDate) {
            lineTime.push(lineStartDate);
            lineStartDate = lineStartMoment.add(1, 'day').format("YYYY-MM-DD");
        }
        AmwsReviews.findAll({
            where: where,
            order: [
                ['asin', 'ASC']
            ]
        }).then(function(amwsGoodsFounds) {
            amwsGoodsFounds.forEach (function (amwsGoodsFound) {
                var result = {};
                result.dataTime = amwsGoodsFound.data_time;
                result.reviewTime = amwsGoodsFound.review_time;
                result.asin = amwsGoodsFound.asin;
                result.side = amwsGoodsFound.side;
                result.star = amwsGoodsFound.star;
                result.authorId = amwsGoodsFound.author_id;
                result.author = decodeUriComponent(amwsGoodsFound.author);
                result.verifiedPurchase = amwsGoodsFound.verified_purchase;
                result.hasImg = amwsGoodsFound.has_img;
                result.hasVideo = amwsGoodsFound.has_video;
                result.content = decodeUriComponent(amwsGoodsFound.content);
                result.voteNum = amwsGoodsFound.vote_num;
                EVALDetailResult.push(result);

                var numInTime = lineTime.indexOf(amwsGoodsFound.review_time);
                if (numInTime != -1) {
                    if (amwsGoodsFound.verified_purchase == "true") {
                        isPv[numInTime] = isPv[numInTime] || 0;
                        isPv[numInTime] += amwsGoodsFound.star;
                        isPvCount[numInTime] = isPvCount[numInTime] || 0;
                        isPvCount[numInTime] += 1;
                    }else if (amwsGoodsFound.verified_purchase == "false") {
                        isNotPv[numInTime] = isNotPv[numInTime] || 0;
                        isNotPv[numInTime] += amwsGoodsFound.star;
                        isNotPvCount[numInTime] = isNotPvCount[numInTime] || 0;
                        isNotPvCount[numInTime] += 1;
                    }else debug("There is a err value that verified_purchase:" + amwsGoodsFound.verified_purchase);
                }
            });

            for (var m = 0; m < lineTime.length; m++) {
                isPv[m] = isPv[m] / isPvCount[m];
                isNotPv[m] = isNotPv[m] / isNotPvCount[m];
                if (isPv[m].toString() == "NaN") isPv[m] = null;
                if (isNotPv[m].toString() == "NaN") isNotPv[m] = null;
            }
            result.details = EVALDetailResult;
            result.lineStars = {};
            result.lineStars.lineTime = lineTime;
            result.lineStars.isPv = isPv;
            result.lineStars.isNotPv = isNotPv;
            res.success(result);
        }).catch(function(err) {
            // 出错了
            debug(new Error(err));
            res.error(ERROR_CODE.FIND_FAILED);
        });
    },

    EVALTask: function (req, res, next) {
        var taskContent = {};
        var taskType = "TT_ASIN_REVIEW";
        var taskStatus = "TS_CREATE";

        async.series([
            function (callB) {
                var sql = "SELECT code, name, type, type_code, status, val, create_time " +
                    "FROM t_sys_parament AS t_sys_parament WHERE 1=1";
                MysqlCrawlerTask.query(sql, null, function (err, paramentFound) {
                    if (err) {
                        // 出错了
                        callB(err);
                        res.error(ERROR_CODE.FIND_FAILED);
                        return;
                    }
                    paramentFound.forEach(function (parament) {
                        taskContent[parament.code] = parament;
                    });
                    callB(null);
                });
            },

            function (callB) {
                if (req.body.asin || req.body.side) {
                    var taskRule = {
                        asin: req.body.asin,
                        side: taskContent[req.body.side].val
                    };
                    var user = req.agent.name + "(" + req.agent.account + ")";
                    var sql = "INSERT INTO t_crawler_task(task_id, task_name, task_type, create_time, create_user, status, update_time, task_rule)" +
                        " VALUES('" + UUID.v4() + "','" + taskContent[taskType].name + "', '" + taskContent[taskType].val + "','" + moment().format("YYYY-MM-DD HH-mm-ss")
                        + "','" + user + "', '" + taskContent[taskStatus].val + "',  '" + moment().format("YYYY-MM-DD HH-mm-ss") + "', '" + JSON.stringify(taskRule)
                        + "');";
                    MysqlCrawlerTask.query(sql, null, function (err) {
                        if (err) {
                            res.error(ERROR_CODE.CREATE_FAILED);
                            return callB(err);
                        }
                        res.success();
                        return callB(null);
                    });
                }else {
                    res.error(ERROR_CODE.NOT_EXISTS);
                    return callB(null);
                }
            }
        ],
        function (err) {
            if (err) {
                debug(new Error(err));
                return;
            }
        })
    }
};