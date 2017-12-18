/*
 * Base Dependencies
 * 各系统页面内的过滤器
 */


/*
 * Server Dependencies
 */
var debug = require('debug')('smartdo:middleware:sub-filter');
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
    //
    merchandise_edit: function(req, res, next) {
        var agent = req.agent;
        var role = agent.role;
        var team = agent.team || {};
        var result = {};

        switch (role.type) {
            // 组长 编辑本组
            case "leader": {
                result.view = team.id || null;
                result.edit = true;
                result.add = true;
                result.delete = false;
                break;
            }
            // 组员 浏览本组
            case "member": {
                result.view = team.id || null;
                result.edit = false;
                result.add = false;
                result.delete = false;
                break;
            }
            // 主管和经理助理 编辑所有
            case "director":
            case "assistant": {
                result.view = "*";
                result.edit = true;
                result.add = true;
                result.delete = false;
                break;
            }
            // 运营经理和运营总监 编辑所有及删除功能
            case "manager":
            case "COO": {
                result.view = "*";
                result.edit = true;
                result.add = true;
                result.delete = true;
                break;
            }
            // 其他所有总监 浏览所有
            case "CEO":
            case "CFO":
            case "CMPO":
            case "CTO":
            case "LD": {
                result.view = "*";
                result.edit = false;
                result.add = false;
                result.delete = false;
                break;
            }
            // 管理员 所有权限
            case "admin": {
                result.view = "*";
                result.edit = false;
                result.add = false;
                result.delete = false;
                break;
            }
            default : {
                result.view = null;
                result.edit = false;
                result.add = false;
                result.delete = false;
            }
        }

        req.subfilterMerchandiseEdit = result;
        next();
    },

    dailyInfo: function(req, res, next) {
        var agent = req.agent;
        var role = agent.role;
        var team = agent.team || {};
        var result = {};

        switch (role.type) {
            // 组长 编辑本组
            case "leader": {
                result.view = team.id || null;
                result.edit = true;
                result.add = true;
                result.delete = false;
                break;
            }
            // 组员 浏览本组
            case "member": {
                result.view = team.id || null;
                result.edit = false;
                result.add = false;
                result.delete = false;
                break;
            }
            // 主管和经理助理 编辑所有
            case "director":
            case "assistant": {
                result.view = "*";
                result.edit = true;
                result.add = true;
                result.delete = false;
                break;
            }
            // 运营经理和运营总监 编辑所有及删除功能
            case "manager":
            case "COO": {
                result.view = "*";
                result.edit = true;
                result.add = true;
                result.delete = true;
                break;
            }
            // 其他所有总监 浏览所有
            case "CEO":
            case "CFO":
            case "CMPO":
            case "CTO":
            case "LD": {
                result.view = "*";
                result.edit = false;
                result.add = false;
                result.delete = false;
                break;
            }
            // 管理员 所有权限
            case "admin": {
                result.view = "*";
                result.edit = false;
                result.add = false;
                result.delete = false;
                break;
            }
            default : {
                result.view = null;
                result.edit = false;
                result.add = false;
                result.delete = false;
            }
        }

        req.subfilterDailyInfo = result;
        next();
    },

    teamProfit: function(req, res, next) {
        var agent = req.agent;
        var role = agent.role;
        var team = agent.team || {};
        var result = {};

        switch (role.type) {
            // 组长 编辑本组
            case "leader": {
                result.view = team.id || null;
                break;
            }
            // 组员 浏览本组
            case "member": {
                result.view = team.id || null;
                break;
            }
            // 主管和经理助理 编辑所有
            case "director":
            case "assistant": {
                result.view = "*";
                break;
            }
            // 运营经理和运营总监 编辑所有及删除功能
            case "manager":
            case "COO": {
                result.view = "*";
                break;
            }
            // 其他所有总监 浏览所有
            case "CEO":
            case "CFO":
            case "CMPO":
            case "CTO":
            case "LD": {
                result.view = "*";
                break;
            }
            // 管理员 所有权限
            case "admin": {
                result.view = "*";
                break;
            }
            default : {
                result.view = null;
            }
        }

        req.subfilterTeamProfit = result;
        next();
    },

    skuProfit: function(req, res, next) {
        var agent = req.agent;
        var role = agent.role;
        var team = agent.team || {};
        var result = {};

        switch (role.type) {
            // 组长 编辑本组
            case "leader": {
                result.view = team.id || null;
                break;
            }
            // 组员 浏览本组
            case "member": {
                result.view = team.id || null;
                break;
            }
            // 主管和经理助理 编辑所有
            case "director":
            case "assistant": {
                result.view = "*";
                break;
            }
            // 运营经理和运营总监 编辑所有及删除功能
            case "manager":
            case "COO": {
                result.view = "*";
                break;
            }
            // 其他所有总监 浏览所有
            case "CEO":
            case "CFO":
            case "CMPO":
            case "CTO":
            case "LD": {
                result.view = "*";
                break;
            }
            // 管理员 所有权限
            case "admin": {
                result.view = "*";
                break;
            }
            default : {
                result.view = null;
            }
        }

        req.subfilterSkuProfit = result;
        next();
    },

    // 调用前需先引用helper.team_list中间件
    purchase_plan: function(req, res, next) {
        var agent = req.agent;
        var role = agent.role;
        var team = agent.team || {};
        var teams = req.teams || {};                // 小组信息列表 [{_id: xx, name: xx, leader: {_id: leaderId, account: leaderAccount, name: leaderName}, members: [{_id: memberId, account: memberAccount, name: memberName}]}]
        var result = {};

        switch (role.type) {
            // 组长 可新增 浏览小组所有订单 可编辑100,101状态
            case "leader": {
                result.add = true;                             //可添加
                result.view = {};
                result.view.applicant = [ agent.id ];           //自己的id
                var teamInfo = teams[team.id] || {};
                var members = teamInfo || [];
                members.forEach(function(row) {
                    if (row._id) {
                        result.view.applicant.push(row._id);    //组员的id
                    }
                });
                result.view.status = "*";                       //订单状态
                result.edit = {status: [100,101]};              //哪些状态的订单可以处理
                break;
            }
            // 组员 可新增 浏览自己所有订单 可编辑100,101状态
            case "member": {
                result.add = true;                             //可添加
                result.view = {};
                result.view.applicant = [ agent.id ];           //自己的id
                result.view.status = "*";                       //订单状态
                result.edit = {status: [100,101]};              //哪些状态的订单可以处理
                break;
            }
            // 类目主管 todo
            case "director": {
                result.add = true;                             //可添加
                result.view = {};
                result.view.applicant = [ agent.id ];           //自己的id
                result.view.status = "*";                       //订单状态
                result.edit = {status: [100,101]};              //哪些状态的订单可以处理
                break;
            }
            // 运营经理 不可新增 浏览除100,101之外其他状态的订单 200状态+总额限制可编辑
            case "manager": {
                result.add = false;                            //不可添加
                result.view = {};
                result.view.status = [200,210,220,230,300,310,400]; //可视状态列表
                result.edit = {status: [210]};                  //哪些状态的订单可以处理
                break;
            }
            // 运营总监
            case "COO": {
                result.view = "*";
                break;
            }
            // 首席执行官（CEO）
            case "CEO": {
                result.view = "*";
                break;
            }
            // 供应链主管
            case "purchaseDirector": {
                result.view = "*";
                break;
            }
            // 供应链总监（由于目前财务总监兼任，这里加上CFO） 浏览所有
            case "CFO":
            case "CMPO": {
                result.view = "*";
                break;
            }
            // 管理员 所有权限
            case "admin": {
                result.view = "*";
                break;
            }
            default : {
                result.view = null;
            }
        }

        req.subfilterPurchasePlan = result;
        next();
    }
};
