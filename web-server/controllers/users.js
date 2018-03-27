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
var teamManager = InvincibleDB.getModel('team_manager');
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
		var findCondition = {
			role: {
				$in: subordinate
			}
		};
		var agent = req.agent;

		// 判断是否有agent信息,没有的话就不返回列表了
		// agent == null 不是冗余代码 因为null的type是object 只判断类型会错判
		if(agent == null || typeof agent != "object") {
			res.success();
			return;
		}

		var roleType = agent.role.type;
		switch(roleType) {
			// 组长 可管理自己组里的组员
			case "leader":
				{
					findCondition.team = {
						$in: [agent.team.id, null]
					};
					break;
				}
		}

		if(findCondition == null) {
			res.success();
			return;
		}

		async.series({
			users: function(callback) {
				User.find(findCondition)
					.populate('role')
					.populate('creator')
					.populate('team')
					.sort({
						name: 1
					}).exec(function(err, docs) {
						callback(null, docs)
					})
			},
			teams: function(callback) {
				teamManager.find({})
					.populate({
						path: 'teams',
						select: 'name',
						populate: [{
							path: 'team'
						}]
					}).exec(function(err, docs) {
						callback(null, docs)
					})
			}
		}, function(err, result) {
			var list = [];
			result.users.map(function(item) {
				var team = null;
				if(item.team) {
					team = {
						_id: item.team._id,
						name: item.team.name
					}
				};
				for(var i = 0; i < result.teams.length; i++) {
					if(result.teams[i]['user'].toString() == item['_id'].toString()) {
						team = result.teams[i]['teams']
					}
				};
				list.push({
					_id: item._id,
					name: item.name,
					name_en: item.name_en,
					account: item.account,
					role: {
						_id: item.role._id,
						name: item.role.name,
                        department: item.role.department,
						type: item.role.type
					},
					team: team,
					creator: {
						id: item.creator._id,
						name: item.creator.name,
						account: item.creator.account
					},
					createdAt: item.createdAt,
					updatedAt: item.updatedAt
				})
			});
			res.send(list)
		});
	},

	get: function(req, res, next) {
		res.success();
	},

	// 用户添加
	create: function(req, res, next) {
		var role = req.body.role || '';
		var team = req.body.team || '';
		var name = req.body.name || '';
		var name_en = req.body.name_en || '';
		var account = req.body.account.toLowerCase() || '';
		var password = req.body.password ? Utils.checkMD5(req.body.password) : '';

		async.series({
			account: function(callback) {
				User.findOne({
					account: account
				}, function(err, doc) {
					if(doc) res.error(ERROR_CODE.USER_ALREADY_EXISTS);
					callback(null)
				})
			},
			roleType: function(callback) {
				Role.findOne({
					_id: role
				}, function(err, doc) {
					if(!doc) res.error(ERROR_CODE.LEADER_ALREADY_EXISTS);
					callback(null, doc.type)
				})
			}
		}, function(err, result) {
			var user = new User({
				_id: new mongoose.Types.ObjectId(),
				name: name,
				name_en: name_en,
				account: account,
				password: password,
				creator: req.agent.id,
				role: role,
				status: 1,
				history: [],
				permissions: {},
				needChangePassword: true,
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
			if(result.roleType === 'leader' || result.roleType === 'member') {
				if(team) user.team = team
			};
			if(result.roleType === 'director') {
				new teamManager({
					teams: team,
					user: user._id,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt
				}).save(function(err, doc) {
					if(err) res.error(err)
				})
			};
			user.save(function(err, doc) {
				if(err) res.error(err);
				res.success(doc)
			})
		})
	},

	// 用户编辑
	update: function(req, res, next) {
		var id = req.params.id;
		var role = req.body.role || '';
		var team = req.body.team || '';
		var name = req.body.name || '';
		var name_en = req.body.name_en || '';
		var password = req.body.password ? Utils.checkMD5(req.body.password) : '';

		async.series({
			roleType: function(callback) {
				Role.findOne({
					_id: role
				}, function(err, doc) {
					if(!doc) res.error(ERROR_CODE.LEADER_ALREADY_EXISTS);
					callback(null, doc.type)
				})
			}
		}, function(err, result) {
			User.findOne({
				_id: id
			}, function(err, user) {
				var changes = {};
				if(!user) res.error(ERROR_CODE.USER_NOT_EXISTS);
				// 修改记录
				if(user.name != name && name) {
					changes.name = {
						to: name,
						form: user.name
					};
					user.name = name
				};
				if(user.name_en != name_en) {
					changes.name_en = {
						to: name_en,
						form: user.name_en
					};
					user.name_en = name_en
				};
				if(user.password != password && password) {
					changes.password = {
						to: password,
						form: user.password
					};
					user.password = password
				};
				if(user.role != role && role) {
					changes.role = {
						to: role,
						form: user.role
					};
					user.role = role
				};
				if(user.team != team && team) {
					if(['leader', 'member', 'director'].indexOf(result.roleType) != -1) {
						changes.team = {
							to: team,
							form: user.team
						}
					};
					if(result.roleType === 'leader' || result.roleType === 'member') {
						if(team) user.team = team;
						teamManager.remove({
							user: user._id
						}, function(err) {
							if(err) res.error(err)
						})
					} else if(result.roleType === 'director') {
						user.team = null;
						teamManager.findOne({
							user: user._id
						}, function(err, doc) {
							if(doc) {
								doc.teams = team;
								doc.updatedAt = Date.now();
								doc.save(function(err) {
									if(err) res.error(err)
								})
							} else {
								new teamManager({
									teams: team,
									user: user._id,
									createdAt: Date.now(),
									updatedAt: Date.now()
								}).save(function(err) {
									if(err) res.error(err)
								})
							}
						})
					}
				} else {
					teamManager.remove({
						user: user._id
					}, function(err) {
						if(err) res.error(err)
					});
					user.team = null
				};
				user.updatedAt = Date.now();
				dataUtils.historyDeal(req, user, changes);
				user.save(function(err, doc) {
					if(err) res.error(err);
					res.success(doc)
				})
			})
		})
	},

	delete: function(req, res, next) {
		res.success();
	}
};