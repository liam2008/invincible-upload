var debug = require('debug')('smartdo:controller:appraise');
var ServerError = require('../errors/server-error');
var async = require('async');
var moment = require('moment');
var UUID = require('uuid');
var SQLCrawlerTest = require('../models/mysql.crawler_test');
var AmwsReviews = SQLCrawlerTest.getModel('amws_reviews');
var MysqlCrawlerTask = require('../databases/mysql_crawler_task');
var MysqlCrawlerOther = require('../databases/mysql_crawler_other');
var MysqlCrawlerTest = require('../databases/mysql_crawler_test');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var decodeUriComponent = require('decode-uri-component');

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
        var key2first = {};
        async.series([
                function (callB) {
                    var sql = "select asin,side,MAX(review_time) AS maxDate,MIN(review_time) AS minDate " +
                        "from amws_reviews GROUP BY asin,side";
                    MysqlCrawlerTest.query(sql, null, function (err, amwsReviewsFounds) {
                        if (err) {
                            callB(err);
                            res.error(ERROR_CODE.FIND_FAILED);
                            return;
                        }
                        amwsReviewsFounds.forEach(function (amwsReviewsFound) {
                            if (amwsReviewsFound.asin && amwsReviewsFound.side) {
                                var key = amwsReviewsFound.asin.toString() + amwsReviewsFound.side.toString() ;
                                key2first[key] = {};
                                key2first[key].reviewFirstTime = amwsReviewsFound.minDate;
                                key2first[key].reviewLastTime = amwsReviewsFound.maxDate;
                            }else {
                                res.error(ERROR_CODE.DB_ERROR);
                                callB("asin or side err");
                                return;
                            }
                        });
                        callB(null);
                    })
                },

                function (callB) {
                    var sql = "SELECT in_time, asin, img_url, title, price, side, total_star, reviews_cnt, vp_cnt, " +
                        "vp_proportion, nvp_cnt, nvp_proportion FROM amws_goods";
                    MysqlCrawlerTest.query(sql, null, function (err, amwsGoodsFounds) {
                        if (err) {
                            callB(err);
                            res.error(ERROR_CODE.FIND_FAILED);
                            return;
                        }
                        amwsGoodsFounds.forEach(function (amwsGoodsFound) {
                            var result = {};
                            if (amwsGoodsFound.asin && amwsGoodsFound.side) {
                                var key = amwsGoodsFound.asin.toString() + amwsGoodsFound.side.toString();
                                result.inTime = amwsGoodsFound.in_time;
                                result.asin = amwsGoodsFound.asin;
                                result.imgUrl = amwsGoodsFound.img_url;
                                result.title = amwsGoodsFound.title;
                                result.price = amwsGoodsFound.price;
                                result.side = amwsGoodsFound.side;
                                result.totalStar = amwsGoodsFound.total_star;
                                result.reviewsCnt = amwsGoodsFound.reviews_cnt;
                                result.vpCnt = amwsGoodsFound.vp_cnt;
                                result.vpProportion = amwsGoodsFound.vp_proportion;
                                result.nvpCnt = amwsGoodsFound.nvp_cnt;
                                result.nvpProportion = amwsGoodsFound.nvp_proportion;
                                result.reviewFirstTime = key2first[key].reviewFirstTime;
                                result.reviewLastTime = key2first[key].reviewLastTime;

                            }
                            EVALTotalResult.push(result);
                        });
                        result.list = EVALTotalResult;
                        callB(null)
                    })
                },

                function (callB) {
                    var sql = "SELECT code, name, type, type_code, status, val, create_time " +
                        "FROM t_sys_parament AS t_sys_parament WHERE 1=1";
                    MysqlCrawlerTask.query(sql, null, function (err, paramentFound) {
                        if (err) {
                            callB(err);
                            res.error(ERROR_CODE.FIND_FAILED);
                            return;
                        }
                        paramentFound.forEach(function (parament) {
                            if (parament.type_code == "SI") {
                                taskSide.push({code: parament.code, name: parament.name});
                            }
                        });
                        result.taskSide = taskSide;
                        res.success(result);
                        callB(null);
                    })
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

    EVALDetail: function (req, res, next) {
        var result = {};
        var EVALDetailResult = [];
        var lineTime = [];
        var isPv = [];
        var isNotPv = [];
        var lineStartDate;
        var starDivide = {};
        var fiveStar = 0;
        var fourStar = 0;
        var threeStar = 0;
        var twoStar = 0;
        var oneStar = 0;
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

        var lineStartMoment =  moment(startDate);
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
                var DetailResult = {};
                DetailResult.dataTime = amwsGoodsFound.data_time;
                DetailResult.reviewTime = amwsGoodsFound.review_time;
                DetailResult.asin = amwsGoodsFound.asin;
                DetailResult.side = amwsGoodsFound.side;
                DetailResult.star = amwsGoodsFound.star;
                DetailResult.authorId = amwsGoodsFound.author_id;
                DetailResult.author = decodeUriComponent(amwsGoodsFound.author);
                DetailResult.verifiedPurchase = amwsGoodsFound.verified_purchase;
                DetailResult.hasImg = amwsGoodsFound.has_img;
                DetailResult.hasVideo = amwsGoodsFound.has_video;
                DetailResult.content = decodeUriComponent(amwsGoodsFound.content);
                DetailResult.voteNum = amwsGoodsFound.vote_num;
                EVALDetailResult.push(DetailResult);
                var numInTime = lineTime.indexOf(amwsGoodsFound.review_time);
                if (numInTime != -1) {
                    if (amwsGoodsFound.verified_purchase == "true") {
                        isPv[numInTime] = isPv[numInTime] || 0;
                        isPv[numInTime] += 1;
                    }else if (amwsGoodsFound.verified_purchase == "false") {
                        isNotPv[numInTime] = isNotPv[numInTime] || 0;
                        isNotPv[numInTime] += 1;
                    }else debug("There is a err value that id" + amwsGoodsFound.id + "\tverified_purchase:" + amwsGoodsFound.verified_purchase);
                }
                if (amwsGoodsFound.star == 5) fiveStar += 1;
                else if (amwsGoodsFound.star == 4) fourStar += 1;
                else if (amwsGoodsFound.star == 3) threeStar += 1;
                else if (amwsGoodsFound.star == 2) twoStar += 1;
                else if (amwsGoodsFound.star == 1) oneStar += 1;
                else debug("The star number " + amwsGoodsFound.star + " didn`t count");
            });

            starDivide.five = fiveStar;
            starDivide.four = fourStar;
            starDivide.three = threeStar;
            starDivide.two = twoStar;
            starDivide.one = oneStar;

            result.details = EVALDetailResult;
            result.starDivide = starDivide;
            result.lineReview = {};
            result.lineReview.lineTime = lineTime;
            result.lineReview.isPv = isPv;
            result.lineReview.isNotPv = isNotPv;
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
                if (req.body.asin && req.body.side) {
                    var taskRule = {
                        asin: req.body.asin,
                        site_info: taskContent[req.body.side].val
                    };
                    var user = req.agent.name + "(" + req.agent.account + ")";
                    var sql = "INSERT INTO t_crawler_task(task_id, task_name, task_type, create_time, create_user, status, update_time, task_rule)"
                        + " VALUES('" + UUID.v4() + "','" + taskContent[taskType].name + "-" + req.body.asin + "', '" + taskContent[taskType].val + "','"
                        + moment().format("YYYY-MM-DD HH:mm:ss") + "','" + user + "', '" + taskContent[taskStatus].val + "',  '" + moment().format("YYYY-MM-DD HH:mm:ss")
                        + "', '" + JSON.stringify(taskRule) + "');";
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
    },

    keyword: function (req, res, next) {
        var where = "WHERE 1=1";
        if (req.query.bprice) where += (" AND price >= " + req.query.bprice);
        if (req.query.eprice) where += (" AND price <= " + req.query.eprice);
        if (req.query.breview) where += (" AND REPLACE(customer_review,',', '') >= " + req.query.breview);
        if (req.query.ereview) where += (" AND REPLACE(customer_review,',', '') <= " + req.query.ereview);
        if (req.query.bscore) where += (" AND score + 0 >= " + req.query.bscore);
        if (req.query.escore) where += (" AND score + 0 <= " + req.query.escore);
        if (req.query.brate) where += (" AND REPLACE(big_type_rank,',', '') + 0 >= " + req.query.brate);
        if (req.query.erate) where += (" AND REPLACE(big_type_rank,',', '') + 0 <= " + req.query.erate);
        var result = {
            list: [],
            keywords: [],
            totalItems: 0,
            taskSide: []
        };
        async.series([
                // 根据关键字查询,获取所有关键字
                function (callB) {
                    var sql = ("SELECT task_id, task_rule FROM t_crawler_task AS t_crawler_task WHERE task_rule LIKE '%\"keyword\":%'");
                    MysqlCrawlerTask.query(sql, null, function (err, paramentFounds) {
                        if (err) {
                            // 出错了
                            callB(err);
                            res.error(ERROR_CODE.FIND_FAILED);
                            return;
                        }
                        paramentFounds.forEach(function (paramentFound) {
                            var taskRule = JSON.parse(paramentFound.task_rule);
                            result.keywords.push(taskRule.keyword);
                            if (req.query.keyword) {
                                if (taskRule.keyword.toString() == req.query.keyword.toString()) {
                                    where += (" AND task_id = '" + paramentFound.task_id + "'");
                                    console.log(where)
                                }
                            }
                        });
                        callB(null);
                    })
                },

                // 根据条件查询
                function (callB) {
                    var sql = "SELECT price, customer_review, title, small_type, score, is_ziying, is_fba, big_type_rank, " +
                        "big_type, url, asin, currency FROM keyword_goods AS keyword_goods ";
                    var currentPage = req.query.currentPage || 1;
                    var itemsPerPage = req.query.itemsPerPage || 10;
                    var limit = (" LIMIT " + (currentPage - 1) * itemsPerPage + ", " + itemsPerPage);
                    sql = sql + where + limit;
                    MysqlCrawlerOther.query(sql, null, function (err, paramentFounds) {
                        if (err) {
                            // 出错了
                            callB(err);
                            res.error(ERROR_CODE.FIND_FAILED);
                            return;
                        }
                        paramentFounds.forEach(function (paramentFound) {
                            var smallType = paramentFound.small_type.substring(paramentFound.small_type.lastIndexOf(">") + 1, paramentFound.small_type.lastIndexOf(":") - 1)
                            var sqlResult = {};
                            sqlResult.price = paramentFound.price;
                            sqlResult.csrReview = paramentFound.customer_review;
                            sqlResult.title = paramentFound.title;
                            sqlResult.smallType = smallType;
                            sqlResult.score = paramentFound.score;
                            sqlResult.isZiYingv = paramentFound.is_ziying;
                            sqlResult.isFba = paramentFound.is_fba;
                            sqlResult.bigTypeRank = paramentFound.big_type_rank;
                            sqlResult.bigType = paramentFound.big_type;
                            sqlResult.url = paramentFound.url;
                            sqlResult.asin = paramentFound.asin;
                            sqlResult.currency = paramentFound.currency;

                            result.list.push(sqlResult);
                        });
                        callB(null)
                    })
                },

                // 数据总数
                function (callB) {
                    var countSql = "SELECT COUNT(*) AS totalItems FROM keyword_goods AS keyword_goods ";
                    countSql = countSql + where;
                    MysqlCrawlerOther.query(countSql, null, function (err, paramentFound) {
                        if (err) {
                            // 出错了
                            callB(err);
                            res.error(ERROR_CODE.FIND_FAILED);
                            return;
                        }
                        result.totalItems = paramentFound[0].totalItems;
                        callB(null);
                    })
                },

                // 站点
                function (callB) {
                    var sql = "SELECT code, name, type, type_code, status, val, create_time " +
                        "FROM t_sys_parament AS t_sys_parament WHERE 1=1";
                    MysqlCrawlerTask.query(sql, null, function (err, paramentFound) {
                        if (err) {
                            callB(err);
                            res.error(ERROR_CODE.FIND_FAILED);
                            return;
                        }
                        var taskSide = [];
                        paramentFound.forEach(function (parament) {
                            if (parament.type_code == "SI") {
                                taskSide.push({code: parament.code, name: parament.name});
                            }
                        });
                        result.taskSide = taskSide;
                        callB(null);
                    })
                }
            ],
            function (err) {
                if (err) {
                    debug(new Error(err));
                    return;
                }
                res.success(result);
            }
        )
    },

    keywordTask: function (req, res, next) {
        var taskContent = {};
        var taskType = "TT_KEYWORD_GOODS";
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
                    if (req.body.keyword && req.body.site) {
                        var taskRule = {
                            keyword: req.body.keyword,
                            site_info: taskContent[req.body.site].val
                        };
                        var user = req.agent.name + "(" + req.agent.account + ")";
                        var sql = "INSERT INTO t_crawler_task(task_id, task_name, task_type, create_time, create_user, status, update_time, task_rule)"
                            + " VALUES('" + UUID.v4() + "','" + taskContent[taskType].name + "-" + req.body.keyword + "', '" + taskContent[taskType].val + "','"
                            + moment().format("YYYY-MM-DD HH:mm:ss") + "','" + user + "', '" + taskContent[taskStatus].val + "',  '" + moment().format("YYYY-MM-DD HH:mm:ss")
                            + "', '" + JSON.stringify(taskRule) + "');";
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