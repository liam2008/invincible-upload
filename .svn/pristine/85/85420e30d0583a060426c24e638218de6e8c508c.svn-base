
var fs = require('fs');
var path = require('path');
var async = require('async');
var DB = require('../models/invincible');
var User = DB.getModel('user');
var AbnormalAsins = DB.getModel('abnormal_asin');
var WorkOrder = DB.getModel('workOrder');
var Merchandise = DB.getModel('merchandise');
var OperativeCustomer = DB.getModel('operativeCustomer');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

var debug = require('debug')('smartdo:service:order');

var OrderManager = module.exports = {};

OrderManager.name = "OrderManager";

OrderManager.init = function(cb) {
    var self = this;
    
    async.series([
        function(callback) {
            self.load(callback);
        }
    ], function(err, results) {
        if (err != null) {
            debug("%s init error: ", self.name, err);
            return;
        }

        debug("%s inited...", self.name);
        process.nextTick(cb);
    });
};

OrderManager.start = function(cb) {
    debug("%s started...", this.name);
    process.nextTick(cb);
};

OrderManager.stop = function(cb) {
    debug("%s stopped...", this.name);
    process.nextTick(cb);
};

OrderManager.load = function(cb) {
    this.resetOrder(function(err) {
        cb && cb(err);
    });
};

