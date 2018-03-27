var debug = require('debug')('smartdo:controller:appraise');
var ServerError = require('../errors/server-error');
var async = require('async');
var moment = require('moment');
var UUID = require('uuid');
var SQLCrawlerTest = require('../models/mysql.amazon_data');
var AmwsReviews = SQLCrawlerTest.getModel('amws_reviews');
var MysqlCrawlerTask = require('../databases/mysql_crawler_task');
var MysqlAmazonData = require('../databases/mysql_amazon_data');
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
                    MysqlAmazonData.query(sql, null, function (err, amwsReviewsFounds) {
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
                                return callB("asin or side err");
                            }
                        });
                        callB(null);
                    })
                },

                function (callB) {
                    var sql = "SELECT in_time, asin, img_url, title, price, side, total_star, reviews_cnt, vp_cnt, " +
                        "vp_proportion, nvp_cnt, nvp_proportion FROM amws_goods";
                    MysqlAmazonData.query(sql, null, function (err, amwsGoodsFounds) {
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
                    var sql = ("SELECT task_id, task_rule FROM t_crawler_task AS t_crawler_task WHERE task_rule LIKE '%\"keyword\":%'ORDER BY create_time DESC");
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
                                }
                            }else if (result.keywords.length == 1) {
                                where += (" AND task_id = '" + paramentFound.task_id + "'");
                            }
                        });
                        callB(null);
                    })
                },

                // 根据条件查询
                function (callB) {
                    var list = [];
                    var sql = "SELECT price, customer_review, title, small_type, score, is_ziying, is_fba, big_type_rank, " +
                        "big_type, url, asin, currency FROM keyword_goods AS keyword_goods ";
                    var currentPage = req.query.currentPage || 1;
                    var itemsPerPage = req.query.itemsPerPage || 10;
                    var limit = (" LIMIT " + (currentPage - 1) * itemsPerPage + ", " + itemsPerPage);

                    sql = sql + where + limit;
                    MysqlAmazonData.query(sql, null, function (err, paramentFounds) {
                        if (err) {
                            // 出错了
                            callB(err);
                            res.error(ERROR_CODE.FIND_FAILED);
                            return;
                        }
                        paramentFounds.forEach(function (paramentFound) {
                            var smallType = paramentFound.small_type.substring(paramentFound.small_type.lastIndexOf(">") + 1, paramentFound.small_type.lastIndexOf(":") - 1);
                            var sqlResult = {};
                            sqlResult.asin = paramentFound.asin;
                            sqlResult.url = paramentFound.url;
                            sqlResult.title = paramentFound.title;
                            sqlResult.price = paramentFound.price;
                            sqlResult.csrReview = paramentFound.customer_review;
                            sqlResult.score = paramentFound.score;
                            sqlResult.isFba = paramentFound.is_fba;
                            sqlResult.isZiYingv = paramentFound.is_ziying;
                            sqlResult.bigType = paramentFound.big_type;
                            sqlResult.smallType = smallType;
                            sqlResult.bigTypeRank = paramentFound.big_type_rank;
                            sqlResult.currency = paramentFound.currency;

                            list.push(sqlResult);
                        });
                        result.list = list;
                        callB(null)
                    })
                },

                // 数据总数
                function (callB) {
                    var countSql = "SELECT COUNT(*) AS totalItems FROM keyword_goods AS keyword_goods ";
                    countSql = countSql + where;
                    MysqlAmazonData.query(countSql, null, function (err, paramentFound) {
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
                    if (req.body.pageSize) req.body.pageSize = Utils.toNumber(req.body.pageSize);
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
    },

    setReviewDescTask: function (req, res, next) {
        var taskContent = {};
        var taskType = "TT_ASIN_REVIEW_CRAWLER";
        var lastId = null;
        var taskStatus = "TS_CREATE";

        async.series([
                // 获取配置表中的相关信息
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

                // 获取最新的这种类型的配置信息，以得到简单编号
                function (callB) {
                    var sql = "SELECT task_id FROM t_crawler_task AS ars WHERE task_type = ? AND NOT EXISTS(" +
                        "SELECT 1 FROM t_crawler_task WHERE task_type = ? AND task_type = ars.task_type " +
                        "AND create_time > ars.create_time)";
                    MysqlCrawlerTask.query(sql, [taskContent[taskType].val, taskContent[taskType].val], function (err, taskFound) {
                        if (err) {
                            // 出错了
                            callB(err);
                            res.error(ERROR_CODE.FIND_FAILED);
                            return;
                        }
                        var lastTask = taskFound[0] || null;
                        if (lastTask) {
                            var reg = new RegExp("[0-9]*$");
                            var num = reg.exec(lastTask.task_id);
                            if (num) {
                                var date = num[0].substring(0, num[0].length - 3);
                                if (date.toString() == moment().format("YYYYMMDD").toString()) {
                                    lastId = "review_desc_" + (Utils.toNumber(num[0]) + 1).toString();
                                }else {
                                    lastId = "review_desc_" + moment().format("YYYYMMDD") + "001";
                                }
                            }else {
                                res.error(ERROR_CODE.UNKNOW_ERR);
                                return;
                            }
                        }else {
                            lastId = "review_desc_" + moment().format("YYYYMMDD") + "001";
                        }
                        callB(null);
                    });
                },

                // 添加任务
                function (callB) {
                    if (req.body.content && Object.prototype.toString.call(req.body.content) === '[object Array]') {
                        var taskRule = [];
                        req.body.content.forEach(function (row) {
                            if (row.asin && row.site && row.brand) {
                                var site;
                                if (row.site.toUpperCase() == "WALMART") {
                                    site = "SI_WALMART";
                                }else {
                                    site = "SI_" + row.site.toUpperCase();
                                }
                                taskRule.push({
                                    asin: row.asin,
                                    site_info: taskContent[site].val,
                                    brand: row.brand
                                });
                            }else {
                                res.error(ERROR_CODE.NOT_EXISTS);
                                return callB(ERROR_CODE.NOT_EXISTS);
                            }
                        });
                        var user = req.agent.name + "(" + req.agent.account + ")";
                        var sql = "INSERT INTO t_crawler_task(task_id, task_name, task_type, create_time, create_user, status, update_time, task_rule)"
                            + " VALUES('" + lastId + "','" + taskContent[taskType].name + "', '" + taskContent[taskType].val + "','"
                            + moment().format("YYYY-MM-DD HH:mm:ss") + "','" + user + "', '" + taskContent[taskStatus].val + "',  '" + moment().format("YYYY-MM-DD HH:mm:ss")
                            + "', '" + JSON.stringify(taskRule) + "');";
                        MysqlCrawlerTask.query(sql, null, function (err) {
                            if (err) {
                                res.error(ERROR_CODE.CREATE_FAILED);
                                return callB(err);
                            }
                            return callB(null);
                        });
                    }else {
                        res.error(ERROR_CODE.NOT_ARRAY);
                        return callB(ERROR_CODE.NOT_ARRAY);
                    }
                }
            ],
            function (err) {
                if (err) {
                    debug(new Error(err));
                    return;
                }
                res.success(true);
            })
    },

    reviewContent: function (req, res, next) {
        var results = {content: []};
        var currentPage = req.query.currentPage || 1;
        if (typeof (currentPage) != "number") currentPage = Utils.toNumber(currentPage);
        var pageSize = req.query.pageSize || 10;
        if (typeof (pageSize) != "number") pageSize = Utils.toNumber(pageSize);
        var label = req.query.classify || "amws";
        label = label + "_reviews_service";
        var taskId = req.query.taskId;

        async.series([
                function (callB) {
                    results.task = [];
                    var sql = "SELECT DISTINCT(task_id) FROM " + label + " WHERE 1=1 ORDER BY task_id DESC";
                    MysqlAmazonData.query(sql, null, function (err, taskIDFound) {
                        if (err) {
                            // 出错了
                            callB(err);
                            res.error(ERROR_CODE.FIND_FAILED);
                            return;
                        }
                        taskIDFound.forEach (function (taskID) {
                            if (!taskId) taskId = taskID.task_id;
                            results.task.push(taskID.task_id);
                        });
                        callB(null);
                    })
                },

                function (callB) {
                    var reviewContent = [];
                    var sql = "SELECT task_id, asin, star, title, content " +
                        "FROM " + label + " WHERE 1=1";
                    if (taskId) sql += " AND task_id = '" + taskId + "'";
                    sql += (" LIMIT " + ((currentPage - 1) * pageSize) + "," + pageSize);
                    MysqlAmazonData.query(sql, null, function (err, contentListFound) {
                        if (err) {
                            // 出错了
                            callB(err);
                            res.error(ERROR_CODE.FIND_FAILED);
                            return;
                        }
                        contentListFound.forEach (function (contentFound) {
                            var review = {};
                            review.taskID = contentFound.task_id;
                            review.asin = contentFound.asin;
                            review.star = contentFound.star;
                            review.title = decodeUriComponent(contentFound.title);
                            review.content = decodeUriComponent(contentFound.content);

                            reviewContent.push(review);
                        });
                        results.content = reviewContent;
                        callB(null);
                    });
                },

                function (callB) {
                    var sql = "SELECT count(task_id) AS total FROM " + label + " WHERE 1=1";
                    if (taskId) sql += " AND task_id = '" + taskId + "'";
                    MysqlAmazonData.query(sql, null, function (err, countFound) {
                        if (err) {
                            // 出错了
                            callB(err);
                            res.error(ERROR_CODE.FIND_FAILED);
                            return;
                        }
                        results.pageTotal = countFound[0].total;
                        callB(null);
                    })
                }
            ],
            function (err) {
                if (err) {
                    debug(new Error(err));
                    return;
                }
                res.success(results);
            })
    },

    reviewTaskExcel: function (req, res, next) {
        var results = {content: []};
        var label = req.query.classify || "amws";
        label = label + "_reviews_service";
        async.series([
                function (callB) {
                    var reviewContent = [];
                    var sql = "SELECT task_id, asin, star, title, content " +
                        "FROM " + label + " WHERE 1=1";
                    if (req.query.taskId) sql += " AND task_id = '" + req.query.taskId + "'";
                    MysqlAmazonData.query(sql, null, function (err, contentListFound) {
                        if (err) {
                            // 出错了
                            callB(err);
                            res.error(ERROR_CODE.FIND_FAILED);
                            return;
                        }
                        contentListFound.forEach (function (contentFound) {
                            var review = {};
                            review["编号"] = contentFound.task_id;
                            review["Asin"] = contentFound.asin;
                            review["评论星级"] = contentFound.star;
                            review["评论标题"] = decodeUriComponent(contentFound.title);
                            review["评论内容"] = decodeUriComponent(contentFound.content);

                            reviewContent.push(review);
                        });
                        results.content = reviewContent;
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
            })
    },

    keywordExcel: function (req, res, next) {
        if (!req.query.keyword) return res.error(ERROR_CODE.MISSING_ARGUMENT);

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
            list: []
        };
        async.series([
                // 根据关键字查询,获取所有关键字
                function (callB) {
                    var sql = ("SELECT task_id, task_rule FROM t_crawler_task AS t_crawler_task WHERE task_rule LIKE '%\"keyword\":%'ORDER BY create_time DESC");
                    MysqlCrawlerTask.query(sql, null, function (err, paramentFounds) {
                        if (err) {
                            // 出错了
                            callB(err);
                            res.error(ERROR_CODE.FIND_FAILED);
                            return;
                        }
                        paramentFounds.forEach(function (paramentFound) {
                            var taskRule = JSON.parse(paramentFound.task_rule);
                            if (taskRule.keyword.toString() == req.query.keyword.toString()) {
                                where += (" AND task_id = '" + paramentFound.task_id + "'");
                            }
                        });
                        callB(null);
                    })
                },

                // 根据条件查询
                function (callB) {
                    var list = [];
                    var sql = "SELECT price, customer_review, title, small_type, score, is_ziying, is_fba, big_type_rank, " +
                        "big_type, url, asin, currency FROM keyword_goods AS keyword_goods ";
                    sql = sql + where;

                    MysqlAmazonData.query(sql, null, function (err, paramentFounds) {
                        if (err) {
                            // 出错了
                            callB(err);
                            res.error(ERROR_CODE.FIND_FAILED);
                            return;
                        }
                        paramentFounds.forEach(function (paramentFound) {
                            var smallType = paramentFound.small_type.substring(paramentFound.small_type.lastIndexOf(">") + 1, paramentFound.small_type.lastIndexOf(":") - 1);
                            var sqlResult = {};
                            sqlResult["ASIN"] = paramentFound.asin;
                            sqlResult["ASIN网址"] = paramentFound.url;
                            sqlResult["标题"] = paramentFound.title;
                            sqlResult["价格"] = paramentFound.price;
                            sqlResult["评论数"] = paramentFound.customer_review;
                            sqlResult["打分"] = paramentFound.score;
                            if (paramentFound.is_fba == 1) {
                                sqlResult["FBA"] = "是";
                            }else {
                                sqlResult["FBA"] = "否";
                            }
                            if (paramentFound.is_ziying == 1) {
                                sqlResult["自营"] = "是";
                            }else {
                                sqlResult["自营"] = "否";
                            }
                            sqlResult["大类名"] = paramentFound.big_type;
                            sqlResult["小类名"] = smallType;
                            sqlResult["大类排名"] = paramentFound.big_type_rank;
                            sqlResult[""] = paramentFound.currency;

                            list.push(sqlResult);
                        });
                        result.list = list;
                        callB(null)
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

    reviewSite: function (req, res, next) {
        var results = {
            site: []
        };
        async.series([
                function (callB) {
                    var sql = "SELECT code, name, type_code, status, val, create_time " +
                        "FROM t_sys_parament AS t_sys_parament WHERE type_code = 'SI'";
                    MysqlCrawlerTask.query(sql, null, function (err, paramentsFound) {
                        if (err) {
                            // 出错了
                            callB(err);
                            res.error(ERROR_CODE.FIND_FAILED);
                            return;
                        }
                        paramentsFound.forEach(function (paramentFound) {
                            var site = {};
                            site.name = paramentFound.name;
                            site.value = paramentFound.val;

                            results.site.push(site);
                        })
                        callB(null);
                    })
                }
            ],
            function (err) {
                if (err) {
                    return debug(new Error(err));
                }
                res.success(results);
            })

    }


};