/*
 * Base Dependencies
 */


/*
 * Server Dependencies
 */
var debug = require('debug')('smartdo:controller:teams');
var ServerError = require('../errors/server-error');
var uuid = require('uuid');
var Moment = require('moment');
var mongoose = require('mongoose');

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
    name: "teams",

    // 获取所有小组信息
    list: function(req, res, next) {
        res.success(req.teams);
    },

    //
    get: function(req, res, next) {
        res.success();
    },

    // 注册小组
    create: function(req, res, next) {
        var bodyInfo = req.body || {};
        var name = bodyInfo.name;

        if (name == null) {
            res.error(ERROR_CODE.INVALID_ARGUMENT);
            return;
        }

        Team.findOne({name: name}, function(err, findTeam) {
            if (err) {
                res.error(ERROR_CODE.DB_ERROR);
                return;
            }

            if (findTeam != null) {
                res.error(ERROR_CODE.TEAM_NAME_DUPLICATE);
                return;
            }

            var time = Moment().format("YYYY-MM-DD HH:mm:ss");

            var teamObj = new Team({
                _id: new mongoose.Types.ObjectId(),
                name: name,
                history: [],
                createdAt: time,
                updatedAt: time
            });

            teamObj.save(function(e, r) {
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
