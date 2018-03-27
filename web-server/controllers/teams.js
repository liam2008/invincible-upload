var app = require('../app');
var UUID = require('uuid');
var async = require('async');
var Moment = require('moment');
var mongoose = require('mongoose');
var InvincibleDB = require('../models/invincible');
var Merchandise = InvincibleDB.getModel('merchandise');
var Category = InvincibleDB.getModel('category');
var User = InvincibleDB.getModel('user');
var Role = InvincibleDB.getModel('role');
var Team = InvincibleDB.getModel('team');
var Config = InvincibleDB.getModel('config');
var debug = require('debug')('smartdo:controller:teams');

function resSend(err, result, res) {
	if(err) res.send({
		success: false,
		result: err
	})
	else res.send({
		success: true,
		result: result
	})
};

module.exports = {
	name: "team",
	// 小组选项
	teamOpt: function(req, res) {
		Team.find({}, {
			name: 1
		}, function(err, docs) {
			res.send(docs)
		})
	},
	// 小组列表
	teamList: function(req, res) {
		var assestManager = app.getService('AssetsManager');
		var teamsJson = {};
		var teamsArr = [];

		async.series({
			// 获取小组列表
			team: function(callback) {
				Team.find({}).populate({
					path: 'categories',
					select: 'name shortName'
				}).sort({
					createdAt: -1
				}).exec(function(err, docs) {
					docs.map(function(item) {
						teamsJson[item._id] = {
							leader: {},
							members: [],
							teamInfo: [],
							_id: item._id,
							uuid: item.uuid,
							name: item.name,
							categories: item.categories,
							createdAt: item.createdAt,
							updatedAt: item.updatedAt,
							avatar: item.uuid ? assestManager.getTeamUri(item.uuid, true) + '?' + Date.now() : ''
						}
					});
					callback(null)
				})
			},
			// 获取组员信息
			user: function(callback) {
				User.find({}, {
					team: 1,
					name: 1,
					level: 1,
					account: 1
				}).populate({
					path: 'role',
					select: 'name type'
				}).exec(function(err, docs) {
					var selectUser = [];
					docs.map(function(item) {
						if(item['role'] && (item['role']['type'] === 'leader' || item['role']['type'] === 'member')) {
							selectUser.push({
								_id: item._id,
								name: item.name,
								account: item.account,
								role: item['role']['name']
							});
							if(teamsJson[item.team]) {
								if(item['role']['type'] === 'leader') {
									teamsJson[item.team]['leader'] = {
										_id: item._id,
										name: item.name,
										account: item.account
									};
									teamsJson[item.team]['teamInfo'].unshift({
										_id: item._id,
										name: item.name,
										level: item.level,
										account: item.account,
										role: item['role']['name']
									})
								} else {
									teamsJson[item.team]['members'].push({
										_id: item._id,
										name: item.name,
										account: item.account
									});
									teamsJson[item.team]['teamInfo'].push({
										_id: item._id,
										name: item.name,
										level: item.level,
										account: item.account,
										role: item['role']['name']
									})
								}
							}
						}
					});
					callback(null, selectUser)
				})
			},
			// 获取运营级别选项
			level: function(callback) {
				Config.findOne({
					type: 'operationLevel'
				}, function(err, doc) {
					let level = [];
					for(let key in doc.rule) {
						level.push(key)
					};
					callback(null, level)
				})
			},
			// 获取品类选项
			category: function(callback) {
				Category.find({}, {
					name: 1,
					shortName: 1
				}).sort({
					name: 1
				}).exec(function(err, docs) {
					let list = [];
					docs.map(function(item) {
						list.push({
							_id: item._id,
							name: item.name + '(' + item.shortName + ')'
						})
					});
					callback(null, list)
				})
			}
		}, function(err, results) {
			for(var key in teamsJson) {
				teamsArr.push(teamsJson[key])
			};
			res.send({
				result: teamsArr,
				selectUser: results.user,
				selectLevel: results.level,
				categories: results.category
			})
		})
	},
	// 小组添加
	teamSave: function(req, res) {
		var assestManager = app.getService('AssetsManager');
		var name = req.body.name;
		var avatar = req.body.avatar;
		var categories = req.body.categories;
		var teamInfo = req.body.teamInfo || [];
		var uuid = UUID.v4();
		var teamId = null;

		async.series([
			// 小组信息保存
			function(callback) {
				var team = new Team({
					name: name,
					categories: categories,
					createdAt: Date.now(),
					updatedAt: Date.now()
				});
				if(avatar) {
					assestManager.putTeamFile({
						uuid: uuid,
						data: avatar
					}, function(err, result) {
						if(err) {
							res.send({
								success: false,
								result: err
							})
						};
						team.uuid = uuid;
						team.save(function(err) {
							teamId = team._id;
							callback(err)
						})
					})
				} else {
					team.save(function(err, doc) {
						teamId = team._id;
						callback(err, doc)
					})
				}
			},
			// 用户小组信息更新
			function(callback) {
				teamInfo.map(function(item) {
					User.update({
						_id: mongoose.Types.ObjectId(item._id)
					}, {
						team: teamId,
						level: item.level
					}, function(err) {
						if(err) callback(err)
					})
				});
				callback(null)
			},
			// 清空该小组成员原来的商品管理者
			function(callback) {
				teamInfo.map(function(item) {
					Merchandise.update({
						manager: mongoose.Types.ObjectId(item._id)
					}, {
						manager: null
					}, {
						multi: true
					}, function(err) {
						if(err) callback(err)
					})
				});
				callback(null)
			}
		], function(err, results) {
			resSend(err, results[0], res)
		})
	},
	// 小组更新
	teamUpdate: function(req, res) {
		var assestManager = app.getService('AssetsManager');
		var id = req.body.id;
		var name = req.body.name;
		var avatar = req.body.avatar;
		var categories = req.body.categories;
		var teamInfo = req.body.teamInfo || [];
		// 数据库中的组员信息
		var oldTeam = {};
		// 编辑框传回来的组员信息
		var newTeam = {};
		// 所有的队伍成员(包括oldTeam 和 newTeam)
		let fullTeam = [];

		// 处理 同步更新用户关联的小组和级别
		let iterator = function(userId, callback) {
			async.series([
				function(cb) {
					// 原小组有该成员则编辑，否则移出该小组
					if(oldTeam[userId]) {
						User.update({
							_id: mongoose.Types.ObjectId(userId)
						}, {
							team: newTeam[userId] ? id : null,
							level: newTeam[userId] ? newTeam[userId]['level'] : null
						}, function(err) {
							cb(err)
						})
					} else {
						cb(null)
					}
				},
				function(cb) {
					// 原小组有该成员，新小组没该成员，则取消商品管理员不是该小组的成员
					if(oldTeam[userId] && !newTeam[userId]) {
						Merchandise.update({
							team_id: mongoose.Types.ObjectId(id),
							manager: mongoose.Types.ObjectId(userId)
						}, {
							manager: null
						}, {
							multi: true
						}, function(err) {
							cb(err)
						})
					} else {
						cb(null)
					}
				},
				function(cb) {
					// 原小组没该成员，新小组有该成员，则添加成员
					if(!oldTeam[userId] && newTeam[userId]) {
						User.update({
							_id: mongoose.Types.ObjectId(userId)
						}, {
							team: id,
							level: newTeam[userId]['level']
						}, function(err) {
							cb(err)
						})
					} else {
						cb(null)
					}
				}
			], function(err, results) {
				callback(err);
			});
		};

		async.series([
			// 小组信息保存
			function(callback) {
				Team.findOne({
					_id: id
				}, function(err, team) {
					team.name = name;
					team.categories = categories;
					team.updatedAt = Date.now();
					if(avatar) {
						team.uuid = team.uuid || UUID.v4();
						assestManager.putTeamFile({
							data: avatar,
							uuid: team.uuid
						}, function(err) {
							team.save(function(err, doc) {
								callback(err, doc)
							})
						})
					} else {
						team.save(function(err, doc) {
							callback(err, doc)
						})
					}
				})
			},
			// 获取原用户为该组的成员
			function(callback) {
				User.find({
					team: id
				}, {
					team: 1,
					level: 1
				}, function(err, docs) {
					docs.map(function(item) {
						oldTeam[item._id] = {
							id: item._id,
							level: item.level
						};
						fullTeam.push(item._id.toString());
					});
					teamInfo.map(function(item) {
						newTeam[item._id] = {
							id: item._id,
							level: item.level
						};
						if(fullTeam.indexOf(item._id) == -1) {
							fullTeam.push(item._id.toString())
						}
					});
					callback(err)
				})
			},
			// 同步更新用户关联的小组和级别
			function(callback) {
				async.eachSeries(fullTeam, iterator, function(e) {
					if(e != null) {
						debug(e);
						callback(e);
						return;
					}
					callback(null);
				});
			}
		], function(err, results) {
			resSend(err, results[0], res)
		})
	},
	// 小组移除
	teamRemove: function(req, res) {
		var teamId = req.query.id;
		var userId = [];

		async.series([
			// 删除小组
			function(callback) {
				Team.remove({
					_id: teamId
				}, function(err, doc) {
					callback(err, doc)
				})
			},
			// 清空属于该小组的用户
			function(callback) {
				User.find({
					team: teamId
				}, ['name'], function(err, docs) {
					docs.map(function(item) {
						userId.push(item._id);
						User.update({
							_id: mongoose.Types.ObjectId(item._id)
						}, {
							team: null,
							level: null
						}, function(err) {
							if(err) callback(err)
						})
					});
					callback(null)
				})
			},
			// 清空属于商品管理者的用户
			function(callback) {
				userId.map(function(item) {
					Merchandise.update({
						manager: mongoose.Types.ObjectId(item)
					}, {
						team_id: null,
						manager: null
					}, {
						multi: true
					}, function(err) {
						if(err) callback(err)
					})
				});
				callback(null)
			}
		], function(err, results) {
			resSend(err, results[0], res)
		})
	}
};