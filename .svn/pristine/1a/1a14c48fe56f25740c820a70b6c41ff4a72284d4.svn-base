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
var mongoose = require('mongoose');

var InvincibleDB = require('../models/invincible');
var User = InvincibleDB.getModel('user');
var Role = InvincibleDB.getModel('role');

var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;

var dataUtils = require('../utils/data-utils');

/*
 * UModules Dependencies
 */

module.exports = {
    name: "roles",
    department: function(req, res, next) {
        res.success(req.departments);
    },

    // 获取当前用户可管理的所有角色信息
    list: function(req, res, next) {
        var subordinate = req.subordinate;

        Role.find({_id: {$in: subordinate}}, function(err, allRoles) {
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
        var info = req.body;

        var type = info.type;
        var name = info.name;
        var routes = info.routes || [];
        var department = info.department || "";
        var management = info.management || [];

        if (type == null
            || name == null) {
            res.error(ERROR_CODE.INVALID_ARGUMENT);
            return;
        }

        Role.findOne({type: type}, function(err, role) {
            if (err) {
                debug(err);
                res.error(ERROR_CODE.DB_ERROR);
                return;
            }

            if (role != null) {
                res.error(ERROR_CODE.ROLE_ALREADY_EXISTS);
                return;
            }

            var time = Moment().format('YYYY-MM-DD HH:mm:ss');
            role = new Role({
                _id: new mongoose.Types.ObjectId()
            });

            role.name = name;
            role.type = type;
            role.routes = routes;
            role.management = management;
            role.department = department;
            role.createdAt = time;
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
            var department = updateInfo.department;
            var management = updateInfo.management;

            if (name == null
                && routes == null
                && management == null
                && department == null) {
                res.success(role.toJSON());
                return;
            }

            // 记录被修改的信息
            var changes = {};
            var isChange = false;

            if (name != null) {
                changes.name = {from: role.name, to: name};
                role.name = name;
                isChange = true;
            }
            if (routes != null && JSON.stringify(routes) != JSON.stringify( role.routes)) {
                changes.routes = {from: role.routes, to: routes};
                role.routes = routes;
                isChange = true;
            }
            if (management != null && JSON.stringify(management) != JSON.stringify( role.management)) {
                changes.management = {from: role.management, to: management};
                role.management = management;
                isChange = true;
            }
            if (department != null) {
                changes.department = {from: role.department, to: department};
                role.department = department;
                isChange = true;
            }

            // 没有修改
            if (isChange == false) {
                res.success(role.toJSON());
                return;
            }
            // 修改日志
            dataUtils.historyDeal(req, role, changes);
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
