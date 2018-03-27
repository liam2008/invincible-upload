const moment = require('moment');
const async = require('async');
const mongoose = require('mongoose');
const uuid = require('uuid');

const InvincibleDB = require('../models/invincible');

const purchasePlan = InvincibleDB.getModel('purchasePlan');
const purchasePlanDetail = InvincibleDB.getModel('purchasePlanDetail');
const config = InvincibleDB.getModel('config');
const user = InvincibleDB.getModel('user');

var debug = require('debug')('smartdo:controller:purchasePlan');

var Shared = require('../../shared/');
var Utils = Shared.Utils;
var ERROR_CODE = Shared.ERROR;

// 判断当前采购计划属于哪一个流程步骤，返回流程
var procedure = function(item, purchasePlanConfig) {
	var money = item.total || 0;
	var details = item.details || null;
	var status = item.status || 100;

	if(!Utils.isArray(details)) {
		return {};
	}

	let firstTime = false;
	var len = details.length;
	for(var i = 0; i < len; i++) {
		var item = details[i];
		if(item.first_time === '是') {
			firstTime = true;
			break;
		}
	}

	var index = 0;

	// 运营段
	if(Math.floor(status / 100) != 3) {
		//是否第一次采购
		if(firstTime) {
			for(index = 0; index < purchasePlanConfig.length; index++) {
				let row = purchasePlanConfig[index];
				if(money >= row.intervalGotNew[0] && money < row.intervalGotNew[1]) {
					return row;
				}
			}
			return {};
		} else {
			for(index = 0; index < purchasePlanConfig.length; index++) {
				let row = purchasePlanConfig[index];
				if(money >= row.intervalNoNew[0] && money < row.intervalNoNew[1]) {
					return row;
				}
			}
			return {};
		}
	}
	// 采购段
	else {
		for(index = 0; index < purchasePlanConfig.length; index++) {
			let row = purchasePlanConfig[index];
			if(money >= row.intervalPurchase[0] && money < row.intervalPurchase[1]) {
				return row;
			}
		}
		return {};
	}
};

