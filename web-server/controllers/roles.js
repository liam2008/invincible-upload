/*
 * Base Dependencies
 */


/*
 * Server Dependencies
 */
var debug = require('debug')('smartdo:controller:roles');
var ServerError = require('../errors/server-error');
var uuid = require('uuid');
var Moment = require('moment');

var InvincibleDB = require('../models/invincible');
var User = InvincibleDB.getModel('user');
var Role = InvincibleDB.getModel('role');

var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;

/*
 * UModules Dependencies
 */

module.exports = {
    name: "roles",
    getSubordinate: function(type) {
        if (type == null) {
            return [];
        }

        var relation = {
            "admin":    ["assistant", "member", "manager", "director", "leader"],
            "manager":  ["assistant", "member", "director", "leader"],
            "director": ["member", "leader"],
            "leader":   ["member"]
        };

        return relation[type] || [];
    },

    // 获取当前用户可管理的所有角色信息
    list: function(req, res, next) {
        var agent = req.agent;
        var type = agent.role.type;
        var subordinate = Roles.getSubordinate(type);

        Role.find({type: {$in: subordinate}}, function(err, allRoles) {
            if (err) {
                debug(err);
                res.error(ERROR_CODE.DB_ERROR);
                return;
            }

            var result = [];
            allRoles.forEach(function(row) {
                result.push(row.toJSON());
            });

            res.success(result);
        });
    },

    // 获取单个角色信息 (使用id)
    get: function(req, res, next) {
        var id = req.params.id;

        Role.findOne({_id: id}, function(err, role) {
            if (err) {
                debug(err);
                res.error(ERROR_CODE.DB_ERROR);
                return;
            }

            res.success(role.toJSON());
        });
    },

    create: function(req, res, next) {
        res.success();
    },

    update: function(req, res, next) {
        var id = req.params.id;
        var updateInfo = req.body;

        Role.findOne({_id: id}, function(err, role) {
            if (err) {
                debug(err);
                res.error(ERROR_CODE.DB_ERROR);
                return;
            }

            if (role == null) {
                res.error(ERROR_CODE.NOT_EXISTS);
                return;
            }

            var time = Moment().format('YYYY-MM-DD HH:mm:ss');
            var name = updateInfo.name;
            var routes = updateInfo.routes;

            if (name == null && routes == null) {
                res.success(role.toJSON());
                return;
            }

            role.name = name || role.name;
            role.routes = routes || role.routes;
            role.updatedAt = time;

            role.save(function(saveErr, result) {
                if (saveErr) {
                    debug(saveErr);
                    res.error(ERROR_CODE.DB_ERROR);
                    return;
                }

                res.success(result.toJSON());
            });
        });
    },

    delete: function(req, res, next) {
        res.success();
    }
};

var Roles = module.exports;