OrderManager.resetOrder = function(cb) {
    AbnormalAsins.find({status: 0}, function(err, findResults) {
        if (err) {
            cb(err);
            return;
        }

        if (findResults.length <= 0) {
            cb(null);
            return;
        }

        var iterator = function(abnormalObj, callback) {
            var handler = "";
            var teamID = "";
            var type;
            var hasCustomer = false;
            var content;
            async.series([
                    // 设置处理人和报警内容
                    function (callB) {
                        content = "ASIN\t" + abnormalObj.ASIN + "\t站点\t" + abnormalObj.site;

                        if (abnormalObj.data) {
                            if (abnormalObj.data.type == 4) {
                                content += ("\t发现跟卖\r\n跟卖页面：" + abnormalObj.data.followURL + "\r\n跟卖卖家："
                                + abnormalObj.data.follower + "\r\n跟卖价格：" + abnormalObj.data.followPrice);

                                type = 2;
                            }else if (abnormalObj.data.type == 5) {
                                content += ("\tasin被篡改");

                                type = 7;
                            }else if (abnormalObj.data.type >= 6 && abnormalObj.data.type <= 9) {
                                if (abnormalObj.data.type == 6) {
                                    content += ("\t品牌被篡改\r\n被篡改成的品牌：" + abnormalObj.data.brand);
                                }
                                if (abnormalObj.data.type == 7) {
                                    content += ("\t标题被篡改\r\n被篡改成的标题：" + abnormalObj.data.title);
                                }
                                if (abnormalObj.data.type == 8) {
                                    content += ("\t简介被篡改\r\n被篡改成的简介：" + abnormalObj.data.introduction);
                                }
                                if (abnormalObj.data.type == 9) {
                                    content += ("\t描述被篡改\r\n被篡改成的描述：" + abnormalObj.data.description);
                                }

                                type = 8
                            }else if (abnormalObj.data.type >= 1 && abnormalObj.data.type <= 3) {
                                if (abnormalObj.data.type == 1) {
                                    content += ("\t1-3星的评价\r\n评论人：" + abnormalObj.data.reviewer + "\r\n评论时间："
                                    + abnormalObj.data.reviewTime + "\r\n评论分数：" + abnormalObj.data.score + "\r\n评论内容："
                                    + abnormalObj.data.detail);
                                }else if (abnormalObj.data.type == 2) {
                                    content += ("\t总评价低于4.3分\r\n评论分数：" + abnormalObj.data.score);
                                }else if (abnormalObj.data.type == 3) {
                                    content += ("\t评论数量变少\r\n上次评论数量：" + abnormalObj.data.lastCnt
                                    + "\r\n本次评论数量：" + abnormalObj.data.currCnt);
                                }else {
                                    callB("Unknow type in abnormalObj");
                                    return;
                                }

                                type = 1;
                            }
                        }
                        callB(null);
                    },

                    // 分配小组长或对应分配表
                    function (callB) {
                        var findRequire = {
                            asin: abnormalObj.ASIN
                        };
                        Merchandise.find(findRequire,function (err, merdListFound) {
                            if (err) {
                                callB(err);
                                return;
                            }
                            if (merdListFound.length == 1) {
                                if (abnormalObj.data.type <= 9 && abnormalObj.data.type >= 5 && abnormalObj.data.type != 6) {
                                    findRequire = {
                                        team: merdListFound[0].team_id,
                                        role: mongoose.Types.ObjectId("59fc32140ed72b7271f8d614")
                                    };
                                    User.findOne(findRequire, function (err, customerFound) {
                                        if (err) {
                                            callB(err);
                                            return;
                                        }
                                        if (customerFound) {
                                            teamID = merdListFound[0].team_id;
                                            handler = customerFound._id;
                                            hasCustomer = true;
                                        }
                                        callB(null);
                                    })
                                }else {
                                    findRequire = {
                                        operate_team: merdListFound[0].team_id,
                                        work_order_type: type
                                    };
                                    OperativeCustomer.findOne(findRequire, function (err, customerFound) {
                                        if (err) {
                                            callB(err);
                                            return;
                                        }
                                        if (customerFound) {
                                            teamID = merdListFound[0].team_id;
                                            handler = customerFound._id;
                                            hasCustomer = true;
                                        }
                                        callB(null);
                                    })
                                }
                            }else {
                                callB(null);
                            }
                        })
                    },

                    // 如果没有对应客服则分配给客服主管
                    function (callB) {
                        if (!hasCustomer) {
                            User.findOne({role: mongoose.Types.ObjectId("5a265adac4d23f1fcdb621f1")},function (err, userFound) {
                                if (err) {
                                    callB(err);
                                    return;
                                }
                                if (userFound) {
                                    handler = userFound._id;
                                    callB(null);
                                }else {
                                    callB("no handler");
                                }
                            })
                        }else {
                            callB(null);
                        }
                    },

                    // 转换到数据库
                    function(callB) {
                        var head = moment(abnormalObj.createdAt).format("YYYYMMDD");
                        var reg = new RegExp(head);
                        var findRequire = {
                            order_id: reg
                        };
                        WorkOrder.count(findRequire, function (err, maxNum) {
                            if (err) {
                                callB(err);
                                return
                            }
                            var orderID = (maxNum + 1).toString();
                            if (orderID.length < 4) orderID = orderID.padLeft(4, '0');
                            orderID = head + orderID;

                            var newOrder = new WorkOrder({
                                _id: mongoose.Types.ObjectId(),
                                order_id: orderID,                                                   // 工单编号
                                state: 0,                                                      // 状态(0：待处理， 1：已跟进， 2：已完结)
                                type: type,                                                       // 类型(1：评论异常， 2：发现跟单， 3：Lightning Deals， 4:销售权限， 5:品牌更改， 6:店铺IP问题， 0：其它)
                                content: content,                                                    // 工单内容
                                handler: handler,              // 当前处理人
                                history: [{
                                    to: handler
                                }],
                                createdAt: abnormalObj.createdAt,
                                updatedAt: abnormalObj.updatedAt
                            });
                            if (teamID) newOrder.team_id = teamID;
                            newOrder.save(function (err) {
                                if (err) {
                                    callB(err);
                                    return;
                                }
                                debug(abnormalObj);
                                callB(null);
                            })
                        })
                    },

                    function(callB) {
                        // 修改abnormalObj的status为1（已处理）
                        abnormalObj.status = 1;
                        abnormalObj.save(function(e) {
                            if (e) {
                                callB(e);
                                return;
                            }

                            callB(null);
                        });
                    }
                ],
                function (err) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    callback(null);
                }
            );
        };

        async.eachSeries(findResults, iterator, function (e) {
            if (e != null) {
                debug(e);
                cb(e);
                return;
            }
            cb(null);
        });
    });
};
