var debug = require('debug')('smartdo:controller:purchase');
var ServerError = require('../errors/server-error');
var async = require('async');
var moment = require('moment');
var InvincibleDB = require('../models/invincible');
var Purchase = InvincibleDB.getModel('purchase');
var PurchaseDetail = InvincibleDB.getModel('purchaseDetail');
var Product = InvincibleDB.getModel('product');
var Merchandise = InvincibleDB.getModel('merchandise');
var DailySell = InvincibleDB.getModel('daily_sell');
var StoresJournals = InvincibleDB.getModel('StoresJournals');
var CustomerReturns = InvincibleDB.getModel('customer_returns');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;
var Utils = Shared.Utils;
var dealErr = require('../errors/controller-error');

module.exports = {
	name: "purchase",

	purchaseList: function(req, res, next) {
		var current = req.query.currentPage || 1;
		var pageSize = req.query.pageSize || 10;
		var results = {};
		var detIDRequire = [];
		var purchases = [];
		var storeSkuReq = [];
		var DTLID2ALL = {};
		var NotFound = true;
		var DTLFindIDs = [];
		//var remark = {};

		async.series([
				// 找出对应商品中文名
				function(callB) {
					if(req.query.proNameCN) {
						var regProNameCn = new RegExp(req.query.proNameCN);
						Product.find({
							name_cn: regProNameCn
						}, function(err, proListFound) {
							if(dealErr.findErr(err, res)) return callB(err);
							if(proListFound.length > 0) {
								proListFound.forEach(function(productFound) {
									storeSkuReq.push(productFound.store_sku)
								});
							} else {
								NotFound = false;
							}
							callB(null);
						})
					} else {
						callB(null);
					}
				},

				// 找出订单详情ID
				function(callB) {
					if(storeSkuReq.length > 0) {
						PurchaseDetail.aggregate([{
								$match: {
									store_sku: {
										$in: storeSkuReq
									}
								}
							},
							{
								$sort: {
									store_sku: 1
								}
							},
							{
								$group: {
									_id: "$_id"
								}
							}
						], function(err, detListFound) {
							if(dealErr.findErr(err, res)) return callB(err);
							if(detListFound.length > 0) {
								detListFound.forEach(function(detFound) {
									detIDRequire.push(detFound._id);
								});
							} else {
								NotFound = false;
							}
							callB(null);
						})
					} else {
						callB(null);
					}
				},
				// 根据库存sku找出订单
				function(callB) {
					var findRequire = {};
					if(req.query.storeSku) findRequire.store_sku = new RegExp(req.query.storeSku);
					PurchaseDetail.find(findRequire, function(err, detListFound) {
						if(dealErr.findErr(err, res)) return callB(err);
						if(detListFound.length > 0) {
							detListFound.forEach(function(detFound) {
								if(req.query.storeSku) {
									if(detIDRequire.indexOf(detFound._id) == -1) detIDRequire.push(detFound._id);
								}
								//remark[detFound._id] = {};
								//remark[detFound._id][detFound.store_sku] = detFound.remarks;
							})
						} else {
							NotFound = false;
						}
						callB(null)
					})
				},

				// 找出对应sku和中英文名1
				function(callB) {
					var findRequire = {};
					if(detIDRequire.length > 0) {
						findRequire = {
							purDetails: {
								$in: detIDRequire
							}
						};
						Purchase.aggregate([{
								$match: findRequire
							},
							{
								$group: {
									_id: {
										_id: "$_id",
										purDetails: "$purDetails"
									}
								}
							}
						], function(err, ordersFound) {
							if(dealErr.findErr(err, res)) return callB(err);
							ordersFound.forEach(function(orderFound) {
								if(orderFound._id.purDetails) {
									orderFound._id.purDetails.forEach(function(DTLIDs) {
										DTLFindIDs.push(DTLIDs)
									});
								}
							});
							callB(null)
						})
					} else {
						callB(null);
					}
				},

				// 找出对应sku和中英文名2
				function(callB) {
					var findRequire = {};
					if(DTLFindIDs.length > 0) findRequire = {
						_id: {
							$in: DTLFindIDs
						}
					};
					PurchaseDetail.aggregate([{
							$match: findRequire
						},
						{
							$group: {
								_id: {
									_id: "$_id",
									store_sku: "$store_sku"
								}
							}
						}
					], function(err, storeSkusFound) {
						if(dealErr.findErr(err, res)) return callB(err);
						var storeSkusDis = [];
						var productIDs = [];
						var sku2prodID = {};
						var prodID2name = {};
						var prodID2nameCN = {};
						storeSkusFound.forEach(function(storeSkuObject) {
							DTLID2ALL[storeSkuObject._id._id] = {};
							DTLID2ALL[storeSkuObject._id._id].storeSku = storeSkuObject._id.store_sku;
							storeSkusDis.push(storeSkuObject._id.store_sku);
						});
						Product.aggregate([{
							$group: {
								_id: {
									product_id: "$_id",
									store_sku: "$store_sku",
									name_cn: "$name_cn"
								}
							}
						}], function(err, prodAgFound) {
							if(dealErr.findErr(err, res)) return callB(err);
							prodAgFound.forEach(function(prodFound) {
								productIDs.push(prodFound._id.product_id);
								prodID2nameCN[prodFound._id.product_id.toString()] = prodFound._id.name_cn;
								sku2prodID[prodFound._id.store_sku] = prodFound._id.product_id.toString();
							});
							Merchandise.aggregate([{
									$match: {
										product_id: {
											$in: productIDs
										}
									}
								},
								{
									$group: {
										_id: {
											product_id: "$product_id",
											name: "$name"
										}
									}
								}
							], function(err, merchandisesFound) {
								if(dealErr.findErr(err, res)) return callB(err);
								merchandisesFound.forEach(function(merFound) {
									prodID2name[merFound._id.product_id.toString()] = merFound._id.name;
								});
								for(var key in DTLID2ALL) {
									DTLID2ALL[key].name = "";
									DTLID2ALL[key].nameCN = "";
									DTLID2ALL[key].name = prodID2name[sku2prodID[DTLID2ALL[key].storeSku]];
									DTLID2ALL[key].nameCN = prodID2nameCN[sku2prodID[DTLID2ALL[key].storeSku]];
								}
								callB(null);
							})
						})
					})
				},

				// 订单列表
				function(callB) {
					if(NotFound) {
						var findRequire = {};
						if(req.query.orderNumber) findRequire.order_number = new RegExp(req.query.orderNumber);
						if(req.query.contractNumber) findRequire.contract_number = new RegExp(req.query.contractNumber);
						if(req.query.supplierId) findRequire.supplier = mongoose.Types.ObjectId(req.query.supplierId);
						if(req.query.storeSku || req.query.proNameCN) findRequire.purDetails = {
							$in: detIDRequire
						};
						if(req.query.orderStatus) findRequire.order_status = Utils.toNumber(req.query.orderStatus);

						Purchase.find(findRequire)
							.populate("supplier")
							.sort({
								contract_number: -1
							})
							.skip((current - 1) * pageSize)
							.limit(parseInt(pageSize + ""))
							.exec(function(err, purListFound) {
								if(dealErr.findErr(err, res)) return callB(err);
								if(purListFound) {
									var skuDetail = {};
									purListFound.forEach(function(purchaseFound) {
										var supplierName = '';
										if(purchaseFound.supplier) supplierName = purchaseFound.supplier.name;
										purchaseFound.order_status = (purchaseFound.order_status || '').toString();

										skuDetail[purchaseFound.order_number] = [];
										purchaseFound.purDetails.forEach(function(detailID) {
											skuDetail[purchaseFound.order_number].push(DTLID2ALL[detailID]);
										});
										var purResult = {
											"orderNumber": purchaseFound.order_number,
											"contractNumber": purchaseFound.contract_number,
											"supplierName": supplierName,
											"purTotalPrice": purchaseFound.purchase_total_price,
											"orderStatus": purchaseFound.order_status,
											"isDeclare": purchaseFound.isDeclare + "",
											"skuDetail": skuDetail[purchaseFound.order_number]
										};
										purchases.push(purResult);
									});
									results.purchases = purchases;
								}
								Purchase.count(findRequire, function(err, purCount) {
									if(dealErr.findErr(err, res)) return callB(err);
									results.pageTotal = purCount;
									callB(null)
								})
							})
					} else {
						callB(null);
					}
				}
			],
			function(err) {
				if(err) {
					debug(new Error(err));
					return;
				}
				results = Utils.pakoZip(JSON.stringify(results));
				res.success(results);
			}
		);
	},

	purchaseSave: function(req, res, next) {
		var findRequire = {};
		findRequire.order_number = req.body.orderNumber;
		// 库存sku不能有重复
		var skuNotRepeat = true;
		var allSku = [];
		var firstBuy;
		if(req.body.purDetails) {
			req.body.purDetails.forEach(function(purDetail) {
				if(allSku.indexOf(purDetail.storeSku) == -1) {
					allSku.push(purDetail.storeSku);
				} else {
					skuNotRepeat = false;
				}
			})
		}

		Purchase.findOne(findRequire, function(err, purOne) {
			if(dealErr.findErr(err, res)) return debug(new Error(err));
			if(!purOne && skuNotRepeat) {
				var arr = req.body.purDetails || [];
				var skuIds = [];
				var orderStatus = 0;
				var purTotalPrice = 0;
				if(req.body.orderStatus) orderStatus = Utils.toNumber(req.body.orderStatus);

				var iterator = function(json, cb) {
					if(json == null || json.storeSku == null) {
						cb(null);
						return;
					}

					var unitPrice = 0;
					if(json.unitPrice) unitPrice = Utils.toNumber(json.unitPrice);
					var purQuantity = 0;
					if(json.purQuantity) purQuantity = Utils.toNumber(json.purQuantity);
					var totalPrice = 0;
					if(json.totalPrice) totalPrice = Utils.toNumber(json.totalPrice);
					purTotalPrice += totalPrice;
					var delQuantity = 0;
					if(json.delQuantity) delQuantity = Utils.toNumber(json.delQuantity);
					// 不为负数
					if(unitPrice < 0 && purQuantity <= 0 && totalPrice < 0 && delQuantity < 0) {
						cb(null);
						res.error(ERROR_CODE.INVALID_ARGUMENT);
						return;
					}

					// 往下执行
					async.series([
							// 是否首次购买
							function(callB) {
								firstBuy = true;
								PurchaseDetail.findOne({
									store_sku: json.storeSku
								}, function(err, purOneFound) {
									if(dealErr.findErr(err, res)) return callB(err);
									if(purOneFound) {
										firstBuy = false;
										if(purOneFound.first_buy) {
											purOneFound.first_buy = false;
											purOneFound.save(function(err) {
												if(dealErr.createErr(err, res)) return callB(err);
												callB(null);
											})
										} else {
											callB(null);
										}
									} else {
										callB(null);
									}
								})
							},
							// 添加订单详情
							function(callB) {
								var _id = new mongoose.Types.ObjectId();
								var newPurDetail = new PurchaseDetail({
									_id: _id,
									store_sku: json.storeSku, // 库存SKU
									unit_price: unitPrice, // 单价
									purchase_quantity: purQuantity, // 采购数量
									total_price: totalPrice, // 总金额(不含运费)
									deliver_total: delQuantity, // 已交货数量
									logistics_number: json.logNumber, // 物流追踪单号
									salesman: json.salesman, // 业务员
									first_buy: firstBuy,
									updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
									createdAt: moment().format('YYYY-MM-DD HH:mm:ss')
								});
								if(json.conCovDate && (json.conCovDate.length != 0)) newPurDetail.contract_covenant_date = json.conCovDate; // 合同约定交期
								if(json.delQuantity && json.deliverDate) {
									var DELVRQuantity = [];
									DELVRQuantity.push(delQuantity);
									var deliverDate = [];
									deliverDate.push(json.deliverDate);
									newPurDetail.deliver_quantity = DELVRQuantity; // 交货数量
									newPurDetail.deliver_date = deliverDate; // 实际交期
								}
								if(json.remark) newPurDetail.remarks = (moment().format('YYYY/MM/DD') + "：" + json.remark.toString());
								newPurDetail.save(function(err) {
									if(dealErr.createErr(err, res)) return callB(err);
									skuIds.push(_id);
									callB(null);
								});
							}
						],
						function(err) {
							if(err) {
								cb(err);
								return;
							}
							cb(null);
						}
					);
				};

				async.eachSeries(arr, iterator, function(err) {
					if(err != null) {
						debug(err);
						return;
					}
					// 添加采购单
					if(req.body.freight) {
						if(typeof(req.body.freight) != "number") {
							req.body.freight = Utils.toNumber(req.body.freight);
						}
						purTotalPrice += req.body.freight;
					}

					var newPurchase = new Purchase({
						_id: new mongoose.Types.ObjectId(),
						order_number: req.body.orderNumber, // 订单号
						contract_number: req.body.contractNumber, // 合同号
						supplier: mongoose.Types.ObjectId(req.body.supplierId), // 供应商
						buyer: req.body.buyer || "", // 采购员
						purDetails: skuIds, // 库存SKU的ID
						order_status: orderStatus, // 订单基本状态
						purchase_total_price: purTotalPrice, // 订单总金额
						pickup_way: req.body.pickupWay || "", // 提货方式
						isDeclare: Utils.toNumber(req.body.isDeclare || ""), // 是否报关
						updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
						createdAt: moment().format('YYYY-MM-DD HH:mm:ss')
					});
					if(req.body.orderTime) newPurchase.order_time = moment(req.body.orderTime).format('YYYY-MM-DD'); // 下单时间
					newPurchase.save(function(err) {
						if(dealErr.createErr(err, res)) return debug(new Error(err));
						res.success();
					});
				});
			} else {
				res.error(ERROR_CODE.INVALID_ARGUMENT);
			}
		})
	},

	productList: function(req, res, next) {
		var findRequire = {};
		Product.find(findRequire)
			.sort({
				store_sku: 1
			})
			.exec(function(err, proListFound) {
				if(dealErr.findErr(err, res)) return debug(new Error(err));
				// 英文名
				Merchandise.find(findRequire, function(err, merListFound) {
					if(dealErr.findErr(err, res)) return debug(new Error(err));
					var results = [];
					var prodID2NameEn = {};
					if(merListFound) {
						merListFound.forEach(function(merFound) {
							prodID2NameEn[merFound.product_id] = merFound.name;
						})
					}
					if(proListFound) {
						proListFound.forEach(function(proFound) {
							var result = {
								id: proFound._id,
								storeSku: proFound.store_sku,
								nameCN: proFound.name_cn,
								nameEn: prodID2NameEn[proFound._id]
							};
							results.push(result);
						})
					}
					res.success(results);
				});
			})
	},

	purchaseOne: function(req, res, next) {
		var findRequire = {};
		findRequire.order_number = req.query.orderNumber;
		Purchase.findOne(findRequire)
			.populate('supplier')
			.populate('purDetails')
			.exec(function(err, purOneFound) {
				if(dealErr.findErr(err, res)) return debug(new Error(err));
				if(purOneFound) {
					if(purOneFound.supplier.name) purOneFound.supplier._id = purOneFound.supplier._id.toString();
					var orderStatus = (purOneFound.order_status || "").toString();
					var purResult = {
						"purchaseId": purOneFound._id,
						"orderNumber": purOneFound.order_number,
						"contractNumber": purOneFound.contract_number,
						"orderTime": purOneFound.order_time,
						"supplier": {
							supplierId: purOneFound.supplier._id,
							supplierName: purOneFound.supplier.name
						},
						"buyer": purOneFound.buyer,
						"orderStatus": orderStatus,
						"pickupWay": purOneFound.pickup_way,
						"isDeclare": purOneFound.isDeclare + "",
						"purTotalPrice": purOneFound.purchase_total_price,
						"purDetails": []
					};

					var purDetails = [];
					findRequire = {};
					findRequire.store_sku = {};
					findRequire.store_sku.$in = [];
					for(var m = 0; m < purOneFound.purDetails.length; m++) {
						var detFound = (purOneFound.purDetails)[m];
						var deliverDate;
						if(detFound.deliver_date.length > 0) {
							deliverDate = moment("1970-01-01").format('YYYY-MM-DD');
							for(var a = 0; a < detFound.deliver_date.length; a++) {
								if(deliverDate < detFound.deliver_date[a]) deliverDate = detFound.deliver_date[a]
							}
						}
						var purDetail = {
							"storeSkuId": detFound._id,
							"storeSku": detFound.store_sku,
							"unitPrice": detFound.unit_price || 0,
							"purQuantity": detFound.purchase_quantity || 0,
							"totalPrice": detFound.total_price,
							"conCovDate": moment(detFound.contract_covenant_date).format('YYYY-MM-DD'),
							"delQuantity": detFound.deliver_total || 0,
							"deliverDate": deliverDate,
							"remarks": detFound.remarks,
							"salesman": detFound.salesman || "",
							"logNumber": detFound.logistics_number || ""
						};
						purDetails.push(purDetail);
						findRequire.store_sku.$in.push(detFound.store_sku);
					}

					var storeSku2nameCN = {};
					var storeSku2nameEN = {};

					async.series([
							// 找出storeSku中文名
							function(callB) {
								Product.find(findRequire, function(err, proListFound) {
									if(dealErr.findErr(err, res)) return callB(err);
									if(proListFound) {
										proListFound.forEach(function(productFound) {
											storeSku2nameCN[productFound.store_sku] = productFound.name_cn;
										})
									}
									callB(null);
								})
							},

							// 找出storeSku英文名
							function(callB) {
								Merchandise.find(findRequire, function(err, merListFound) {
									if(dealErr.findErr(err, res)) return callB(err);
									if(merListFound) {
										merListFound.forEach(function(merchandiseFound) {
											storeSku2nameEN[merchandiseFound.store_sku] = merchandiseFound.name;
										})
									}
									callB(null);
								})
							},

							function(callB) {
								if(purDetails.length > 0) {
									purDetails.forEach(function(detailResult) {
										detailResult.proNameCN = storeSku2nameCN[detailResult.storeSku];
										detailResult.proNameEN = storeSku2nameEN[detailResult.storeSku];
									})
								}
								purResult.purDetails = purDetails;
								callB(null);
							}
						],
						function(err) {
							if(err) {
								debug(new Error(err));
								return;
							}
							res.success(purResult);
						})
				} else {
					res.error(ERROR_CODE.NOT_EXISTS);
					return;
				}
			})
	},

	purUpdate: function(req, res, next) {
		var findRequire = {};
		findRequire._id = mongoose.Types.ObjectId(req.body.purchaseId);
		// 库存sku不能有重复
		var skuNotRepeat = true;
		if(req.body.purDetails) {
			var allSku = [];
			req.body.purDetails.forEach(function(purDetail) {
				if(allSku.indexOf(purDetail.storeSku) == -1) {
					allSku.push(purDetail.storeSku);
				} else {
					skuNotRepeat = false;
				}
			})
		}
		Purchase.findOne(findRequire, function(err, purOneFound) {
			if(dealErr.findErr(err, res)) return debug(new Error(err));
			if(purOneFound && skuNotRepeat) {
				if(req.body.orderStatus) req.body.orderStatus = Utils.toNumber(req.body.orderStatus);

				purOneFound.buyer = req.body.buyer || "";
				purOneFound.pickup_way = req.body.pickupWay || "";
				purOneFound.isDeclare = Utils.toNumber(req.body.isDeclare);

				// 编辑传入详情ID
				var editDelIDs = [];
				if(req.body.purDetails) {
					req.body.purDetails.forEach(function(purDetail) {
						if(purDetail.storeSkuId) editDelIDs.push(mongoose.Types.ObjectId(purDetail.storeSkuId));
					})
				}

				// 共同详情ID
				var bothIDs = [];
				// 订单状态为待处理
				if(req.body.orderStatus == "10") {
					purOneFound.order_number = req.body.orderNumber;
					purOneFound.contract_number = req.body.contractNumber;
					purOneFound.supplier = mongoose.Types.ObjectId(req.body.supplierId);
					purOneFound.order_time = req.body.orderTime;
				}
				if(purOneFound.purDetails) {
					var deleteIterator = function(storeSkuId, cb) {
						// 执行循环
						async.series([
								// 删除已经不存在的订单详情
								function(callB) {
									var IsDel = true;
									for(var m = 0; m < editDelIDs.length; m++) {
										if(editDelIDs[m].toString() == storeSkuId.toString()) {
											IsDel = false;
											break;
										}
									}
									if(IsDel) {
										PurchaseDetail.remove({
											_id: storeSkuId
										}, function(err) {
											if(dealErr.removeErr(err, res)) return callB(err);
											callB(null);
										})
									} else {
										bothIDs.push(storeSkuId);
										callB(null);
									}
								}
							],
							function(err) {
								if(err) {
									cb(err);
									return;
								}
								cb(null)
							}
						);
					};
					async.eachSeries(purOneFound.purDetails, deleteIterator, function(err) {
						if(err != null) {
							debug(err);
							return;
						}
						findRequire = {};
						findRequire._id = {
							$in: bothIDs
						};
						PurchaseDetail.find(findRequire, function(err, detListFound) {
							if(dealErr.findErr(err, res)) return debug(new Error(err));

							var arr = req.body.purDetails || [];
							var purTotalPrice = 0;

							var iterator = function(json, cb) {
								if(json == null || json.storeSku == null) {
									cb(null);
									return;
								}

								var unitPrice = 0;
								if(json.unitPrice) unitPrice = Utils.toNumber(json.unitPrice + "");
								var purQuantity = 0;
								if(json.purQuantity) purQuantity = Utils.toNumber(json.purQuantity + "");
								var totalPrice = 0;
								if(json.totalPrice) totalPrice = Utils.toNumber(json.totalPrice + "");
								var delQuantity = 0;
								if(json.delQuantity) delQuantity = Utils.toNumber(json.delQuantity + "");
								purTotalPrice += totalPrice;
								var DELVRQuantity = [];
								DELVRQuantity.push(delQuantity);
								var deliverDate = [];
								deliverDate.push(json.deliverDate);
								// 不为负数
								if(unitPrice < 0 && purQuantity <= 0 && totalPrice < 0 && delQuantity <= 0) {
									cb(null);
									res.error(ERROR_CODE.INVALID_ARGUMENT);
									return;
								}

								// 执行循环
								async.series([
										// 添加或修改
										function(callB) {
											var IsAdd = true;
											for(var l = 0; l < bothIDs.length; l++) {
												if(json.storeSkuId) {
													if(bothIDs[l].toString() == json.storeSkuId.toString()) {
														IsAdd = false;
														break;
													}
												}
											}
											if(IsAdd) {
												// 添加
												var _id = new mongoose.Types.ObjectId();
												var newPurDetail = new PurchaseDetail({
													_id: _id,
													store_sku: json.storeSku, // 库存SKU
													unit_price: unitPrice, // 单价
													purchase_quantity: purQuantity, // 采购数量
													total_price: totalPrice, // 总金额(不含运费)
													deliver_total: delQuantity, // 已交货数量
													contract_covenant_date: json.conCovDate, // 合同约定交期
													logistics_number: json.logNumber, // 物流追踪单号
													salesman: json.salesman, // 业务员
													updatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
													createdAt: moment().format('YYYY-MM-DD HH:mm:ss')
												});
												if(json.delQuantity && json.deliverDate) {
													newPurDetail.deliver_quantity = DELVRQuantity; // 交货数量
													newPurDetail.deliver_date = deliverDate; // 实际交期
												}
												if(json.remark) newPurDetail.remarks.push(moment().format('YYYY/MM/DD') + "：" + json.remark.toString());
												newPurDetail.save(function(err) {
													if(dealErr.createErr(err, res)) return callB(err);
													editDelIDs.push(_id);
													callB(null);
												})
											} else {
												// 修改
												if(detListFound) {
													var IDNumbers = 0;
													for(var j = 0; j < detListFound.length; j++) {
														if(detListFound[j]._id.toString() == json.storeSkuId) {
															IDNumbers = j;
															break;
														}
													}
													var detFound = detListFound[IDNumbers];
													detFound.logistics_number = json.logNumber;
													detFound.salesman = json.salesman;
													if(json.remark) detFound.remarks.push(moment().format('YYYY/MM/DD') + "：" + json.remark.toString());
													if(req.body.orderStatus == 10) {
														detFound.store_sku = json.storeSku; // 库存SKU
														detFound.unit_price = json.unitPrice; // 单价
														detFound.purchase_quantity = json.purQuantity; // 采购数量
														detFound.total_price = json.totalPrice; // 总金额(含运费)
														if(json.conCovDate && json.conCovDate.length != 0) detFound.contract_covenant_date = json.conCovDate; // 合同约定交期
														detFound.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
														if(json.delQuantity && json.deliverDate) {
															detFound.deliver_quantity = DELVRQuantity; // 交货数量
															detFound.deliver_date = deliverDate; // 实际交期
															detFound.deliver_total = json.delQuantity; // 已交货数量
														}
													}

													detFound.save(function(err) {
														if(dealErr.updateErr(err, res)) return callB(err);
														callB(null);
													})
												}
											}
										}
									],
									function(err) {
										if(err) {
											cb(err);
											return;
										}
										cb(null);
									}
								);
							};

							async.eachSeries(arr, iterator, function(err) {
								if(err != null) {
									debug(err);
									return;
								}
								purOneFound.purchase_total_price = purTotalPrice;
								if(req.body.freight) {
									if(typeof(req.body.freight) != "number") {
										req.body.freight = Utils.toNumber(req.body.freight);
									}
									purOneFound.purchase_total_price += req.body.freight;
								}
								for(var k = 0; k < editDelIDs.length; k++) {
									editDelIDs[k] = mongoose.Types.ObjectId(editDelIDs[k]);
								}
								purOneFound.purDetails = editDelIDs;
								purOneFound.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
								purOneFound.save(function(err) {
									if(dealErr.updateErr(err, res)) return debug(new Error(err));
									res.success();
								})
							});
						})
					});
				}
			} else {
				res.error(ERROR_CODE.INVALID_ARGUMENT);
			}
		})
	},

	detailList: function(req, res, next) {
		var findRequire = {};
		findRequire.order_number = req.query.orderNumber;
		Purchase.findOne(findRequire)
			.populate('supplier')
			.populate('purDetails')
			.exec(function(err, purOneFound) {
				if(dealErr.findErr(err, res)) return debug(new Error(err));
				var orderStatus = (purOneFound.order_status || "").toString();
				var purchase = {
					"orderNumber": purOneFound.order_number,
					"contractNumber": purOneFound.contract_number,
					"orderTime": moment(purOneFound.order_time).format('YYYY-MM-DD'),
					"supplierName": purOneFound.supplier.name,
					"buyer": purOneFound.buyer,
					"orderStatus": orderStatus,
					"purTotalPrice": purOneFound.purchase_total_price,
					"pickupWay": purOneFound.pickup_way,
					"isDeclare": purOneFound.isDeclare + ""
				};
				var purDetails = [];
				findRequire = {};
				findRequire.store_sku = {};
				findRequire.store_sku.$in = [];
				for(var m = 0; m < purOneFound.purDetails.length; m++) {
					var detFound = (purOneFound.purDetails)[m];
					var deliverDate;
					if(detFound.deliver_date.length > 0) {
						deliverDate = moment("1970-01-01").format('YYYY-MM-DD');
						for(var a = 0; a < detFound.deliver_date.length; a++) {
							if(deliverDate < detFound.deliver_date[a]) deliverDate = detFound.deliver_date[a]
						}
					}
					var purDetail = {
						"storeSku": detFound.store_sku,
						"unitPrice": detFound.unit_price || 0,
						"purQuantity": detFound.purchase_quantity || 0,
						"totalPrice": detFound.total_price,
						"conCovDate": moment(detFound.contract_covenant_date).format('YYYY-MM-DD'),
						"deliverTotal": detFound.deliver_total || 0,
						"deliverDate": deliverDate,
						"remarks": detFound.remarks,
						"salesman": detFound.salesman || "",
						"logNumber": detFound.logistics_number || ""
					};
					purDetails.push(purDetail);
					findRequire.store_sku.$in.push(detFound.store_sku);
				}
				var storeSku2nameCN = {};
				var storeSku2nameEN = {};
				async.series([
						// 找出对应商品中文名
						function(callB) {
							Product.find(findRequire, function(err, proListFound) {
								if(dealErr.findErr(err, res)) return callB(err);
								if(proListFound) {
									proListFound.forEach(function(productFound) {
										storeSku2nameCN[productFound.store_sku] = productFound.name_cn;
									})
								}
								callB(null);
							})
						},
						// 找出storeSku英文名
						function(callB) {
							Merchandise.find(findRequire, function(err, merListFound) {
								if(dealErr.findErr(err, res)) return callB(err);
								if(merListFound) {
									merListFound.forEach(function(merchandiseFound) {
										storeSku2nameEN[merchandiseFound.store_sku] = merchandiseFound.name;
									})
								}
								callB(null);
							})
						},

						function(callB) {
							if(purDetails.length > 0) {
								purDetails.forEach(function(purDetail) {
									purDetail.proNameCN = storeSku2nameCN[purDetail.storeSku];
									purDetail.proNameEN = storeSku2nameEN[purDetail.storeSku];
								})
							}
							purchase.purDetails = purDetails;
							callB(null);
						}
					],
					function(err) {
						if(err) {
							debug(new Error(err));
							return;
						}
						res.success(purchase);
					}
				);
			})
	},

	statusList: function(req, res, next) {
		var findRequire = {};
		findRequire.order_number = req.query.orderNumber;
		Purchase.findOne(findRequire).populate("purDetails").exec(function(err, purOneFound) {
			if(dealErr.findErr(err, res)) return debug(new Error(err));
			if(purOneFound) {
				if(!purOneFound.order_status) res.error(ERROR_CODE.NOT_EXISTS);
				var follow = {
					orderStatus: purOneFound.order_status.toString(),
					purDetails: []
				};
				findRequire = {};
				findRequire.store_sku = [];
				var purDetails = [];
				purOneFound.purDetails.forEach(function(detFound) {
					findRequire.store_sku.push(detFound.store_sku);
					var purDetail = {
						"deliverId": detFound._id,
						"storeSku": detFound.store_sku,
						"purQuantity": detFound.purchase_quantity,
						"remarks": detFound.remarks,
						"deliverTotal": detFound.deliver_total
					};
					purDetails.push(purDetail);
				});
				Product.find(findRequire, function(err, proListFound) {
					if(dealErr.findErr(err, res)) return debug(new Error(err));

					var storeSku2nameCN = {};
					if(proListFound) {
						proListFound.forEach(function(proOneFound) {
							storeSku2nameCN[proOneFound.store_sku] = proOneFound.name_cn;
						})
					}
					purDetails.forEach(function(purDetail) {
						purDetail.proNameCN = storeSku2nameCN[purDetail.storeSku]
					});
					follow.purDetails = purDetails;
					res.success(follow);
				});
			} else {
				res.error(ERROR_CODE.NOT_EXISTS);
			}
		})
	},

	statusUpdate: function(req, res, next) {
		var findRequire = {};
		findRequire.order_number = req.body.orderNumber;
		Purchase.findOne(findRequire, function(err, purOneFound) {
			if(dealErr.findErr(err, res)) return debug(new Error(err));

			if(purOneFound) {
				purOneFound.order_status = Utils.toNumber(req.body.orderStatus);
				purOneFound.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
				var arr = req.body.delivers || [];

				var iterator = function(json, cb) {
					var delQuantity = 0;
					if(json.delQuantity) delQuantity = Utils.toNumber(json.delQuantity + "");
					// 不为负数
					if(delQuantity < 0) {
						cb(null);
						res.error(ERROR_CODE.INVALID_ARGUMENT);
						return;
					}

					async.series([
							function(callB) {
								PurchaseDetail.findOne({
									_id: mongoose.Types.ObjectId(json.deliverId)
								}, function(err, detOneFound) {
									if(dealErr.findErr(err, res)) return callB(err);
									if(detOneFound) {
										var deliverDate = [];
										var DELVRQuantity = [];
										if(json.deliverDate && json.delQuantity) {
											deliverDate.push(moment(json.deliverDate).format('YYYY-MM-DD'));
											DELVRQuantity.push(delQuantity);
											for(var m = 0; m < detOneFound.deliver_date.length; m++) {
												deliverDate.push(detOneFound.deliver_date[m]);
												DELVRQuantity.push(detOneFound.deliver_quantity[m]);
											}
											detOneFound.deliver_date = deliverDate;
											detOneFound.deliver_quantity = DELVRQuantity;
											detOneFound.deliver_total += delQuantity;
										}
										detOneFound.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
										if(json.remark) detOneFound.remarks.push(moment().format('YYYY/MM/DD') + "：" + json.remark);
										if(detOneFound.purchase_quantity >= detOneFound.deliver_total) {
											detOneFound.save(function(err) {
												if(dealErr.updateErr(err, res)) return callB(err);
												callB(null);
											})
										} else {
											res.error(ERROR_CODE.OVER_NUMBER);
											callB(null);
										}
									} else {
										res.error(ERROR_CODE.NOT_EXISTS);
										callB(null);
									}
								})
							}
						],
						function(err) {
							if(err) {
								cb(err);
								return;
							}
							cb(null);
						})
				};

				async.eachSeries(arr, iterator, function(err) {
					if(err != null) {
						debug(err);
						return;
					}
					purOneFound.save(function(err) {
						if(dealErr.updateErr(err, res)) return debug(new Error(err));
						res.success();
					})
				});

			} else {
				res.error(ERROR_CODE.NOT_EXISTS);
			}
		})
	},

	purTotal: function(req, res, next) {
		var storeIn = [];
		var storeIdIn = [];
		var id2DTL = {};
		var id2storeSku = {};
		var _id2id = {};
		var key = {};
		var purTotal = {};
		var storeSku2name = {};
		var store2daily = {};
		var sku2stock = {};
		var sku2return = {};
		var storeHasVolume = [];
		var subDays = 1;
		if(moment().format('HH') < 17) {
			subDays = 2;
		}
		var date = req.query.date || moment().subtract(subDays, 'day').format('YYYY-MM-DD HH:mm:ss');
		var purchaseList = [];
		var shelfTime = {};

		async.series([
				// 订单详情
				function(callB) {
					var findRequire = {};
					Purchase.find(findRequire, ["buyer", "supplier", "purDetails", "order_status"])
						.populate({
							path: "supplier",
							select: "name"
						})
						.populate({
							path: "purDetails",
							select: "store_sku purchase_quantity deliver_total"
						})
						.sort({
							order_number: 1
						})
						.exec(function(err, purListFound) {
							if(dealErr.findErr(err)) return callB(err);
							purchaseList = purListFound;
							purListFound.forEach(function(purFound) {
								purFound.purDetails.forEach(function(purDetail) {
									storeIn.push(purDetail.store_sku);
									id2DTL[purDetail._id] = purDetail;
								})
							});
							callB(null)
						})
				},

				// 找出库存sku对应中文名
				function(callB) {
					var findRequire = {};
					if(storeIn.length > 0) {
						findRequire.store_sku = {};
						findRequire.store_sku.$in = storeIn;
					}
					Product.find(findRequire, ["_id", "id", "store_sku", "name_cn"])
						.exec(function(err, prodListFound) {
							if(dealErr.findErr(err, res)) return callB(err);
							prodListFound.forEach(function(prodFound) {
								storeSku2name[prodFound.store_sku] = prodFound.name_cn;
								id2storeSku[prodFound.id] = prodFound.store_sku;
								storeIdIn.push(prodFound._id);
								_id2id[prodFound._id] = prodFound.id;
							});
							callB(null);
						});
				},

				// 根据storeSku找出每日信息
				function(callB) {
					var seller2store = {};
					var asinLastTime = [];
					var findRequire = {};
					if(storeIn.length > 0) {
						findRequire.product_id = {};
						findRequire.product_id.$in = storeIdIn;
					}
					Merchandise.find(findRequire, ["seller_sku", "product_id", "shelf_time"])
						.exec(function(err, mdseListFound) {
							if(dealErr.findErr(err, res)) return callB(err);
							findRequire = {};
							var sellerIn = [];
							mdseListFound.forEach(function(mdseFound) {
								mdseFound.store_sku = id2storeSku[_id2id[mdseFound.product_id]];
								seller2store[mdseFound.seller_sku] = mdseFound.store_sku;
								sellerIn.push(mdseFound.seller_sku);
								if(shelfTime[mdseFound.store_sku]) {
									if(shelfTime[mdseFound.store_sku] < mdseFound.shelf_time) shelfTime[mdseFound.store_sku] = mdseFound.shelf_time;
								} else {
									shelfTime[mdseFound.store_sku] = mdseFound.shelf_time;
								}
								store2daily[mdseFound.store_sku] = store2daily[mdseFound.store_sku] || {};
							});

							// 筛选出最新数据
							DailySell.aggregate([{
									$match: {
										seller_sku: {
											$in: sellerIn
										},
										date: {
											$lte: date
										}
									}
								},
								{
									$sort: {
										createdAt: -1
									}
								},
								{
									$group: {
										_id: {sellerSku: "$seller_sku", shopName: "$shop_name"},
										createdAt: {
											$first: "$createdAt"
										}
									}
								}
							], function(err, aggListDaily) {
								if(dealErr.findErr(err, res)) return callB(err);
								aggListDaily.forEach(function(aggDaily) {
									var key = aggDaily._id.shopName + aggDaily._id.sellerSku;
									if (!asinLastTime[key] || asinLastTime[key] < aggDaily.createdAt) {
										asinLastTime[key] = {
                                            shopName: aggDaily._id.shopName,
											sellerSku: aggDaily._id.sellerSku,
											createdAt: aggDaily.createdAt
										}
									}
								});
								for (let key in asinLastTime) {
									findRequire.$or = findRequire.$or || [];
									findRequire.$or.push({
                                        shop_name: asinLastTime[key].shopName,
										seller_sku: asinLastTime[key].sellerSku,
										createdAt: asinLastTime[key].createdAt
									});
								}

								// 找出最新数据
								DailySell.find(findRequire, ["seller_sku", "receipting_stock", "sellable_stock", "transport_stock"])
									.sort({date: -1})
									.exec(function(err, DLYSellListFound) {
									if(dealErr.findErr(err, res)) return callB(err);
									for(var m = 0; m < DLYSellListFound.length; m++) {
										var DLYSellFound = DLYSellListFound[m];
										store2daily[seller2store[DLYSellFound.seller_sku]].receiptStock = store2daily[seller2store[DLYSellFound.seller_sku]].receiptStock || 0;
										store2daily[seller2store[DLYSellFound.seller_sku]].receiptStock += DLYSellFound.receipting_stock;
										store2daily[seller2store[DLYSellFound.seller_sku]].FBAStore = store2daily[seller2store[DLYSellFound.seller_sku]].FBAStore || 0;
										store2daily[seller2store[DLYSellFound.seller_sku]].FBAStore += (DLYSellFound.sellable_stock + DLYSellFound.transport_stock);
									}

									// 月头到当天
									var startMonthDate = moment(date).startOf('month').format('YYYY-MM-DD');
									DailySell.aggregate([{
											$match: {
												seller_sku: {
													$in: sellerIn
												},
												date: {
													$gte: startMonthDate,
													$lte: date
												}
											}
										},
										{
											$sort: {
												createdAt: -1
											}
										},
										{
											$group: {
												_id: "$seller_sku",
												totalVolume: {
													$sum: "$sales_volume"
												}
											}
										}
									], function(err, aggListTotal) {
										if(dealErr.findErr(err, res)) return callB(err);
										aggListTotal.forEach(function(aggDaily) {
											store2daily[seller2store[aggDaily._id]].totalVolume = store2daily[seller2store[aggDaily._id]].totalVolume || 0;
											store2daily[seller2store[aggDaily._id]].totalVolume += aggDaily.totalVolume;
										});

										// 当天
										findRequire = {
											seller_sku: {
												$in: sellerIn
											},
											date: date
										};
										DailySell.find(findRequire, ["seller_sku", "sales_volume"]).exec(function(err, DLYSellNowFound) {
											if(dealErr.findErr(err, res)) return callB(err);
											if(DLYSellNowFound) {
												DLYSellNowFound.forEach(function(NowFound) {
													store2daily[seller2store[NowFound.seller_sku]].salesVolume = store2daily[seller2store[NowFound.seller_sku]].salesVolume || 0;
													store2daily[seller2store[NowFound.seller_sku]].salesVolume += NowFound.sales_volume;
												})
											}
											// 是否有销量
											DailySell.aggregate([{
													$match: {
														seller_sku: {
															$in: sellerIn
														}
													}
												},
												{
													$sort: {
														createdAt: -1
													}
												},
												{
													$group: {
														_id: "$seller_sku",
														totalVolume: {
															$sum: "$sales_volume"
														}
													}
												}
											], function(err, aggAllTotal) {
												aggAllTotal.forEach(function(aggTotal) {
													if(storeHasVolume.indexOf(seller2store[aggTotal._id]) == -1 && aggTotal.totalVolume > 0) storeHasVolume.push(seller2store[aggTotal._id]);
												});
												callB(null);
											})
										})
									})
								})
							});
						});
				},

				// 库存
				function(callB) {
					StoresJournals.aggregate([{
						$group: {
							_id: {
								pid: '$id',
								house: '$house'
							},
							stock: {
								$last: '$stock'
							},
							updatedAt: {
								$last: '$updatedAt'
							}
						}
					}, {
						$sort: {
							updatedAt: -1
						}
					}]).exec(function(err, docs) {
						let journals = {};
						docs.map(function(item) {
							if(journals[item._id.pid]) {
								journals[item._id.pid] += item.stock
							} else {
								journals[item._id.pid] = item.stock
							}
						});
						for(let key in journals) {
							sku2stock[id2storeSku[key]] = journals[key]
						};
						callB(err)
					})
				},

				// 退货信息
				function(callB) {
					var findRequire = {};
					if(storeIn.length > 0) {
						findRequire.store_sku = {};
						findRequire.store_sku.$in = storeIn;
					}
					CustomerReturns.find(findRequire).exec(function(err, returnsFound) {
						if(dealErr.findErr(err)) return callB(err);
						returnsFound.forEach(function(returnFound) {
							sku2return[returnFound.store_sku] = {
								today: returnFound.today,
								total: returnFound.total
							};
						});
						callB(null);
					})
				},

				function(callB) {
					purchaseList.forEach(function(purFound) {
						if(purFound.purDetails) {
							purFound.purDetails.forEach(function(purDetail) {
								var detail = id2DTL[purDetail._id];
								key = purFound.buyer + purFound.supplier.name + detail.store_sku;
								if(!purTotal[key]) {
									purTotal[key] = {
										buyer: purFound.buyer,
										supplierName: purFound.supplier.name,
										proNameCN: storeSku2name[detail.store_sku],
										proStoreSku: detail.store_sku,
										orderProduct: 0,
										orderTransit: 0,
										stock: sku2stock[detail.store_sku],
										shelfTime: shelfTime[detail.store_sku] ? moment(shelfTime[detail.store_sku]).format('YYYY-MM-DD') : null
									};
									if(store2daily[detail.store_sku]) {
										purTotal[key].salesVolume = store2daily[detail.store_sku].salesVolume;
										purTotal[key].totalVolume = store2daily[detail.store_sku].totalVolume;
										purTotal[key].receiptStock = store2daily[detail.store_sku].receiptStock; // 中国仓-FBA仓库
										purTotal[key].FBAStore = store2daily[detail.store_sku].FBAStore; // FBA库存
									}
									if(detail.first_buy == true && storeHasVolume.indexOf(detail.store_sku) == -1) {
										purTotal[key].salesVolume = "首次采购";
										purTotal[key].totalVolume = "首次采购";
									}
									if(sku2return[detail.store_sku]) {
										purTotal[key].returnToday = sku2return[detail.store_sku].today;
										purTotal[key].returnTotal = sku2return[detail.store_sku].total;
									}
								}

								if(purFound.order_status < 40) {
									purTotal[key].orderProduct += detail.purchase_quantity; // 订单库存（生产中）
								} else if(purFound.order_status == 50) {
									purTotal[key].orderProduct += (detail.purchase_quantity - detail.deliver_total);
								} else if(purFound.order_status == 60) {
									purTotal[key].orderTransit += detail.deliver_total; // 订单库存（到仓库途中）
								} else if(purFound.order_status == 40) {
									purTotal[key].orderTransit += detail.deliver_total;
									purTotal[key].orderProduct += (detail.purchase_quantity - detail.deliver_total);
								}
							});
						}
					});
					callB(null);
				}
			],
			function(err) {
				if(err) {
					debug(err);
					return;
				}
				purTotal = Utils.pakoZip(JSON.stringify(purTotal));
				res.success(purTotal);
			});
	}
};