module.exports = {
	name: "purchasePlan",

	// 新增采购计划
	submit: function(req, res) {
		let planId;
		let detailsIdArr = [];
		async.waterfall([
			// plan_id的处理
			function(cb) {
				purchasePlan.find().sort({
					_id: -1
				}).exec(function(err, docs) {
					let date = moment().format('YYYYMMDD');
					if(err) console.error(err);
					if((docs instanceof Array && docs.length === 0) || docs[0].plan_id === undefined) {
						planId = 'PCP' + date + '001';
						cb(null);
					} else {
						// 注意日期格式的转换
						let dbDate = moment(docs[0].createdAt).format('YYYY-MM-DD');
						if(dbDate === moment().format('YYYY-MM-DD').toString()) {
							let no = (parseInt(docs[0].plan_id.slice(11)) + 1).toString();
							if(no.toString().length === 1) {
								no = '00' + no;
							} else {
								no = '0' + no;
							}
							planId = 'PCP' + date + no;
							cb(null);
						} else {
							planId = 'PCP' + date + '001';
							cb(null);
						}
					}
				});
			},
			// 创建purchasePlanDetail数据
			function(cb) {
				async.eachSeries(req.body.details, function(item, cb) {
					let detailsId = new mongoose.Types.ObjectId();
					purchasePlanDetail.create({
						_id: detailsId,
						plan_id: planId,
						product_id: mongoose.Types.ObjectId(item.product_id),
						local_storage: item.local_storage,
						fba_storage: item.fba_storage,
						average_7: item.average_7,
						average_30: item.average_30,
						expected_sales: item.expected_sales,
						local_transport: item.local_transport,
						abroad_transport: item.abroad_transport,
						prepare_period: item.prepare_period,
						safety_stock: item.safety_stock,
						purchase_amount: item.purchase_amount,
						supplier: mongoose.Types.ObjectId(item.supplierId),
						unit_cost: item.unit_cost,
						estimate_production_days: item.estimate_production_days,
						least_amount: item.least_amount,
						advance_pay_rate: item.advance_pay_rate,
						first_time: item.first_time,
						remarks: item.remarks,
						createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
						updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
					}, function(err) {
						detailsIdArr.push(detailsId);
						if(err) {
							console.error(err);
						} else {
							cb(null);
						}
					});
				}, function(err) {
					if(err) console.error(err);
					cb(null, detailsIdArr);
				});
			},
			// 创建purchasePlan数据
			function(arr, cb) {
				let data = {
					_id: new mongoose.Types.ObjectId(),
					plan_id: planId,
					status: req.body.status,
					total: req.body.total,
					applicant: req.agent.id,
					createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
					updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
				};
				data.details = arr;
				purchasePlan.create(data, function(err) {
					if(err) {
						console.error(err);
						res.json();
					} else {
						res.json(planId);
					}
				});
			}
		]);
	},
	//  首页展示
	show: function(req, res) {
		const purchasePlanConfig = req.purchasePlanConfig || [];
		const subfilterPurchasePlan = req.subfilterPurchasePlan || {};
		let pageCount = 0;
		let pageSize = req.query.pageSize || 10;
		let currentPage = req.query.currentPage || 1;
		let where = {};
		let datas = [];
		let count = {};

		if(req.query.plan_id) where.plan_id = {
			$regex: req.query.plan_id
		};
		if(req.query.startTime) where.createdAt = {
			$gte: new Date(queryInfo.startTime)
		};
		if(req.query.endTime) where.createdAt = {
			$lte: new Date(queryInfo.endTime)
		};
		if(req.query.startTime && req.query.endTime) {
			let date = new Date(req.query.endTime);
			date.setDate(date.getDate() + 1);
			where.createdAt = {
				$gte: new Date(req.query.startTime),
				$lte: new Date(date)
			};
		};

		let statusIn = null;
		if(req.query.status) {
			statusIn = [parseInt(req.query.status)];
		} else {
			switch(req.query.workbench || '1') {
				case '1':
					statusIn = subfilterPurchasePlan.edit.status || [];
					break;
				case '2':
					statusIn = subfilterPurchasePlan.view.status || [];
					break;
				case '3':
					statusIn = [400];
					break;
			}
		};
		if(statusIn != "*") {
			where.status = {
				$in: statusIn || []
			};
		} else {
			where.status = {
				$ne: 400
			};
		};

		if(subfilterPurchasePlan.view.applicant != '*') {
			where.applicant = {
				$in: subfilterPurchasePlan.view.applicant
			}
		};
		if(req.query.applicant && subfilterPurchasePlan.view.applicant == '*') where.applicant = req.query.applicant;

		async.series([
			function(callback) {
				let whereA = JSON.parse(JSON.stringify(where));
				whereA.status = {
					$in: subfilterPurchasePlan.edit.status || []
				};
				purchasePlan.count(whereA, function(err, length) {
					count.indexA = length;
					callback(err)
				})
			},
			function(callback) {
				let whereB = JSON.parse(JSON.stringify(where));
				whereB.status = {
					$in: subfilterPurchasePlan.view.status || []
				};
				if(whereB.status.$in == '*') {
					whereB.status = {
						$ne: 400
					}
				};
				purchasePlan.count(whereB, function(err, length) {
					count.indexB = length;
					callback(err)
				})
			},
			function(callback) {
				let whereC = JSON.parse(JSON.stringify(where));
				whereC.status = {
					$in: [400]
				};
				purchasePlan.count(whereC, function(err, length) {
					count.indexC = length;
					callback(err)
				})
			},
			function(callback) {
				console.log(where)
				purchasePlan.find(where).populate({
					path: 'applicant',
					select: 'name'
				}).populate({
					path: 'history.handler',
					select: 'data handler name'
				}).populate({
					path: 'details',
					select: 'product_id remarks',
					populate: [{
						path: 'product_id',
						select: 'store_sku name_cn'
					}]
				}).sort({
					createdAt: -1
				}).exec(function(err, docs) {
					docs.map(function(item) {
						let details = [];
						let peoples = {
							operator: [],
							supplyChain: [],
							applicant: item.applicant.name
						};
						let permission = {
							view: true,
							edit: false,
							review: false
						};
						item.details.map(function(detail) {
							details.push({
								log: detail.remarks,
								productName: detail.product_id ? detail.product_id.name_cn : null,
								productSku: detail.product_id ? detail.product_id.store_sku : 'SKU不存在'
							})
						});
						item.history.map(function(history) {
							if(Math.floor(history.data.beforeProcessing / 100) == 2) {
								if(peoples.operator.indexOf(history.handler.name) == -1) peoples.operator.push(history.handler.name)
							};
							if(Math.floor(history.data.beforeProcessing / 100) == 3) {
								if(peoples.supplyChain.indexOf(history.handler.name) == -1) peoples.supplyChain.push(history.handler.name)
							};
						});
						procedure(item, purchasePlanConfig).handlerTypes.map(function(config) {
							switch(req.agent.role.type) {
								case 'leader':
									// 如果当前item是他或者他的组员创建的 则可看
									if(subfilterPurchasePlan.view.applicant.indexOf(item.applicant._id.toString()) !== -1) {
										permission.view = true;
									};
									// 如果当前的状态是100或者101而且当前purchasePlan是他或者他的组员创建的 则可编辑
									if(subfilterPurchasePlan.edit.status.indexOf(item.status) !== -1 && subfilterPurchasePlan.view.applicant.indexOf(item.applicant._id.toString()) !== -1) {
										permission.edit = true;
									};
									break;
								case 'member':
									if(req.agent.id === item.applicant._id.toString()) {
										permission.view = true;
									};
									if(subfilterPurchasePlan.edit.status.indexOf(item.status) !== -1 && req.agent.id === item.applicant._id.toString()) {
										permission.edit = true;
									};
									break;
								case 'director':
									if(subfilterPurchasePlan.edit.status.indexOf(item.status) !== -1) {
										permission.review = true;
									};
									break;
								case 'manager':
									if(subfilterPurchasePlan.edit.status.indexOf(item.status) !== -1) {
										permission.review = true;
									};
									break;
								case 'COO':
									if(subfilterPurchasePlan.edit.status.indexOf(item.status) !== -1) {
										permission.review = true;
									};
									break;
								case 'CEO':
									if(subfilterPurchasePlan.edit.status.indexOf(item.status) !== -1) {
										permission.review = true;
									};
									break;
								case 'purchaseDirector':
									if(subfilterPurchasePlan.edit.status.indexOf(item.status) !== -1) {
										permission.review = true;
									};
									break;
								case 'CFO':
								case 'CMPO':
									if(subfilterPurchasePlan.edit.status.indexOf(item.status) !== -1) {
										permission.review = true;
									};
									break;
								case 'admin':
									permission.edit = true;
									permission.review = true;
									break;
							}
						});
						let operator = [];
						let supplyChain = [];
						item.history.map(function(history) {
							if(Math.floor(history.data.beforeProcessing / 100) == 2) {
								if(operator.indexOf(history.handler._id.toString()) == -1) operator.push(history.handler._id.toString())
							};
							if(Math.floor(history.data.beforeProcessing / 100) == 3) {
								if(supplyChain.indexOf(history.handler._id.toString()) == -1) supplyChain.push(history.handler._id.toString())
							};
						});
						if(req.query.operator && !req.query.supplyChain) {
							if(operator.indexOf(req.query.operator) != -1) {
								datas.push({
									details,
									peoples,
									permission,
									status: item.status,
									plan_id: item.plan_id
								})
							}
						} else if(!req.query.operator && req.query.supplyChain) {
							if(supplyChain.indexOf(req.query.supplyChain) != -1) {
								datas.push({
									details,
									peoples,
									permission,
									status: item.status,
									plan_id: item.plan_id
								})
							}
						} else if(req.query.operator && req.query.supplyChain) {
							if(operator.indexOf(req.query.operator) != -1 && supplyChain.indexOf(req.query.supplyChain) != -1) {
								datas.push({
									details,
									peoples,
									permission,
									status: item.status,
									plan_id: item.plan_id
								})
							}
						} else {
							datas.push({
								details,
								peoples,
								permission,
								status: item.status,
								plan_id: item.plan_id
							})
						}
					});
					callback(err)
				})
			}
		], function(err, results) {
			let add = false;
			if(['leader', 'member', 'admin'].indexOf(req.agent.role.type) != -1) add = true;

			//分页
			var pagination = [];
			for(var i = (currentPage - 1) * pageSize; i < currentPage * pageSize; i++) {
				if(datas[i]) pagination.push(datas[i])
			};

			res.send({
				add,
				count,
				datas: pagination,
				pageCount: Math.ceil(datas.length / pageSize)
			})
		})
	},

	// 首页返回peoples
	getPeoples: function(req, res) {
		let applicant = [];
		let operator = [];
		let supplyChain = [];
		purchasePlan.find({}, ['applicant', 'history']).populate({
			path: 'applicant',
			select: 'name'
		}).populate({
			path: 'history.handler',
			select: 'data handler name'
		}).exec(function(err, docs) {
			docs.map(function(item) {
				if(applicant.indexOf(item.applicant) == -1) {
					applicant.push(item.applicant)
				};
				item.history.map(function(history) {
					if(Math.floor(history.data.beforeProcessing / 100) == 2) {
						if(operator.indexOf(history.handler) == -1) operator.push(history.handler)
					};
					if(Math.floor(history.data.beforeProcessing / 100) == 3) {
						if(supplyChain.indexOf(history.handler) == -1) supplyChain.push(history.handler)
					};
				});
			});
			res.send({
				docs,
				applicant,
				operator,
				supplyChain
			})
		})
	},
	// 编辑页面展示
	editShow: function(req, res) {
		let planId = req.query.plan_id;
		purchasePlan.findOne({
			plan_id: planId
		}).populate('applicant').populate('history.handler').populate({
			path: 'details',
			populate: [{
				path: 'product_id'
			}, {
				path: 'supplier'
			}]
		}).exec(function(err, docs) {
			if(err) console.error(err);
			let datas = {
				plan_id: docs.plan_id,
				applicantName: docs.applicant.name,
				status: docs.status,
				details: [],
				reviews: []
			};
			docs.details.forEach(function(item, index) {
				var detail = {};
				detail._id = item._id;
				detail.productSku = item.product_id ? item.product_id.store_sku : 'SKU不存在';
				detail.productName = item.product_id ? item.product_id.name_cn : null;
				detail.product_id = item.product_id ? item.product_id._id : null;
				detail.local_storage = item.local_storage;
				detail.fba_storage = item.fba_storage;
				detail.average_7 = item.average_7;
				detail.average_30 = item.average_30;
				detail.expected_sales = item.expected_sales;
				detail.local_transport = item.local_transport;
				detail.abroad_transport = item.abroad_transport;
				detail.prepare_period = item.prepare_period;
				detail.safety_stock = item.safety_stock;
				detail.purchase_amount = item.purchase_amount;
				detail.supplierName = item.supplier.name;
				detail.supplierId = item.supplier._id;
				detail.unit_cost = item.unit_cost;
				detail.estimate_production_days = item.estimate_production_days;
				detail.least_amount = item.least_amount;
				detail.advance_pay_rate = item.advance_pay_rate;
				detail.first_time = item.first_time;
				detail.remarks = item.remarks;
				datas.details.push(detail);
			});
			// 处理采购计划状态和意见
			for(let i = 0; i < docs.history.length; i++) {
				let cur = {};
				if(docs.history[i].data.afterProcessing === 101) {
					cur.agree = 0;
					cur.log = docs.history[i].data.log;
					cur.status = docs.history[i].data.beforeProcessing;
					cur.name = docs.history[i].handler.name;
				} else {
					cur.agree = 1;
					cur.log = docs.history[i].data.log;
					cur.status = docs.history[i].data.beforeProcessing;
					cur.name = docs.history[i].handler.name;
				}
				datas.reviews.push(cur);
			}
			res.json(datas);
		});
	},
	// 编辑页面提交
	editSubmit: function(req, res) {
		// 当前purchaseDetail的_id
		let cur_id = [];
		// 数据库purchaseDetail的_id
		let db_id = [];
		// 编辑后共有的_id
		let pubArr = [];
		// 编辑后新建的_id
		let priArr = [];
		// 编辑后共有的_id对应的数据
		let pub = [];
		// 编辑后新建的_id对应的数据
		let pri = [];
		async.series([
			function(cb) {
				// 取当前的product_id数组
				req.body.details.forEach(function(item, index) {
					cur_id.push(item._id);
				});
				// 取数据库的product_id数组
				purchasePlan.findOne({
					plan_id: req.body.plan_id
				}).populate('details').exec(function(err, docs) {
					if(err) console.error(err);
					docs.details.forEach(function(item, index) {
						db_id.push(item._id.toString());
					});
					cb(null);
				});
			},
			// 删除product_id不存在的数据
			function(cb) {
				async.eachSeries(db_id, function(item, cb) {
					if(cur_id.indexOf(item) === -1) {
						purchasePlanDetail.remove({
							_id: item
						}).exec(function(err, docs) {
							if(err) console.error(err);
							cb(null);
						});
					} else {
						cb(null);
					}
				}, function(err) {
					if(err) console.error(err);
					cb(null);
				});
			},
			// 在purchasePlan删除product_id对应的pruchasePlanDetail的_id
			function(cb) {
				async.eachSeries(db_id, function(item, cb) {
					if(cur_id.indexOf(item) === -1) {
						purchasePlan.update({
							plan_id: req.body.plan_id
						}, {
							'$pull': {
								'details': item
							}
						}, function(err, docs) {
							if(err) console.error(err);
							cb(null);
						});
					} else {
						cb(null);
					}
				});
				cb(null);
			},
			// 数组处理，取交集和差集，交集(pub)update，差集(pri)create
			function(cb) {
				for(let i = 0; i < cur_id.length; i++) {
					if(db_id.indexOf(cur_id[i]) !== -1) {
						pubArr.push(cur_id[i]);
					} else {
						priArr.push(cur_id[i]);
					}
				}
				// 数据处理
				for(let i = 0; i < req.body.details.length; i++) {
					if(pubArr.indexOf(req.body.details[i]._id) !== -1) {
						let obj = {};
						obj._id = mongoose.Types.ObjectId(req.body.details[i]._id);
						obj.product_id = mongoose.Types.ObjectId(req.body.details[i].product_id);
						obj.plan_id = req.body.plan_id;
						obj.abroad_transport = req.body.details[i].abroad_transport;
						obj.advance_pay_rate = req.body.details[i].advance_pay_rate;
						obj.amount = req.body.details[i].amount;
						obj.average_7 = req.body.details[i].average_7;
						obj.average_30 = req.body.details[i].average_30;
						obj.estimate_production_days = req.body.details[i].estimate_production_days;
						obj.expected_sales = req.body.details[i].expected_sales;
						obj.fba_storage = req.body.details[i].fba_storage;
						obj.first_time = req.body.details[i].first_time;
						obj.least_amount = req.body.details[i].least_amount;
						obj.local_storage = req.body.details[i].local_storage;
						obj.local_transport = req.body.details[i].local_transport;
						obj.prepare_period = req.body.details[i].prepare_period;
						obj.purchase_amount = req.body.details[i].purchase_amount;
						obj.remarks = req.body.details[i].remarks;
						obj.safety_stock = req.body.details[i].safety_stock;
						obj.supplierId = mongoose.Types.ObjectId(req.body.details[i].supplierId);
						obj.total = req.body.details[i].total;
						obj.unit_cost = req.body.details[i].unit_cost;
						obj.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
						pub.push(obj);
					}
					if(priArr.indexOf(req.body.details[i]._id) !== -1) {
						let obj = {};
						obj._id = new mongoose.Types.ObjectId();
						obj.product_id = mongoose.Types.ObjectId(req.body.details[i].product_id);
						obj.plan_id = req.body.plan_id;
						obj.abroad_transport = req.body.details[i].abroad_transport;
						obj.advance_pay_rate = req.body.details[i].advance_pay_rate;
						obj.amount = req.body.details[i].amount;
						obj.average_7 = req.body.details[i].average_7;
						obj.average_30 = req.body.details[i].average_30;
						obj.estimate_production_days = req.body.details[i].estimate_production_days;
						obj.expected_sales = req.body.details[i].expected_sales;
						obj.fba_storage = req.body.details[i].fba_storage;
						obj.first_time = req.body.details[i].first_time;
						obj.least_amount = req.body.details[i].least_amount;
						obj.local_storage = req.body.details[i].local_storage;
						obj.local_transport = req.body.details[i].local_transport;
						obj.prepare_period = req.body.details[i].prepare_period;
						obj.purchase_amount = req.body.details[i].purchase_amount;
						obj.remarks = req.body.details[i].remarks;
						obj.safety_stock = req.body.details[i].safety_stock;
						obj.supplier = mongoose.Types.ObjectId(req.body.details[i].supplierId);
						obj.total = req.body.details[i].total;
						obj.unit_cost = req.body.details[i].unit_cost;
						obj.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
						obj.createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
						pri.push(obj);
					}
				}
				cb(null);
			},
			// 将共有的数据进行更新
			function(cb) {
				async.eachSeries(pub, function(item, cb) {
					purchasePlanDetail.update({
						_id: mongoose.Types.ObjectId(item._id)
					}, item, function(err, docs) {
						if(err) console.error(err);
						cb(null);
					});
				}, function(err) {
					if(err) console.error(err);
					cb(null);
				});
			},
			// 将新建的数据进行创建
			function(cb) {
				async.eachSeries(pri, function(item, cb) {
					purchasePlanDetail.create(item, function(err, docs) {
						if(err) console.error(err);
						purchasePlan.update({
							plan_id: req.body.plan_id
						}, {
							$addToSet: {
								'details': item._id
							}
						}, function(err, docs) {
							if(err) console.error(err);
							cb(null);
						});
					});
				}, function(err) {
					if(err) console.error(err);
					cb(null);
				});
			},
			// 更新状态
			function(cb) {
				purchasePlan.update({
					plan_id: req.body.plan_id
				}, {
					status: req.body.status
				}, function(err, docs) {
					if(err) console.error(err);
					res.json('ok');
				});
			}
		]);
	},
	// 审核
	review: function(req, res) {
		var subfilterPurchasePlan = req.subfilterPurchasePlan || {};
		var purchasePlanConfig = req.purchasePlanConfig || [];
		let curStatus = req.body.status;
		let review = {
			data: {}
		};

		var item = {
			total: req.body.total,
			details: req.body.details,
			status: curStatus
		};

		let thisConfig = procedure(item, purchasePlanConfig);

		if(parseInt(req.body.review.agree) === 1) {
			if(thisConfig.statuses.indexOf(curStatus) !== -1) {
				if(thisConfig.statuses.length === thisConfig.statuses.indexOf(curStatus) + 1) {
					review.data.afterProcessing = 400;
				} else if(curStatus === 200) {
					review.data.afterProcessing = 210;
				} else {
					review.data.afterProcessing = thisConfig.statuses[thisConfig.statuses.indexOf(curStatus) + 1];
				}
			} else if(curStatus === 101) {
				review.data.afterProcessing = 200;
			} else {
				throw new Error('status error');
			}
		} else {
			review.data.afterProcessing = 101;
		}
		review.data.beforeProcessing = curStatus;
		review.data.log = req.body.review.remark;
		review.handler = mongoose.Types.ObjectId(req.agent.id);
		review.time = moment().format('YYYY-MM-DD HH:mm:ss');
		purchasePlan.update({
			plan_id: req.body.plan_id
		}, {
			status: review.data.afterProcessing,
			'$push': {
				'history': review
			},
			updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
		}, function(err, docs) {
			if(err) console.error(err);
			res.send(true);
		});
	}
};