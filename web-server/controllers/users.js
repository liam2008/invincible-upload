/*
 * Base Dependencies
 */


/*
 * Server Dependencies
 */
var debug = require('debug')('smartdo:controller:users');
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

var dataUtils = require('../utils/data-utils');

/*
 * UModules Dependencies
 */

module.exports = {
    name: "users",

    // 获取当前用户可管理的所有用户信息
    list: function(req, res, next) {
        var subordinate = req.subordinate;
        var findCondition = {role: {$in: subordinate}};
        var agent = req.agent;

        // 判断是否有agent信息,没有的话就不返回列表了
        // agent == null 不是冗余代码 因为null的type是object 只判断类型会错判
        if (agent == null || typeof agent != "object") {
            res.success();
            return;
        }

        var roleType = agent.role.type;
        switch (roleType) {
            // 组长 可管理自己组里的组员
            case "leader": {
                findCondition.team = {$in: [agent.team.id, null]};
                break;
            }
        }

        if (findCondition == null) {
            res.success();
            return;
        }

        User.find(findCondition)
            .populate('role')
            .populate('creator')
            .populate('team')
            .exec(function(err, userResults) {
                if (err) {
                    debug(err);
                    res.error(ERROR_CODE.DB_ERROR);
                    return;
                }

                var result = [];
                userResults.forEach(function(row) {
                    var userInfo = row.toJSON();
                    delete userInfo.password;
                    delete userInfo.permissions;
                    delete userInfo.history;
                    delete userInfo.role.history;
                    delete userInfo.creator;

                    userInfo.creator = {
                        id:         row.creator._id,
                        account:    row.creator.account,
                        name:       row.creator.name
                    };

                    result.push(userInfo);
                });

                res.success(result);
            });
    },

    get: function(req, res, next) {
        res.success();
    },

    create: function(req, res, next) {
        var bodyParam = req.body;
        if (bodyParam == null) {
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

        var account = bodyParam.account;
        var name = bodyParam.name;
        var password = bodyParam.password;
        var role = bodyParam.role;
        var team = bodyParam.team || null;
        var roleType = null;

        if (account == null
            || name == null
            || password == null
            || role == null) {
            res.error(ERROR_CODE.INVALID_ARGUMENT);
            return;
        }

        // 用户名转小写
        account = account.toLowerCase();

        // 密码规范化
        password = Utils.checkMD5(password);
        if (password == false) {
            res.error(ERROR_CODE.INVALID_ARGUMENT);
            return;
        }

        async.series([
                // 是否已有这个用户
                function (callB) {
                    User.findOne({account: account}, function(err, findUser) {
                        if (err) {
                            callB(ERROR_CODE.DB_ERROR);
                            return;
                        }

                        if (findUser != null) {
                            callB(ERROR_CODE.USER_ALREADY_EXISTS);
                            return;
                        }

                        callB(null);
                    });
                },
                // 角色是否存在 顺便将角色类型拿出来
                function (callB) {
                    Role.findOne({_id: role}, function(err, findRole) {
                        if (err) {
                            callB(ERROR_CODE.DB_ERROR);
                            return;
                        }

                        // 角色不存在
                        if (findRole == null) {
                            callB(ERROR_CODE.ROLE_NOT_EXISTS);
                            return;
                        }

                        roleType = findRole.type;

                        callB(null);
                    });
                },
                // 如果有team 检查是否存在
                function (callB) {
                    // 没填team
                    if (team == null) {
                        callB(null);
                        return;
                    }

                    // 不是组员 不是组长
                    if (roleType != "leader" && roleType != "member") {
                        team = null;
                        callB(null);
                        return;
                    }

                    Team.findOne({_id: team}, function(err, findTeam) {
                        if (err) {
                            callB(ERROR_CODE.DB_ERROR);
                            return;
                        }

                        // 小组不存在
                        if (findTeam == null) {
                            callB(ERROR_CODE.TEAM_NOT_EXISTS);
                            return;
                        }

                        callB(null);
                    });
                },
                // 如果有team 检查是否有人做这个组的组长
                function (callB) {
                    // 没填team
                    if (team == null) {
                        callB(null);
                        return;
                    }

                    // 不是组长
                    if (roleType != "leader") {
                        callB(null);
                        return;
                    }

                    User.findOne({team: team, role: role}, function(err, findUser) {
                        if (err) {
                            callB(ERROR_CODE.DB_ERROR);
                            return;
                        }

                        if (findUser != null) {
                            callB(ERROR_CODE.LEADER_ALREADY_EXISTS);
                            return;
                        }

                        callB(null);
                    });
                },
                // 正式存储
                function (callB) {
                    var time = Moment().format("YYYY-MM-DD HH:mm:ss");

                    var userObj = new User({
                        _id: new mongoose.Types.ObjectId(),
                        name: name,
                        account: account,
                        password: password,
                        status: 1,
                        creator: agent.id,
                        role: role,
                        team: team,
                        permissions: {},
                        history: [],
                        createdAt: time,
                        updatedAt: time
                    });

                    userObj.save(function(e, r) {
                        if (e) {
                            callB(ERROR_CODE.DB_ERROR);
                            return;
                        }

                        callB(null);
                    });
                }
            ],
            function (err) {
                if (err) {
                    res.error(err);
                    return;
                }

                res.success();
            }
        );
    },

    update: function(req, res, next) {
        var id = req.params.id;

        var bodyParam = req.body;
        if (bodyParam == null) {
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

        var account = bodyParam.account || null;
        var name = bodyParam.name || null;
        var password = bodyParam.password || null;
        var role = bodyParam.role || null;
        var team = bodyParam.team || null;
        var roleType = null;            // 如果换角色则为更换后角色的类型 如果不换则为原角色类型
        var currRoleInfo = null;
        var currTeamInfo = null;
        var afterRole = null;

        if (account == null) {
            res.error(ERROR_CODE.INVALID_ARGUMENT);
            return;
        }

        // 所有都没改的时候，没意义哦
        if (name == null
            && password == null
            && role == null) {
            res.error(ERROR_CODE.INVALID_ARGUMENT);
            return;
        }

        if (password) {
            password = Utils.checkMD5(password);
            if (password == false) {
                res.error(ERROR_CODE.INVALID_ARGUMENT);
                return;
            }
        }

        async.series([
                // 用户的验证
                function (callB) {
                    User.findOne({_id: id})
                        .populate('role')
                        .populate('team')
                        .exec(function(err, findUser) {
                            if (err) {
                                callB(ERROR_CODE.DB_ERROR);
                                return;
                            }

                            // 不能用id找到这个用户
                            if (findUser == null) {
                                callB(ERROR_CODE.USER_NOT_EXISTS);
                                return;
                            }

                            // 发过来的account验证不通过
                            if (account != findUser.account) {
                                callB(ERROR_CODE.USER_NOT_EXISTS);
                                return;
                            }

                            // 把当前的角色信息拿出来
                            currRoleInfo = findUser.role;
                            roleType = currRoleInfo.type;
                            afterRole = currRoleInfo._id;

                            // 当前的小组信息
                            currTeamInfo = findUser.team;

                            callB(null);
                        });
                },
                // 如果更换角色的处理
                function (callB) {
                    // 没有角色信息或者与当前角色相同 则不需处理角色
                    if (role == null || role == currRoleInfo._id) {
                        role = null;
                        callB(null);
                        return;
                    }

                    // 有更换角色
                    Role.findOne({_id: role}, function(err, findRole) {
                        if (err) {
                            callB(ERROR_CODE.DB_ERROR);
                            return;
                        }

                        // 角色不存在
                        if (findRole == null) {
                            callB(ERROR_CODE.ROLE_NOT_EXISTS);
                            return;
                        }

                        afterRole = role;
                        roleType = findRole.type;

                        callB(null);
                    });
                },
                // 如果有team 检查是否存在
                function (callB) {
                    // 没填team
                    if (team == null) {
                        callB(null);
                        return;
                    }

                    // 不是组员 不是组长 或者
                    if (roleType != "leader" && roleType != "member") {
                        team = null;
                        callB(null);
                        return;
                    }

                    Team.findOne({_id: team}, function(err, findTeam) {
                        if (err) {
                            callB(ERROR_CODE.DB_ERROR);
                            return;
                        }

                        // 小组不存在
                        if (findTeam == null) {
                            callB(ERROR_CODE.TEAM_NOT_EXISTS);
                            return;
                        }

                        callB(null);
                    });
                },
                // 如果有team 检查是否有人做这个组的组长
                function (callB) {
                    // 没填team
                    if (team == null) {
                        callB(null);
                        return;
                    }

                    if (afterRole != 'leader') {
                        callB(null);
                        return;
                    }

                    User.findOne({team: team, role: afterRole}, function(err, findUser) {
                        if (err) {
                            callB(ERROR_CODE.DB_ERROR);
                            return;
                        }

                        if (findUser != null) {
                            callB(ERROR_CODE.LEADER_ALREADY_EXISTS);
                            return;
                        }

                        callB(null);
                    });
                },
                // 正式存储
                function (callB) {
                    User.findOne({_id: id}, function(err, findUser) {
                        if (err) {
                            callB(ERROR_CODE.DB_ERROR);
                            return;
                        }

                        if (findUser == null) {
                            callB(ERROR_CODE.USER_NOT_EXISTS);
                            return;
                        }


                        var time = Moment().format("YYYY-MM-DD HH:mm:ss");
                        var isRenew = false;
                        var changes = {};

                        if (password && password != findUser.password) {
                            isRenew = true;
                            changes.password = {from: findUser.password, to: password};
                            findUser.password = password;
                        }
                        if (name && name != findUser.name) {
                            isRenew = true;
                            changes.name = {from: findUser.name, to: name};
                            findUser.name = name;
                        }
                        if (afterRole && afterRole.toString() != findUser.role.toString()) {
                            isRenew = true;
                            changes.role = {from: findUser.role, to: afterRole};
                            findUser.role = afterRole;
                            if (roleType != "leader" && roleType != "member" && findUser.team != null) {
                                changes.team = {from: findUser.team, to: null};
                                findUser.team = null;
                            }
                        }
                        if (team) {
                            isRenew = true;
                            changes.team = {from: findUser.team, to: team};
                            findUser.team = team;
                        }

                        // 修改日志
                        dataUtils.historyDeal(req, findUser, changes);
                        findUser.updatedAt = time;

                        if (isRenew == false) {
                            callB(null);
                            return;
                        }

                        findUser.save(function(e, r) {
                            if (e) {
                                callB(ERROR_CODE.DB_ERROR);
                                return;
                            }

                            callB(null);
                        });
                    });
                }
            ],
            function (err) {
                if (err) {
                    res.error(err);
                    return;
                }

                res.success();
            }
        );
    },

    delete: function(req, res, next) {
        res.success();
    }
};
