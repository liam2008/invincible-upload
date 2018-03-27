'use strict';
/**
 * Module dependencies.
 */
var async = require('async');
var UUID = require('uuid');
var Promise = require('bluebird');
var Moment = require('moment');

/*
 * Server Dependencies
 */
var debug = require('debug')('smartdo:auth-server');
var app = require('../app');
var tokenUtils = require('../utils/token-utils');
var ServerError = require('../errors/server-error');

var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;
var Utils = Shared.Utils;
var CryptoJS = Shared.CryptoJS;

var DB = require('../models/invincible');
var User = DB.getModel('user');
var TeamManager = DB.getModel('team_manager');

/*
 * UModules Dependencies
 */

/**
 * Constructor.
 */
function AuthServer() {

}

// 认证
AuthServer.prototype.authenticate = function() {
    return function(req, res, next) {
        var token = null;
        
        if (req.headers && req.headers.authorization) {
            var parts = req.headers.authorization.split(' ');

            if (parts.length == 2) {
                var scheme = parts[0];
                var credentials = parts[1];

                if (/^Bearer$/i.test(scheme)) {
                    token = credentials;
                }
            }
        }
        if (token == null) {
            res.error(ERROR_CODE.UNAUTHORIZED_REQUEST);
            return;
        }

        tokenUtils.verifyToken(token, function(err, decoded) {
            if (err != null) {
                debug("verifyToken Error: %j", err);
                res.error(ERROR_CODE.INVALID_TOKEN);
                return;
            }

            User.findOne({_id: decoded.user.id})
                .populate('role')
                .populate('creator')
                .populate('team')
                .exec(function(err, record) {
                    if (record == null) {
                        res.error(ERROR_CODE.INVALID_TOKEN);
                        return;
                    }

                    var role = {};
                    var roleId = "";
                    if (record.role) {
                        role = record.role.toJSON();
                        roleId = role._id.toString();
                    }

                    var creator = "";
                    var creatorId = "";
                    if (record.creator) {
                        creator = record.creator.name;
                        creatorId = record.creator._id.toString();
                    }

                    var team = {};
                    var teamId = null;
                    if (record.team) {
                        team = record.team.toJSON();
                        teamId = team._id.toString();
                    }
                    var userId = record._id.toString();

                    var agent = {
                        id:         userId,
                        name:       record.name,
                        account:    record.account,
                        password:   record.password,
                        status:     record.status,
                        creator:    {
                            id:     creatorId,
                            name:   creator
                        },
                        role:       {
                            id:         roleId,
                            name:       role.name || "",
                            type:       role.type || "",
                            department: role.department || "",
                            routes:     role.routes || [],
                            management: role.management || []
                        },
                        team: {
                            id:     teamId,
                            name:   team.name || "",
                            leader: team.leader,
                            members:team.members || []
                        },
                        permissions:record.permissions || {},
                        history:    record.history || [],
                        createdAt:  record.createdAt,
                        updatedAt:  record.updatedAt
                    };

                    req.token = decoded;
                    req.agent = agent;
                    req.scope = record.scope;

                    TeamManager.findOne({user: userId}, function(e, r) {
                        if (e) {
                            res.error(ERROR_CODE.DB_ERROR);
                            return;
                        }

                        if (r) {
                            agent.teamManager = JSON.parse(JSON.stringify(r.teams));
                        }
                        next();
                    });
                });
        });
    };
};

AuthServer.prototype.authorize = function() {

};

// 登入
AuthServer.prototype.token = function() {
    return function(req, res, next) {
        var username = req.body.username;
        var password = req.body.password;
        
        if (username == null) {
            res.error(ERROR_CODE.MISSING_ARGUMENT);
            return;
        }

        // 用户名转小写
        username = username.toLowerCase();

        // 密码规范化
        password = Utils.checkMD5(password);
        if (password == null) {
            res.error(ERROR_CODE.MISSING_ARGUMENT);
            return;
        }

        User.findOne({account: username})
            .populate('role')
            .populate('creator')
            .populate('team')
            .exec(function(err, result) {
                if (result == null) {
                    //throw new ServerError(ERROR_CODE.NOT_EXISTS);
                    res.error(ERROR_CODE.USER_NOT_EXISTS);
                    return;
                }

                if (result.role == null) {
                    //throw new ServerError(ERROR_CODE.ROLE_NOT_EXISTS);
                    res.error(ERROR_CODE.ROLE_NOT_EXISTS);
                    return;
                }

                if (password != result.password) {
                    //throw new ServerError(ERROR_CODE.INVALID_PASSWORD);
                    res.error(ERROR_CODE.INVALID_PASSWORD);
                    return;
                }

                // 权限范围
                var scope = result.scope;
                var role = {};
                if (result.role) {
                    role = result.role.toJSON();
                }

                var user = {
                    id:             result._id,
                    name:           result.name,
                    account:        result.account
                };

                var needChangePassword = result.needChangePassword || false;

                Promise.promisify(tokenUtils.generateAccessToken)(user, scope, function(e, token) {
                    res.success({
                        token: token,
                        needChangePassword: needChangePassword
                    });

                    next();
                });
            });
    };
};
/**
 * Export constructor.
 */

module.exports = new AuthServer();
