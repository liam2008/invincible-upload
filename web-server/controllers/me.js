/*
 * Base Dependencies
 */


/*
 * Server Dependencies
 */
var debug = require('debug')('smartdo:controller:me');
var ServerError = require('../errors/server-error');
var uuid = require('uuid');
var Moment = require('moment');
var async = require('async');
var mongoose = require('mongoose');

var InvincibleDB = require('../models/invincible');
var User = InvincibleDB.getModel('user');
var Role = InvincibleDB.getModel('role');
var Team = InvincibleDB.getModel('team');

var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;
var Utils = Shared.Utils;

/*
 * UModules Dependencies
 */

module.exports = {
    name: "me",

    password: function(req, res, next) {
        var bodyInfo = req.body || {};
        var passwd = Utils.checkMD5(bodyInfo.password);
        var currPasswd = Utils.checkMD5(bodyInfo.curr_password);

        if (passwd == false || currPasswd == false) {
            res.error(ERROR_CODE.INVALID_ARGUMENT);
            return;
        }

        var agent = req.agent;

        // 判断是否有agent信息,没有的话就不返回列表了
        // agent == null 不是冗余代码 因为null的type是object 只判断类型会错判
        if (agent == null || typeof agent != "object") {
            res.success();
            return;
        }

        var userId = agent.id;
        if (userId == null) {
            res.error(ERROR_CODE.DB_ERROR);
            return;
        }

        User.findOne({_id: userId}, function(err, findUser) {
            if (err) {
                res.error(ERROR_CODE.DB_ERROR);
                return;
            }

            if (findUser == null) {
                res.error(ERROR_CODE.USER_NOT_EXISTS);
                return;
            }

            if (findUser.password != currPasswd) {
                res.error(ERROR_CODE.INVALID_PASSWORD);
                return;
            }

            var time = Moment().format("YYYY-MM-DD HH:mm:ss");

            findUser.password = passwd;
            findUser.needChangePassword = false;
            findUser.lastChangePassword = time;
            findUser.updatedAt = time;

            findUser.save(function(e, r) {
                if (e) {
                    res.error(ERROR_CODE.DB_ERROR);
                    return;
                }

                res.success();
            });
        });
    },

    update: function(req, res, next) {
        res.success();
    },

    delete: function(req, res, next) {
        res.success();
    }
};
