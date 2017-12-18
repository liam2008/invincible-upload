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
var Role = InvincibleDB.getModel('role');

var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;
var Utils = Shared.Utils;
var dealErr = require('../errors/controller-error');

module.exports = {
	name: "workOrder",

	customerList: function (req, res, next) {
		var results = {};
		async.series([
				// 运营客服
				function (callB) {
					var findRequire = {
						deletedAt: null
					};
					OperativeCustomer.find(findRequire)
						.sort({operateTeam: 1})
						.populate("customerID")
						.exec(function (err, customerFounds) {
						if (dealErr.findErr(err, res)) return callB(err);
						var list = [];
						customerFounds.forEach (function (customerFound) {
							var result = {};
							result.WOCustomerID = customerFound._id;
							result.operateTeam = customerFound.operate_team;
							result.WOType = customerFound.work_order_type;
							if (customerFound.customerID) result.customer = {
								customerID: customerFound.customerID._id,
								customerName: customerFound.customerID.name
							};
							list.push(result);
						});
						results.list = list;
						callB(null);
					})
				},

				// 所有运营相关用户
				function (callB) {
					var users = [];

					//var findRequire = {
                    //
					//}
					//Role

					findRequire = {
						deletedAt: null,
						account:{$nin: ["root", "guest", "test", "admin"]}
					};
					User.find(findRequire,["name"]).exec(function (err, userFounds) {
						if (dealErr.findErr(err, res)) return callB(err);
						userFounds.forEach (function (userFound) {
							var user = {
								userID: userFound._id,
								userName: userFound.name
							};
							users.push(user);
						});
						results.users = users;
						callB(null);
					})
				},

				function (callB) {
					res.success(results);
					callB(null);
				}
			],
			function (err) {
				if (err) {
					debug(new Error(err));
					return;
				}
			}
		)
	},

	saveCustomer: function (req, res, next) {
		if (!req.body.operateTeam || !req.body.WOType || !req.body.customerID) return res.error(ERROR_CODE.MISSING_ARGUMENT);
		if (typeof (req.body.WOType) != "number") req.body.WOType = Utils.toNumber(req.body.WOType);

		async.series([
				function (callB) {
					var findRequire = {
						operate_team: req.body.operateTeam,
						work_order_type: req.body.WOType
					};
					OperativeCustomer.findOne(findRequire, function (err, customerFound) {
						if (dealErr.findErr(err, res)) return callB(err);
						if (!customerFound) {
							var customer = new OperativeCustomer({
								_id: new mongoose.Types.ObjectId(),
								operate_team: req.body.operateTeam,                                                   // 运营小组
								work_order_type: req.body.WOType,                                                        // 工单类型
								customerID: mongoose.Types.ObjectId(req.body.customerID),                                                      // 客服
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
			}
		)
	},

	updateCustomer: function (req, res, next) {
		if (!req.body.WOCustomerID || !req.body.operateTeam || !req.body.WOType || !req.body.customerID) return res.error(ERROR_CODE.MISSING_ARGUMENT);
		if (typeof (req.body.WOType) != "number") req.body.WOType = Utils.toNumber(req.body.WOType);

		var alreadyExist = false;
		var alreadyDel = false;
		if (req.body.alreadyDel == true) alreadyDel = true;
		async.series([
				function (callB) {
					if (!alreadyDel) {
						var findRequire = {
							operate_team: req.body.operateTeam,
							work_order_type: req.body.WOType
						};
						OperativeCustomer.findOne(findRequire, function (err, customerFound) {
							if (dealErr.findErr(err, res)) return callB(err);
							if (customerFound) {
								if (customerFound.deletedAt != null) {
									res.error(ERROR_CODE.ALREADY_EXISTS);
									alreadyExist = true;
								}
							}
							callB(null);
						})
					}else {
						callB(null);
					}
				},

				function (callB) {
					if (!alreadyExist) {
						var findRequire = {
							_id: mongoose.Types.ObjectId(req.body.WOCustomerID)
						};
						OperativeCustomer.findOne(findRequire, function (err, customerFound) {
							if (dealErr.findErr(err, res)) return callB(err);
							if (customerFound) {
								customerFound.operate_team = req.body.operateTeam;
								customerFound.work_order_type = req.body.WOType;
								customerFound.customerID = mongoose.Types.ObjectId(req.body.customerID);
								customerFound.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
								customerFound.save(function (err) {
									if (dealErr.updateErr(err, res)) return callB(err);
									res.success();
									callB(null)
								})
							}else {
								res.error(ERROR_CODE.NOT_EXISTS);
								callB("update err: no update id(" + req.body.WOCustomerID + ")");
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
			}
		)
	},

	deleteCustomer: function (req, res, next) {
		if (!req.query.WOCustomerID) return res.error(ERROR_CODE.MISSING_ARGUMENT);

		var findRequire = {
			_id: mongoose.Types.ObjectId(req.query.WOCustomerID)
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
		var orderID;
		if (!req.body.operateTeam || !req.body.WOType || !req.body.content) return res.error(ERROR_CODE.MISSING_ARGUMENT);
		if (typeof (req.body.WOType) != "number") req.body.WOType = Utils.toNumber(req.body.WOType);

		async.series([


				function (callB) {
					//var newWorkOrder = new WorkOrder({
					//	_id: mongoose.Types.ObjectId(),
					//	order_id: moment().format("YYYYMMDD") + 0001,                                                   // 工单编号
					//	state: 0,                                                      // 状态(0：待处理， 1：已跟进， 2：已完结)
					//	type: Number,                                                       // 类型(1：评论异常， 2：发现跟单， 3：普通工单， 0：其它)
					//	creater: mongoose.Types.ObjectId(req.agent.id),              // 创建人
					//	content: req.body.content,                                                    // 工单内容
					//	handler: { type: Schema.Types.ObjectId, ref: 'user' },              // 当前处理人
					//	history: [{
					//		log: String,
					//		from: { type: Schema.Types.ObjectId, ref: 'user' },
					//		to: { type: Schema.Types.ObjectId, ref: 'user' },
					//		dealedAt: moment().format("YYYY-MM-DD HH:mm:ss")
					//	}],
					//})
				}
			],
			function (err) {
				if (err) {
					debug(new Error(err));
					return;
				}
			}
		)

	}
}