/*
 * Base Dependencies
 * 各系统页面内的过滤器
 */


/*
 * Server Dependencies
 */
var debug = require('debug')('smartdo:middleware:procedure');
var ServerError = require('../errors/server-error');
var uuid = require('uuid');
var Moment = require('moment');
var async = require('async');

var InvincibleDB = require('../models/invincible');
var User = InvincibleDB.getModel('user');
var Role = InvincibleDB.getModel('role');
var Team = InvincibleDB.getModel('team');

var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;

/*
 * UModules Dependencies
 */

module.exports = {
    // 不同的采购金额数决定流程步骤
    purchase_plan: function(req, res, next) {
        var purchasePlanConfig = [
            {
                intervalGotNew: [0, 100000],                    // 有新产品的订单 0 < 总额 <= 10万 的情况
                intervalNoNew: [0, 200000],                     // 无新产品的订单 0 < 总额 <= 20万 的情况
                applicantTypes: ["leader", "member"],           // 运营组长和运营专员可以创建
                handlerTypes: [                                 // 流程：类目主管 -> 运营经理 -> 
                    ["leader", "member"],
                    ["director"],
                    ["manager"],
                    ["purchaseDirector"]
                ],
                statuses: [100, 200, 210, 300]                       // 流程的状态： 200: 类目主管审核, 210: 运营经理审核, 300: 供应链主管审核
            },
            {
                intervalGotNew: [100000, 200000],                    // 有新产品的订单 10万 < 总额 <= 20万 的情况
                intervalNoNew: [200000, 300000],                     // 无新产品的订单 20万 < 总额 <= 30万 的情况
                applicantTypes: ["leader", "member"],           // 运营组长和运营专员可以创建
                handlerTypes: [                                 // 流程：类目主管 -> 运营经理 -> 运营总监 -> 供应链主管 -> 供应链总监
                    ["leader", "member"],
                    ["director"],
                    ["manager"],
                    ["COO"],
                    ["purchaseDirector"],
                    ["CFO","CMPO"]                              // 由于现在CFO兼任供应链总监 所以这里增加CFO也有该权限
                ],
                statuses: [100, 200, 210, 220, 300, 310]             // 流程的状态： 200: 类目主管审核, 210: 运营经理审核, 220: 运营总监审核, 300: 供应链主管审核, 310: 供应链总监
            },
            {
                intervalGotNew: [200000, 9999999999],           // 有新产品的订单 20万 < 总额 的情况  这里还是设置了一个上限，这个是1000亿，单个订单有那么多可能性不大
                intervalNoNew: [300000, 9999999999],            // 无新产品的订单 30万 < 总额 的情况
                applicantTypes: ["leader", "member"],           // 运营组长和运营专员可以创建
                handlerTypes: [                                 // 流程：类目主管 -> 运营经理 -> 运营总监 -> CEO -> 供应链主管 -> 供应链总监
                    ["leader", "member"],
                    ["director"],
                    ["manager"],
                    ["COO"],
                    ["CEO"],
                    ["purchaseDirector"],
                    ["CFO","CMPO"]                              // 由于现在CFO兼任供应链总监 所以这里增加CFO也有该权限
                ],
                statuses: [100, 200, 210, 220, 230, 300, 310]        // 流程的状态： 200: 类目主管审核, 210: 运营经理审核, 220: 运营总监审核, 230: CEO审核, 300: 供应链主管审核, 310: 供应链总监
            }
        ];

        req.purchasePlanConfig = purchasePlanConfig;
        next();
    }
};
