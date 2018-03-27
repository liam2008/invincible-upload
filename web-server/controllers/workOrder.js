var debug = require('debug')('smartdo:controller:workOrder');
var ServerError = require('../errors/server-error');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var async = require('async');
var moment = require('moment');
var MysqlADC = require('../databases/db.mysql.ADC');
var InvincibleDB = require('../models/invincible');
var OperativeCustomer = InvincibleDB.getModel('operativeCustomer');
var WorkOrder = InvincibleDB.getModel('workOrder');
var User = InvincibleDB.getModel('user');
var Shop = InvincibleDB.getModel('shops');
var DailySell = InvincibleDB.getModel('daily_sell');
var Merchandise = InvincibleDB.getModel('merchandise');
var StoresJournals = InvincibleDB.getModel('StoresJournals');
var PadLeft = require('padleft');
var Team = InvincibleDB.getModel('team');

var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;
var Utils = Shared.Utils;
var dealErr = require('../errors/controller-error');

module.exports = {
	name: "workOrder",

	customerList: function(req, res, next) {
		var findCondition = null;
		var subFilter = req.subfilterOperativeCustomer || {};
		if(subFilter.view == "*") {
			findCondition = {};
		} else if(subFilter.view != null) {
			findCondition = {
				customer_id: subFilter.view
			};
		} else {
			res.error(ERROR_CODE.ACCESS_DENIED);
			return;
		}

		if(req.query.teamID) findCondition.operate_team = mongoose.Types.ObjectId(req.query.teamID);
		if(req.query.orderType) {
			if(typeof(req.query.orderType) == "number") {
				findCondition.work_order_type = req.query.orderType;
			} else {
				findCondition.work_order_type = Utils.toNumber(req.query.orderType);
			}
		}

		var results = {};
		async.series([
				// 运营客服
				function(callB) {
					OperativeCustomer.find(findCondition)
						.sort({
							operateTeam: 1
						})
						.populate("customer_id")
						.populate("operate_team")
						.exec(function(err, customerFounds) {
							if(dealErr.findErr(err, res)) return callB(err);
							var list = [];
							customerFounds.forEach(function(customerFound) {
								var result = {};
								result.WOCustomerID = customerFound._id;
								if(customerFound.operate_team) {
									result.operateTeam = {
										id: customerFound.operate_team.id,
										name: customerFound.operate_team.name
									};
								} else {
									result.operateTeam = "全部";
								}
								result.WOType = customerFound.work_order_type;
								if(customerFound.customer_id) result.customer = {
									id: customerFound.customer_id._id,
									name: customerFound.customer_id.name
								};
								list.push(result);
							});
							results.list = list;
							callB(null);
						})
				},

				function(callB) {
					var team = [];
					Team.find({}, ["name"])
						.sort({
							name: 1
						})
						.exec(function(err, teamListFound) {
							if(dealErr.findErr(err, res)) return callB(err);
							teamListFound.forEach(function(teamFound) {
								team.push({
									id: teamFound._id,
									name: teamFound.name
								});
							});
							results.team = team;
							callB(null)
						})
				},

				function(callB) {
					var customers = [];
					User.find({
							role: mongoose.Types.ObjectId("5a264d69c4d23f1fcdb62191")
						})
						.populate("customer_id")
						.exec(function(err, customerFounds) {
							if(dealErr.findErr(err, res)) return callB(err);
							customerFounds.forEach(function(customerFound) {
								var customer = {
									id: customerFound._id,
									name: customerFound.name
								};
								customers.push(customer);
							});
							results.customers = customers;
							callB(null);
						})
				}
			],
			function(err) {
				if(err) {
					debug(new Error(err));
					return;
				}
				res.success(results);
			}
		)
	},

	saveCustomer: function(req, res, next) {
		var subFilter = req.subfilterOperativeCustomer || {};
		if(!subFilter.add) {
			res.error(ERROR_CODE.ACCESS_DENIED);
			return;
		}

		if(!req.body.customerID) return res.error(ERROR_CODE.MISSING_ARGUMENT);
		if(req.body.WOType) {
			if(typeof(req.body.WOType) != "number") {
				req.body.WOType = Utils.toNumber(req.body.WOType);
			}
		}
		if(req.body.operateTeam) req.body.operateTeam = mongoose.Types.ObjectId(req.body.operateTeam);
		req.body.customerID = mongoose.Types.ObjectId(req.body.customerID);

		async.series([
				function(callB) {
					var findRequire = {};
					if(req.body.operateTeam || req.body.WOType || req.body.WOType == 0) {
						if(req.body.operateTeam) findRequire.operate_team = {
							$in: [req.body.operateTeam, null]
						};
						if(req.body.WOType) findRequire.work_order_type = {
							$in: [req.body.WOType, null]
						};
					}
					OperativeCustomer.find(findRequire, function(err, customerListFound) {
						if(dealErr.findErr(err, res)) return callB(err);
						if(customerListFound.length > 0) {
							res.error(ERROR_CODE.ALREADY_EXISTS);
							callB(ERROR_CODE.ALREADY_EXISTS);
						} else {
							callB(null);
						}
					})
				},

				function(callB) {
					var customer = new OperativeCustomer({
						_id: new mongoose.Types.ObjectId(),
						operate_team: req.body.operateTeam, // 运营小组
						work_order_type: req.body.WOType, // 工单类型
						customer_id: req.body.customerID, // 客服
						createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						updatedAt: moment().format("YYYY-MM-DD HH:mm:ss")
					});
					customer.save(function(err) {
						if(dealErr.createErr(err, res)) return callB(err);
						callB(null);
					})
				}
			],
			function(err) {
				if(err) {
					debug(new Error(err));
					return;
				}
				res.success();
			}
		)
	},

	updateCustomer: function(req, res, next) {
		var subFilter = req.subfilterOperativeCustomer || {};
		if(!subFilter.edit) {
			res.error(ERROR_CODE.ACCESS_DENIED);
			return;
		}

		if(!req.body.customerID || !req.body.WOCustomerID) return res.error(ERROR_CODE.MISSING_ARGUMENT);
		req.body.WOType = req.body.WOType || null;
		req.body.operateTeam = req.body.operateTeam || null;
		if(req.body.WOType && typeof(req.body.WOType) != "number") req.body.WOType = Utils.toNumber(req.body.WOType);
		if(req.body.operateTeam) req.body.operateTeam = mongoose.Types.ObjectId(req.body.operateTeam);
		req.body.customerID = mongoose.Types.ObjectId(req.body.customerID);
		req.body.WOCustomerID = mongoose.Types.ObjectId(req.body.WOCustomerID);
		async.series([
				// 判断数据是否是已删除数据
				function(callB) {
					var findRequire = {};
					if(req.body.operateTeam || req.body.WOType) {
						if(req.body.operateTeam) findRequire.operate_team = {
							$in: [req.body.operateTeam, null]
						};
						if(req.body.WOType) findRequire.work_order_type = {
							$in: [req.body.WOType, null]
						};
					}
					OperativeCustomer.find(findRequire, function(err, customerListFound) {
						if(dealErr.findErr(err, res)) return callB(err);
						if(customerListFound.length > 0) {
							if(customerListFound.length == 1) {
								if(customerListFound[0]._id.toString() == req.body.WOCustomerID.toString()) return callB(null);
							}
							callB(ERROR_CODE.ALREADY_EXISTS);
						} else {
							callB(null);
						}
					})
				},

				function(callB) {
					OperativeCustomer.findOne({
						_id: req.body.WOCustomerID
					}, function(err, customerFound) {
						console.log(customerFound)
						if(dealErr.findErr(err, res)) return callB(err);
						customerFound.customer_id = req.body.customerID;
						customerFound.operate_team = req.body.operateTeam;
						customerFound.work_order_type = req.body.WOType;
						customerFound.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
						customerFound.save(function(err) {
							if(dealErr.updateErr(err, res)) return callB(err);
							callB(null);
						})
					})
				}
			],
			function(err) {
				if(err) {
					debug(new Error(err));
					res.error(err);
					return;
				}
				res.success();
			}
		)
	},

	deleteCustomer: function(req, res, next) {
		var subFilter = req.subfilterOperativeCustomer || {};
		if(!subFilter.delete) {
			res.error(ERROR_CODE.ACCESS_DENIED);
			return;
		}

		if(!req.body.WOCustomerID) return res.error(ERROR_CODE.MISSING_ARGUMENT);
		req.body.WOCustomerID = mongoose.Types.ObjectId(req.body.WOCustomerID);
		var findRequire = {
			_id: req.body.WOCustomerID
		};
		OperativeCustomer.remove(findRequire, function(err) {
			if(dealErr.removeErr(err, res)) return debug(new Error(err));
			res.success();
		})
	},

	workOrderCreate: function(req, res, next) {
		var subFilter = req.subfilterCreateOrder || {};
		if(!subFilter.add) {
			res.error(ERROR_CODE.ACCESS_DENIED);
			return;
		}

		if(!req.body.operateTeam || (!req.body.WOType && req.body.WOType != 0) || !req.body.content) return res.error(ERROR_CODE.MISSING_ARGUMENT);
		if(typeof(req.body.WOType) != "number") req.body.WOType = Utils.toNumber(req.body.WOType);
		req.body.operateTeam = mongoose.Types.ObjectId(req.body.operateTeam);
		var orderID;
		var handler = "";
		var noDealter = true;
		async.series([
				// 生成工单编号
				function(callB) {
					var regExp = new RegExp(moment().format("YYYYMMDD"));
					var findRequire = {
						order_id: regExp
					};
					WorkOrder.count(findRequire, function(err, OrderCount) {
						if(dealErr.findErr(err, res)) return callB(err);
						orderID = (OrderCount + 1).toString();
						if(orderID.length < 4) orderID = moment().format("YYYYMMDD") + orderID.padLeft(4, '0');
						callB(null);
					});
				},

				// 获取处理人
				function(callB) {
					var findRequire = {};
					if(req.body.WOType != 0) {
						findRequire = {
							operate_team: {
								$in: [req.body.operateTeam, null]
							},
							work_order_type: {
								$in: [req.body.WOType, null]
							}
						};
					} else {
						callB(null);
						return;
					}
					OperativeCustomer.find(findRequire, ["customer_id"])
						.sort({
							work_order_type: -1
						})
						.exec(function(err, customerListFound) {
							if(dealErr.createErr(err, res)) return callB(err);
							if(customerListFound.length > 1) {
								res.error(ERROR_CODE.DB_VAL_ERROR);
								callB(ERROR_CODE.DB_VAL_ERROR);
								return;
							} else if(customerListFound.length == 1) {
								handler = customerListFound[0].customer_id;
								noDealter = false;
								callB(null);
							} else {
								callB(null);
							}
						})
				},

				// 默认处理人
				function(callB) {
					if(noDealter) {
						User.findOne({
								role: mongoose.Types.ObjectId("5a265adac4d23f1fcdb621f1")
							})
							.exec(function(err, otherFound) {
								if(dealErr.createErr(err, res)) return callB(err);
								if(otherFound) {
									handler = otherFound._id;
									callB(null);
								} else {
									res.error(ERROR_CODE.MISSING_OPERATE);
									callB(ERROR_CODE.MISSING_OPERATE);
									return;
								}
							})
					} else {
						callB(null);
					}
				},

				function(callB) {
					var newWorkOrder = new WorkOrder({
						_id: mongoose.Types.ObjectId(),
						order_id: orderID, // 工单编号
						state: 0, // 状态(0：待处理， 1：已跟进， 2：已完结)
						type: req.body.WOType, // 类型(1：评论异常， 2：发现跟单， 3：Lightning Deals， 4:销售权限， 5:品牌更改， 6:店铺IP问题， 0：其它)
						creator: mongoose.Types.ObjectId(subFilter.add), // 创建人
						team_id: req.body.operateTeam,
						content: req.body.content, // 工单内容
						handler: handler, // 当前处理人
						history: [{
							log: "",
							from: subFilter.add,
							to: handler
						}],
						createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						updatedAt: moment().format("YYYY-MM-DD HH:mm:ss")
					});
					newWorkOrder.save(function(err) {
						if(dealErr.createErr(err, res)) return callB(err);
						callB(null);
					})
				}
			],
			function(err) {
				if(err) {
					debug(new Error(err));
					return;
				}
				res.success();
			}
		)
	},

	dealOrder: function(req, res, next) {
		var subFilter = req.subfilterWorkOrder || {};
		if(!subFilter.edit) {
			res.error(ERROR_CODE.ACCESS_DENIED);
			return;
		}

		// 转派人
		var handlerID;
		if(req.body.handlerID) handlerID = mongoose.Types.ObjectId(req.body.handlerID);
		if(!req.body.id || !req.body.state || (!handlerID && req.body.state != 2)) return res.error(ERROR_CODE.MISSING_ARGUMENT);
		if(typeof(req.body.state) != "number") req.body.state = Utils.toNumber(req.body.state);

		req.body.id = mongoose.Types.ObjectId(req.body.id);

		async.series([
				function(callB) {
					var findRequire = {
						_id: req.body.id
					};
					WorkOrder.findOne(findRequire, function(err, orderFound) {
						if(dealErr.findErr(err, res)) return callB(err);
						if(orderFound) {
							if(orderFound.history[0]) {
								if((orderFound.history[0].to.toString()) == (handlerID + "")) {
									res.error(ERROR_CODE.INVALID_ARGUMENT);
									callB(ERROR_CODE.INVALID_ARGUMENT);
									return;
								}
								var log = req.body.log || "";
								var remark = req.body.remark || "";
								var history = {
									log: log,
									remark: remark,
									from: mongoose.Types.ObjectId(subFilter.edit),
									dealtAt: moment().format("YYYY-MM-DD HH:mm:ss")
								};
								if(handlerID) history.to = handlerID;
								orderFound.history.unshift(history);
								if(handlerID) {
									orderFound.handler = handlerID;
								} else {
									orderFound.handler = null;
								}
								orderFound.state = req.body.state;
								orderFound.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss")
								orderFound.save(function(err) {
									if(dealErr.updateErr(err, res)) return callB(err);
									callB(null);
								})
							} else {
								res.error(ERROR_CODE.DB_ERROR);
								callB(ERROR_CODE.DB_ERROR);
							}
						} else {
							res.error(ERROR_CODE.NOT_EXISTS);
							callB(ERROR_CODE.NOT_EXISTS);
						}
					})
				}
			],
			function(err) {
				if(err) {
					debug(new Error(err));
					return;
				}
				res.success();
			}
		)
	},

	// 查询小组
	orderReady: function(req, res, next) {
		Team.find({}, {
			name: 1
		}, function(err, docs) {
			if(err) res.error(ERROR_CODE.FIND_FAILED);
			res.success({
				team: docs
			})
		})
	},

	// 工单详情
	openOrder: function(req, res, next) {
		if(!req.query.id) return res.error(ERROR_CODE.MISSING_ARGUMENT);
		WorkOrder.findOne({
			_id: req.query.id
		}).populate({
			path: 'creator',
			select: 'name'
		}).populate({
			path: 'team_id',
			select: 'name'
		}).populate({
			path: 'history.from',
			select: 'name'
		}).populate({
			path: 'history.to',
			select: 'name'
		}).exec(function(err, docs) {
			if(!docs) res.error(ERROR_CODE.NOT_EXISTS);
			let history = [];
			docs.history.map(function(item) {
				history.splice(0, 0, {
					remark: item.remark,
					dealtLog: item.log,
					dealtAt: item.dealtAt || docs.createdAt,
					dealer: item.to ? item.to.name : '预警机器人',
					handler: item.from ? item.from.name : '预警机器人'
				})
			});
			if(docs.state == 2) history[history.length - 1]['state'] = 2;
			res.send({
				history,
				type: docs.type,
				content: docs.content,
				createdAt: docs.createdAt,
				operateTeam: docs.team_id ? docs.team_id.name : '',
				creator: docs.creator ? docs.creator.name : '预警机器人'
			})
		})
	},

	// 保存备注
	saveRemark: function(req, res, next) {
		if(!req.body._id) res.error(ERROR_CODE.MISSING_ARGUMENT);

		async.series({
			save: function(callback) {
				WorkOrder.findOne({
					_id: req.body._id
				}, function(err, work) {
					if(err || !work) callback(ERROR_CODE.FIND_FAILED);
					work.remarks.unshift({
						writer: req.agent.id,
						content: req.body.content
					});
					work.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
					work.save(function(err, doc) {
						err ? callback(ERROR_CODE.UPDATE_FAILED) : callback(null)
					})
				})
			},
			info: function(callback) {
				WorkOrder.findOne({
					_id: req.body._id
				}).populate({
					path: 'remarks.writer',
					select: 'name'
				}).exec(function(err, work) {
					err ? callback(ERROR_CODE.UPDATE_FAILED) : callback(null, work)
				})
			}
		}, function(err, results) {
			err ? res.error(err) : res.send(results.info['remarks'])
		})
	},

	// 处理状态
	handle: function(req, res) {
		if(!req.body._id) res.error(ERROR_CODE.MISSING_ARGUMENT);
		WorkOrder.findOne({
			_id: req.body._id
		}, function(err, work) {
			work.handle ? work.handle = false : work.handle = true;
			work.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
			work.save(function(err, doc) {
				err ? res.error(ERROR_CODE.UPDATE_FAILED) : res.send(doc)
			})
		})
	},

	// 待处理列表
	newOrders: function(req, res) {
		var pageSize = parseInt(req.query.pageSize) || 10;
		var currentPage = parseInt(req.query.currentPage) || 1;
		var where = {};
		var subFilter = req.subfilterWorkOrder || {};
		if(subFilter.view == "*") {
			where = {}
		} else if(subFilter.view != null) {
			where = {
				handler: mongoose.Types.ObjectId(subFilter.view)
			}
		} else {
			res.error(ERROR_CODE.ACCESS_DENIED)
		};
		where.state = {
			$nin: [2]
		};
		if(req.query.asin) {
			where['data.ASIN'] = {
				$regex: req.query.asin,
				$options: 'i'
			}
		};
		if(req.query.startTime) {
			where.createdAt = {
				$gte: new Date(req.query.startTime)
			}
		};
		if(req.query.endTime) {
			var time = new Date(req.query.endTime);
			time.setDate(time.getDate() + 1);
			where.createdAt = {
				$lte: new Date(time)
			}
		};
		if(req.query.startTime && req.query.endTime) {
			var time = new Date(req.query.endTime);
			time.setDate(time.getDate() + 1);
			where.createdAt = {
				$gte: new Date(req.query.startTime),
				$lte: new Date(time)
			}
		};
		if(req.query.handle && req.query.handle === '0') {
			where.$or = [{
				handle: null
			}, {
				handle: parseInt(req.query.handle)
			}]
		};
		if(req.query.handle && req.query.handle === '1') {
			where.handle = parseInt(req.query.handle)
		};
		var types = req.query.type;
		if(types && typeof types == 'string') {
			if(types.length >= 3) {
				where['type'] = parseInt(types)
			} else {
				where['data.type'] = parseInt(types)
			}
		} else if(types) {
			var typeIn = {
				type: {
					$in: []
				}
			};
			var dataTypeIn = {
				'data.type': {
					$in: []
				}
			};
			where.$or = [];
			for(var i = 0; i < types.length; i++) {
				if(types[i].length >= 3) {
					typeIn.type.$in.push(parseInt(types[i]))
				} else {
					dataTypeIn['data.type'].$in.push(parseInt(types[i]))
				}
			};
			if(typeIn.type.$in.length) where.$or.push(typeIn);
			if(dataTypeIn['data.type'].$in.length) where.$or.push(dataTypeIn);
		};
		var customers = [];
		var pageCount = 1;
		var teamJson = {};
		var workOrder = {};
		var dailySell = {};
		var merchandise = {};

		async.series([
			// 获取小组组长
			function(callback) {
				User.find({
					team: {
						$ne: null
					}
				}, function(err, docs) {
					docs.map(function(item) {
						teamJson[item.team] = item.name
					});
					callback(null)
				})
			},
			// 获取工单信息
			function(callback) {
				WorkOrder.find(where).sort({
					order_id: -1
				}).skip((currentPage - 1) * pageSize).limit(pageSize).populate({
					path: 'creator',
					select: 'name'
				}).populate({
					path: 'handler',
					select: 'name'
				}).populate({
					path: 'team_id',
					select: 'name'
				}).populate({
					path: 'remarks.writer',
					select: 'name'
				}).exec(function(err, docs) {
					docs.map(function(item) {
						if(item['team_id']) {
							item.team_name = item['team_id']['name'];
							item.leader = teamJson[item['team_id']['_id']];
						};
						workOrder[item.order_id] = item;
					});
					callback(null)
				})
			},
			// 获取商品信息
			function(callback) {
				Merchandise.find({}, {
					asin: 1,
					state: 1,
					shop_name: 1,
					team_id: 1,
					store_sku: 1
				}).populate({
					path: 'team_id',
					select: 'name'
				}).exec(function(err, docs) {
					docs.map(function(item) {
						if(item['team_id']) {
							item.team_name = item['team_id']['name'];
							item.leader = teamJson[item['team_id']['_id']];
						};
						merchandise[item.asin] = item;
					});
					callback(null)
				})
			},
			//			// 获取FBA库存 
			//			function(callback) {
			//				DailySell.find({}, ['asin', 'sellable_stock', 'transport_stock'], function(err, docs) {
			//					docs.map(function(item) {
			//						dailySell[item.asin] = item.sellable_stock + item.sellable_stock
			//					});
			//					callback(err)
			//				})
			//			},
			// 获取处理人
			function(callback) {
				User.find({
					role: {
						$in: [
							mongoose.Types.ObjectId("5a264d69c4d23f1fcdb62191"),
							mongoose.Types.ObjectId("5a265adac4d23f1fcdb621f1"),
							mongoose.Types.ObjectId("59f984c2513ecc57ffc1ddcf"),
							mongoose.Types.ObjectId("59fc32140ed72b7271f8d614")
						]
					}
				}, {
					name: 1
				}).sort({
					name: 1
				}).exec(function(err, docs) {
					customers = docs;
					callback(null)
				})
			},
			// 获取类型统计
			function(callback) {
				WorkOrder.count(where, function(err, count) {
					pageCount = Math.ceil(count / pageSize);
					callback(null)
				})
			}
		], function(err, results) {
			let list = [];
			let states = ["停售", "未开售", "推广期", "在售期", "清仓期", "归档", "备用"];
			for(let key in workOrder) {
				let work = workOrder[key];
				let asin = null;

				if(work['data']) asin = work['data']['ASIN'];

				let merchan = merchandise[asin] || {};

				list.push({
					asin,
					id: work['_id'],
					type: work['type'],
					handle: work['handle'],
					remarks: work['remarks'],
					content: work['content'],
					orderID: work['order_id'],
					createdAt: work['createdAt'],
					creator: work['creator'] ? work['creator']['name'] : '预警机器人',
					handler: work['handler'] ? work['handler']['name'] : '预警机器人',
					leader: work['leader'] ? work['leader'] : merchan['leader'],
					team_name: work['team_name'] ? work['team_name'] : merchan['team_name'],
					shop_name: merchan['shop_name'],
					status: states[merchan['state']] ? states[merchan['state']] : '不存在'
				})
			};
			res.send({
				list,
				pageCount,
				customers
			})
		})
	},

	// 已处理列表
	dealtList: function(req, res, next) {
		var pageSize = parseInt(req.query.itemsPerPage) || 10;
		var currentPage = parseInt(req.query.currentPage) || 1;
		var subFilter = req.subfilterWorkOrder || {};
		var where = {
			state: {
				$nin: [0]
			}
		};

		if(subFilter.view != '*' && subFilter.view != null) {
			where['history.from'] = {
				$in: [mongoose.Types.ObjectId(subFilter.view)]
			}
		};
		if(req.query.asin) {
			where['data.ASIN'] = {
				$regex: req.query.asin,
				$options: 'i'
			}
		};
		if(req.query.startDate) {
			where.createdAt = {
				$gte: new Date(req.query.startDate)
			}
		};
		if(req.query.endDate) {
			var time = new Date(req.query.endDate);
			time.setDate(time.getDate() + 1);
			where.createdAt = {
				$lte: new Date(time)
			}
		};
		if(req.query.startDate && req.query.endDate) {
			var time = new Date(req.query.endDate);
			time.setDate(time.getDate() + 1);
			where.createdAt = {
				$gte: new Date(req.query.startDate),
				$lte: new Date(time)
			}
		};
		var type = req.query.type;
		if(type && type.length >= 3) {
			where.type = parseInt(type)
		} else if(type) {
			where['data.type'] = parseInt(type)
		};
		if(req.query.state) {
			where.state = req.query.state
		};
		if(req.query.creator) {
			where.creator = mongoose.Types.ObjectId(req.query.creator)
		};
		if(req.query.handler) {
			where.handler = mongoose.Types.ObjectId(req.query.handler)
		};
		if(req.query.treated) {
			if(where['history.from']) {
				where['history.from']['$in'].push(mongoose.Types.ObjectId(req.query.treated))
			} else {
				where['history.from'] = mongoose.Types.ObjectId(req.query.treated)
			}
		};

		var customers = [];
		var totalItems = 0;
		var teamJson = {};
		var workOrder = {};
		var merchandise = {};

		async.series([
			// 获取工单总数
			function(callback) {
				WorkOrder.count(where, function(err, count) {
					totalItems = count;
					callback(null)
				})
			},
			// 获取小组组长
			function(callback) {
				User.find({
					team: {
						$ne: null
					}
				}, function(err, docs) {
					docs.map(function(item) {
						teamJson[item.team] = item.name
					});
					callback(null)
				})
			},
			// 获取工单信息
			function(callback) {
				WorkOrder.find(where).sort({
					order_id: -1
				}).skip((currentPage - 1) * pageSize).limit(pageSize).populate({
					path: 'creator',
					select: 'name'
				}).populate({
					path: 'handler',
					select: 'name'
				}).populate({
					path: 'team_id',
					select: 'name'
				}).populate({
					path: 'remarks.writer',
					select: 'name'
				}).populate('team_id').exec(function(err, docs) {
					docs.map(function(item) {
						if(item['team_id']) {
							item.team_name = item['team_id']['name'];
							item.leader = teamJson[item['team_id']['_id']];
						};
						workOrder[item.order_id] = item;
					});
					callback(null)
				})
			},
			// 获取商品信息
			function(callback) {
				Merchandise.find({}, {
					asin: 1,
					state: 1,
					shop_name: 1,
					team_name: 1,
					store_sku: 1
				}).populate({
					path: 'team_id',
					select: 'name'
				}).exec(function(err, docs) {
					docs.map(function(item) {
						if(item['team_id']) {
							item.team_name = item['team_id']['name'];
							item.leader = teamJson[item['team_id']['_id']];
						};
						merchandise[item.asin] = item;
					});
					callback(null)
				})
			},
			// 获取处理人
			function(callback) {
				User.find({}, {
					name: 1
				}).sort({
					name: 1
				}).exec(function(err, docs) {
					customers = docs;
					callback(null)
				})
			}
		], function(err, results) {
			let list = [];
			let states = ["停售", "未开售", "推广期", "在售期", "清仓期", "归档", "备用"];
			for(let key in workOrder) {
				let work = workOrder[key];
				let asin = null;

				if(work['data']) {
					asin = work['data']['ASIN']
				};

				let merchan = merchandise[asin] || {};

				list.push({
					asin,
					ID: work['_id'],
					type: work['type'],
					state: work['state'],
					handle: work['handle'],
					remarks: work['remarks'],
					content: work['content'],
					orderID: work['order_id'],
					createdAt: work['createdAt'],
					creator: work['creator'] ? work['creator']['name'] : '预警机器人',
					handler: work['handler'] ? work['handler']['name'] : '预警机器人',
					leader: work['leader'] ? work['leader'] : merchan['leader'],
					team_name: work['team_name'] ? work['team_name'] : merchan['team_name'],
					shop_name: merchan['shop_name'],
					status: states[merchan['state']] ? states[merchan['state']] : '不存在',
				})
			};
			res.send({
				list,
				customers,
				totalItems
			})
		})
	},
	// 点击任务列表
	clickTaskList: function(req, res) {
		MysqlADC.query('SELECT * FROM ClickConfig', function(error, results) {
			res.send(results)
		})
	},
	// 点击任务保存
	clickTaskSave: function(req, res) {
		var {
			Asin,
			Category,
			ExecuteNum,
			ExecuteTime,
			Id,
			Keyword,
			Note,
			UpNote,
			OperTime,
			SellerId,
			Status
		} = req.body;
		Note = Note || '';
		Status = parseInt(Status) || 0;
		ExecuteNum = parseInt(ExecuteNum) || 1;
		ExecuteTime = moment(ExecuteTime).format('YYYY-MM-DD HH:mm:ss');
		OperTime = moment().format('YYYY-MM-DD HH:mm:ss');

		if(Id) {
			async.series([
				function(callback) {
					if(UpNote) {
						callback(null);
						return
					};
					var sql = `SELECT * FROM ClickConfig WHERE (Id="${Id}")`;
					MysqlADC.query(sql, function(error, results) {
						if(results[0]['Status'] != 0) callback({
							message: 'The completed state cannot be updated'
						});
						callback(error, results)
					})
				},
				function(callback) {
					var sql = `UPDATE ClickConfig SET Asin="${Asin}",Category="${Category}",ExecuteNum="${ExecuteNum}",ExecuteTime="${ExecuteTime}",Keyword="${Keyword}",Note="${Note}",OperTime="${OperTime}",SellerId="${SellerId}" WHERE (Id="${Id}")`;
					MysqlADC.query(sql, function(error, results) {
						callback(error, results)
					})
				}
			], function(error, results) {
				res.send({
					results,
					error: error ? error.message : null
				})
			})
		} else {
			var sql = `INSERT INTO ClickConfig (ExecuteTime,ExecuteNum,Category,Keyword,Asin,SellerId,OperTime) VALUES ("${ExecuteTime}","${ExecuteNum}","${Category}","${Keyword}","${Asin}","${SellerId}","${OperTime}")`;
			MysqlADC.query(sql, function(error, results) {
				res.send({
					results,
					error: error ? error.message : null
				})
			})
		}
	}

}