var debug = require('debug')('smartdo:controller:workOrder');
var ServerError = require('../errors/server-error');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var async = require('async');
var moment = require('moment');
var InvincibleDB = require('../models/invincible');
var OperativeCustomer = InvincibleDB.getModel('operativeCustomer');
var WorkOrder = InvincibleDB.getModel('workOrder');
var User = InvincibleDB.getModel('user');
var PadLeft = require('padleft');
var Team = InvincibleDB.getModel('team');

var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;
var Utils = Shared.Utils;
var dealErr = require('../errors/controller-error');

module.exports = {
	name: "workOrder",

	customerList: function (req, res, next) {
		var findCondition = null;
		var subFilter = req.subfilterOperativeCustomer || {};
		if (subFilter.view == "*") {
			findCondition = {};
		}
		else if (subFilter.view != null) {
			findCondition = {customer_id: subFilter.view};
		}
		else {
			res.success();
			return;
		}

		if (req.query.teamID) findCondition.operate_team = mongoose.Types.ObjectId(req.query.teamID);
		if (req.query.orderType) {
			if (typeof (req.query.orderType) == "number") {
				findCondition.work_order_type = req.query.orderType;
			}else {
				findCondition.work_order_type = Utils.toNumber(req.query.orderType);
			}
		}

		var results = {};
		async.series([
				// 运营客服
				function (callB) {
					findCondition.deletedAt = null;
					OperativeCustomer.find(findCondition)
						.sort({operateTeam: 1})
						.populate("customer_id")
						.populate("operate_team")
						.exec(function (err, customerFounds) {
						if (dealErr.findErr(err, res)) return callB(err);
						var list = [];
						customerFounds.forEach (function (customerFound) {
							var result = {};
							result.WOCustomerID = customerFound._id;
							if (customerFound.operate_team) {
								result.operateTeam = {
									id: customerFound.operate_team.id,
									name: customerFound.operate_team.name
								};
							}else {
								result.operateTeam = "全部";
							}
							result.WOType = customerFound.work_order_type;
							if (customerFound.customer_id) result.customer = {
								id: customerFound.customer_id._id,
								name: customerFound.customer_id.name
							};
							list.push(result);
						});
						results.list = list;
						callB(null);
					})
				},

				function (callB) {
					var team = [];
					Team.find({},["name"])
						.sort({name: 1})
						.exec(function (err, teamListFound) {
							if (dealErr.findErr(err, res)) return callB(err);
							teamListFound.forEach (function (teamFound) {
								team.push({id: teamFound._id, name: teamFound.name});
							});
							results.team = team;
							callB(null)
						})
				},

				function (callB) {
					var customers = [];
					User.find({role: mongoose.Types.ObjectId("5a264d69c4d23f1fcdb62191")})
						.populate("customer_id")
						.exec(function (err, customerFounds) {
							if (dealErr.findErr(err, res)) return callB(err);
							customerFounds.forEach (function (customerFound) {
								var customer = {id: customerFound._id, name: customerFound.name};
								customers.push(customer);
							});
							results.customers = customers;
							callB(null);
						})
				}
			],
			function (err) {
				if (err) {
					debug(new Error(err));
					return;
				}
				res.success(results);
			}
		)
	},

	saveCustomer: function (req, res, next) {
		var subFilter = req.subfilterOperativeCustomer || {};
		if (!subFilter.add) {
			res.success();
			return;
		}

		if (!req.body.customerID) return res.error(ERROR_CODE.MISSING_ARGUMENT);
		req.body.WOType = req.body.WOType || null;
		req.body.operateTeam = req.body.operateTeam || null;
		if (req.body.WOType && typeof (req.body.WOType) != "number") req.body.WOType = Utils.toNumber(req.body.WOType);
		if (req.body.operateTeam) req.body.operateTeam = mongoose.Types.ObjectId(req.body.operateTeam);
		req.body.customerID = mongoose.Types.ObjectId(req.body.customerID);

		async.series([
				function (callB) {
					var findRequire = {
						operate_team: {$in: [req.body.operateTeam, null]},
						work_order_type: {$in: [req.body.WOType, null]}
					};
					OperativeCustomer.findOne(findRequire, function (err, customerFound) {
						if (dealErr.findErr(err, res)) return callB(err);
						if (!customerFound) {
							var customer = new OperativeCustomer({
								_id: new mongoose.Types.ObjectId(),
								operate_team: req.body.operateTeam,                                                   // 运营小组
								work_order_type: req.body.WOType,                                                        // 工单类型
								customer_id: req.body.customerID,                                                      // 客服
								createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
								updatedAt: moment().format("YYYY-MM-DD HH:mm:ss")
							});
							customer.save(function (err) {
								if (dealErr.createErr(err, res)) return callB(err);
								res.success();
							})
						}else {
							if (customerFound.deletedAt) {
								req.body.WOCustomerID = customerFound._id.toString();
								req.body.alreadyDel = true;
								module.exports.updateCustomer(req, res, next)
							}else {
								res.error(ERROR_CODE.ALREADY_EXISTS);
							}
						}
						callB(null);
					})
				}
			],
			function (err) {
				if (err) {
					debug(new Error(err));
					return;
				}
				res.success();
			}
		)
	},

	updateCustomer: function (req, res, next) {
		var subFilter = req.subfilterOperativeCustomer || {};
		if (!subFilter.edit) {
			res.success();
			return;
		}

		if (!req.body.customerID) return res.error(ERROR_CODE.MISSING_ARGUMENT);
		req.body.WOType = req.body.WOType || null;
		req.body.operateTeam = req.body.operateTeam || null;
		if (req.body.WOType && typeof (req.body.WOType) != "number") req.body.WOType = Utils.toNumber(req.body.WOType);
		if (req.body.operateTeam) req.body.operateTeam = mongoose.Types.ObjectId(req.body.operateTeam);

		var alreadyExist = false;
		var alreadyDel = false;
		if (req.body.alreadyDel == true) alreadyDel = true;
		async.series([
				// 判断数据是否是已删除数据
				function (callB) {
					if (!alreadyDel) {
						var findRequire = {
							operate_team: {$in: [req.body.operateTeam, null]},
							work_order_type: {$in: [req.body.WOType, null]}
						};
						OperativeCustomer.findOne(findRequire, function (err, customerFound) {
							if (dealErr.findErr(err, res)) return callB(err);
							if (customerFound) {
								if (customerFound.deletedAt != null || (req.body.WOCustomerID != customerFound._id.toString())) {
									res.error(ERROR_CODE.DB_VAL_ERROR);
									callB(ERROR_CODE.DB_VAL_ERROR)
								}else {
									customerFound.operate_team = req.body.operateTeam;
									customerFound.work_order_type = req.body.WOType;
									customerFound.customer_id = mongoose.Types.ObjectId(req.body.customerID);
									customerFound.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
									customerFound.deletedAt = null;
									customerFound.save(function (err) {
										if (dealErr.updateErr(err, res)) return callB(err);
										callB(null)
									})
								}
							}else {
								res.error(ERROR_CODE.NOT_EXISTS);
								callB(ERROR_CODE.NOT_EXISTS);
							}
						})
					}else {
						callB(null);
					}
				}
			],
			function (err) {
				if (err) {
					debug(new Error(err));
					return;
				}
				res.success();
			}
		)
	},

	deleteCustomer: function (req, res, next) {
		var subFilter = req.subfilterOperativeCustomer || {};
		if (!subFilter.delete) {
			res.success();
			return;
		}

		if (!req.body.WOCustomerID) return res.error(ERROR_CODE.MISSING_ARGUMENT);
		req.body.WOCustomerID = mongoose.Types.ObjectId(req.body.WOCustomerID)
		var findRequire = {
			_id: req.body.WOCustomerID
		};
		OperativeCustomer.findOne(findRequire, function (err, customerFound) {
			if (dealErr.findErr(err, res)) return debug(new Error(err));
			if (customerFound) {
				customerFound.deletedAt = moment().format("YYYY-MM-DD HH:mm:ss");
				customerFound.save(function (err) {
					if (dealErr.removeErr(err, res)) return debug(new Error(err));
					res.success();
				})
			}else {
				res.error(ERROR_CODE.NOT_EXISTS);
			}
		})
	},

	workOrderCreate: function (req, res, next) {
		var subFilter = req.subfilterCreateOrder || {};
		if (!subFilter.add) {
			res.success();
			return;
		}

		if (!req.body.operateTeam || !req.body.WOType || !req.body.content) return res.error(ERROR_CODE.MISSING_ARGUMENT);
		if (typeof (req.body.WOType) != "number") req.body.WOType = Utils.toNumber(req.body.WOType);
		req.body.operateTeam = mongoose.Types.ObjectId(req.body.operateTeam);
		var orderID;
		var handler = "";
		async.series([
				// 生成工单编号
				function (callB) {
					var regExp = new RegExp(moment().format("YYYYMMDD"));
					var findRequire = {
						order_id: regExp
					};
					WorkOrder.count(findRequire,function (err, OrderCount) {
						if (dealErr.findErr(err, res)) return callB(err);
						orderID = (OrderCount + 1).toString();
						if (orderID.length < 4) orderID = moment().format("YYYYMMDD") + orderID.padLeft(4, '0');
						callB(null);
					});
				},

				// 获取处理人
				function (callB) {
					var findRequire = {
						operate_team: {$in: [req.body.operateTeam, null]},
						work_order_type: {$in: [req.body.WOType, null]}
					};
					OperativeCustomer.find(findRequire, ["customer_id"])
						.sort({work_order_type: -1})
						.exec(function (err, customerListFound) {
							if (dealErr.createErr(err, res)) return callB(err);
							if (customerListFound.length > 1) {
								res.error(ERROR_CODE.DB_VAL_ERROR);
								callB(ERROR_CODE.DB_VAL_ERROR);
								return;
							}else if (customerListFound.length == 1) {
								handler = customerListFound[0].customer_id;
								callB(null);
							}else {
								User.findOne({role: mongoose.Types.ObjectId("5a265adac4d23f1fcdb621f1")})
									.exec (function (err, otherFound) {
									if (dealErr.createErr(err, res)) return callB(err);
									if (otherFound) {
										handler = otherFound._id;
										callB(null);
									}else {
										res.error(ERROR_CODE.MISSING_OPERATE);
										callB(ERROR_CODE.MISSING_OPERATE);
										return;
									}
								})
							}
						})
				},

				function (callB) {
					var newWorkOrder = new WorkOrder({
						_id: mongoose.Types.ObjectId(),
						order_id: orderID,                                                   // 工单编号
						state: 0,                                                      // 状态(0：待处理， 1：已跟进， 2：已完结)
						type: req.body.WOType,                                                       // 类型(1：评论异常， 2：发现跟单， 3：Lightning Deals， 4:销售权限， 5:品牌更改， 6:店铺IP问题， 0：其它)
						creator: mongoose.Types.ObjectId(subFilter.add),              // 创建人
						team_id: req.body.operateTeam,
						content: req.body.content,                                                    // 工单内容
						handler: handler,              // 当前处理人
						history: [{
							log: "",
							from: subFilter.add,
							to: handler
						}],
						createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
						updatedAt: moment().format("YYYY-MM-DD HH:mm:ss")
					});
					newWorkOrder.save (function (err) {
						if (dealErr.createErr(err, res)) return callB(err);
						callB(null);
					})
				}
			],
			function (err) {
				if (err) {
					debug(new Error(err));
					return;
				}
				res.success();
			}
		)
	},

	newOrderList: function (req, res, next) {
		var findCondition = null;
		var subFilter = req.subfilterWorkOrder || {};
		if (subFilter.view == "*") {
			findCondition = {};
		}
		else if (subFilter.view != null) {
			findCondition = {handler: subFilter.view};
		}
		else {
			res.success();
			return;
		}

		var results = {};
		async.series([
				// 主页信息和分类数量
				function (callB) {
					var list = [];
					var typeCount = {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7":0, "8": 0, "0": 0};
					findCondition.state = {$nin: [2]};
					WorkOrder.find(findCondition, ["_id", "order_id","state","type","creator","content","handler"])
						.sort({order_id: -1})
						.populate("creator")
						.populate("handler")
						.exec(function (err, orderListFound) {
							if (dealErr.createErr(err, res)) return callB(err);
							orderListFound.forEach(function (orderFound) {
								var creator = "";
								var handler = "";
								if (orderFound.creator) {
									creator = orderFound.creator.name;
								}else {
									creator = "预警机器人";
								}
								if (orderFound.handler) handler = orderFound.handler.name;
								var result = {
									id: orderFound._id,
									orderID: orderFound.order_id,
									type: orderFound.type,
									creator: creator,
									content: orderFound.content,
									handler: handler
								};
								list.push(result);

								if (orderFound.type && orderFound.type != 0) typeCount[orderFound.type.toString()] += 1;
							});
							results.list = list;
							results.typeCount = typeCount;
							callB(null)
						})
				},

				// 获取处理人
				function (callB) {
					var customers = [];
					var findRequire = {
						role: {$in: [mongoose.Types.ObjectId("5a264d69c4d23f1fcdb62191"), mongoose.Types.ObjectId("5a265adac4d23f1fcdb621f1"),
							mongoose.Types.ObjectId("59f984c2513ecc57ffc1ddcf"), mongoose.Types.ObjectId("59fc32140ed72b7271f8d614")]}
					};
					User.find(findRequire,["name"])
						.sort({name: 1})
						.exec(function (err, userListFound) {
							if (dealErr.findErr(err, res)) return callB(err);
							userListFound.forEach (function (userFound) {
								var handler = {};
								handler.id = userFound._id;
								handler.name = userFound.name;
								customers.push(handler);
							});
							results.customers = customers;
							callB(null);
						})
				}
			],
			function (err) {
				if (err) {
					debug(new Error(err));
					return;
				}
				res.success(results);
			}
		)
	},

	dealOrder: function (req, res, next) {
		var subFilter = req.subfilterWorkOrder || {};
		if (!subFilter.edit) {
			res.success();
			return;
		}

		var handlerID;
		if (req.body.handlerID) handlerID = mongoose.Types.ObjectId(req.body.handlerID);
		if (!req.body.id || !req.body.state || (!handlerID && req.body.state != 2)) return res.error(ERROR_CODE.MISSING_ARGUMENT);
		if (typeof (req.body.state) != "number") req.body.state = Utils.toNumber(req.body.state);

		req.body.id = mongoose.Types.ObjectId(req.body.id);

		async.series([
				function (callB) {
					var findRequire = {
						_id: req.body.id
					};
					WorkOrder.findOne(findRequire, function (err, orderFound) {
						if (dealErr.findErr(err, res)) return callB(err);
						if (orderFound) {
							if (orderFound.history[0]) {
								if (orderFound.history[0].to.toString() == (handlerID + "")) {
									res.error(ERROR_CODE.INVALID_ARGUMENT);
									callB(ERROR_CODE.INVALID_ARGUMENT);
									return;
								}
								var log = req.body.log || "";
								var history = {
									log: log,
									from: mongoose.Types.ObjectId(subFilter.edit),
									dealtAt: moment().format("YYYY-MM-DD HH:mm:ss")
								};
								if (handlerID) history.to = handlerID;
								orderFound.history.unshift(history);
								if (!handlerID) {
									orderFound.handler = handlerID;
								}else {
									orderFound.handler = null;
								}
								orderFound.state = req.body.state;
								orderFound.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss")
								orderFound.save(function (err) {
									if (dealErr.updateErr(err, res)) return callB(err);
									callB(null);
								})
							}else {
								res.error(ERROR_CODE.DB_ERROR);
								callB(ERROR_CODE.DB_ERROR);
							}
						}else {
							res.error(ERROR_CODE.NOT_EXISTS);
							callB(ERROR_CODE.NOT_EXISTS);
						}
					})
				}
			],
			function (err) {
				if (err) {
					debug(new Error(err));
					return;
				}
				res.success();
			}
		)
	},

	dealtList: function (req, res, next) {
		var findCondition = null;
		var subFilter = req.subfilterWorkOrder || {};
		if (subFilter.view == "*") {
			findCondition = {};
		}
		else if (subFilter.view != null) {
			findCondition.history = {};
			findCondition.history.to = subFilter.view;
			findCondition.history.from = subFilter.view;
		}
		else {
			res.success();
			return;
		}

		req.query.currentPage = req.query.currentPage || 1;
		req.query.pageSize = req.query.itemsPerPage || 10;
		if (typeof (req.query.currentPage) != "number") req.query.currentPage = Utils.toNumber(req.query.currentPage);
		if (typeof (req.query.itemsPerPage) != "number") req.query.itemsPerPage = Utils.toNumber(req.query.itemsPerPage);

		var results = {};
		async.series([
				// 找出搜索条件对应的人
				function (callB) {
					var findRequire = {};
					if (req.query.creator || req.query.handler || req.query.treated) {
						findRequire.name = {};
						findRequire.name.$in = [];
						if (req.query.creator) findRequire.name.$in.push(new RegExp(req.query.creator));
						if (req.query.handler) findRequire.name.$in.push(new RegExp(req.query.handler));
						if (req.query.treated) findRequire.name.$in.push(new RegExp(req.query.treated));
					}
					User.find(findRequire)
						.exec(function (err, userListFound) {
							if (dealErr.findErr(err, res)) return callB(err);
							userListFound.forEach (function (userFound) {
								if ((userFound.name + "") == req.query.creator) {
									findCondition.creator = findCondition.creator || [];
									findCondition.creator.push(userFound._id);
								}
								if ((userFound.name + "") == req.query.handler) {
									findCondition.handler = findCondition.handler || [];
									findCondition.handler.push(userFound._id);
								}
								if ((userFound.name + "") == req.query.history) {
									findCondition.history = findCondition.history || {};
									if (subFilter.view == "*") {
										findCondition.$or = [{"history.from": userFound._id}, {"history.to": userFound._id}];
									}else {
										findCondition.history.$or = [
											{to: subFilter.view, from:userFound._id},
											{from: subFilter.view, to: userFound._id}
										]
									}
								}
							});
							callB(null)
						})
				},

				function (callB) {
					var list = [];
					findCondition.state = {$nin: [0]};
					findCondition.createdAt = {};
					if (req.query.startDate) {
						findCondition.createdAt.$gte = moment(req.query.startDate).format("YYYY-MM-DD HH:mm:ss");
					}else {
						findCondition.createdAt.$gte = moment().subtract(30, 'days').format("YYYY-MM-DD HH:mm:ss");
					}
					if (req.query.endDate) {
						findCondition.createdAt.$lte = moment(req.query.endDate).add(1, 'days').format("YYYY-MM-DD HH:mm:ss");
					}else {
						findCondition.createdAt.$lte = req.query.endDate || moment().format("YYYY-MM-DD HH:mm:ss");
					}
					if (req.query.state) findCondition.state = req.query.state;
					if (req.query.type) findCondition.type = req.query.type;

					WorkOrder.find(findCondition)
						.skip((req.query.currentPage - 1) * req.query.itemsPerPage)
						.limit(req.query.itemsPerPage)
						.sort({order_id: -1})
						.populate("creator")
						.populate("handler")
						.exec(function (err, orderListFound) {
						if (dealErr.findErr(err, res)) return callB(err);
						orderListFound.forEach (function (orderFound) {
							var creator = "";
							var handler = "";
							if (orderFound.creator) {
								creator = orderFound.creator.name;
							}else {
								creator = "预警机器人";
							}
							if (orderFound.handler) handler = orderFound.handler.name;
							var result = {
								orderID: orderFound.order_id,
								state: orderFound.state,
								type: orderFound.type,
								creator: creator,
								content: orderFound.content,
								handler: handler
							};
							list.push(result);
						});
							results.list = list;
							results.totalItems  = orderListFound.length;
							callB(null);
					})
				}
			],
			function (err) {
				if (err) {
					debug(new Error(err));
					return;
				}
				res.success(results);
			}
		)
	},

	orderReady: function (req, res, next) {
		var results = {};
		async.series([
				function (callB) {
					var team = [];
					Team.find({},["name"]).exec(function (err, teamListFound) {
						if (dealErr.findErr(err, res)) return callB(err);
						teamListFound.forEach (function (teamFound) {
							team.push({id: teamFound._id, name: teamFound.name})
						});
						results.team = team;
						callB(null);
					})
				}
			],
			function (err) {
				if (err) {
					debug(new Error(err));
					return;
				}
				res.success(results);
			}
		)
	},

	openOrder: function (req, res, next) {
		if (!req.query.id) return res.error(ERROR_CODE.MISSING_ARGUMENT);
		req.query.id = mongoose.Types.ObjectId(req.query.id);

		var results = {};
		async.series([
				function (callB) {
					var findRequire = {
						_id: req.query.id
					};
					WorkOrder.findOne(findRequire)
						.populate("creator")
						.populate("team_id")
						.populate("history.from")
						.populate("history.to")
						.exec(function (err, orderFound) {
						if (dealErr.findErr(err, res)) return callB(err);
						if (orderFound) {
							var order = {
								type: orderFound.type,
								createdAt: orderFound.createdAt,
								content: orderFound.content,
								logs: [],
								history: []
							};
							if (orderFound.creator) {
								order.creator = orderFound.creator.name;
							}else {
								order.creator = "预警机器人";
							}
							if (orderFound.team_id) order.operateTeam = orderFound.team_id.name;
							for (var m = 0; m < orderFound.history.length; m++) {
								var allHistory = orderFound.history[m];
								if (m != orderFound.history.length - 1) {
									var logs = {};
									if (allHistory.from) {
										logs.name = allHistory.from.name;
									}else {
										logs.name = "预警机器人";
									}
									logs.log = allHistory.log;
									order.logs.push(logs);
								}

								var history = {};
								if (allHistory.from) {
									history.handler = allHistory.from.name;
								}else {
									history.handler = "预警机器人";
								}
								history.dealtAt = allHistory.dealtAt;
								order.history.unshift(history);
							}

							results.order = order;
							callB(null);
						}else {
							res.error(ERROR_CODE.NOT_EXISTS);
							callB(ERROR_CODE.NOT_EXISTS);
						}
					})
				}
			],
			function (err) {
				if (err) {
					debug(new Error(err));
					return;
				}
				res.success(results);
			}
		)
	}
}