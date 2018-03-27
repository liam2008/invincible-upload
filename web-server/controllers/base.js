var debug = require('debug')('smartdo:controller:base');
var ServerError = require('../errors/server-error');
var fs = require("fs");
var moment = require('moment');
var UUID = require('uuid');
var DB = require('../models/invincible');
var Merchandise = DB.getModel('merchandise');
var Product = DB.getModel('product');
var Houses = DB.getModel('StoresHouses');
var Journals = DB.getModel('StoresJournals');
var User = DB.getModel('user');
var Team = DB.getModel('team');
var Shops = DB.getModel('shops');
var mongoose = require('mongoose');
var async = require('async');

var Shared = require('../../shared/');
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;
var Utils = Shared.Utils;
var dealErr = require('../errors/controller-error');

/*
 * UModules Dependencies
 */

module.exports = {
	name: "base",

	list: function(req, res, next) {
		var findCondition = null;
		var subFilter = req.subfilterMerchandiseEdit || {};
		if(subFilter.view == "*") {
			findCondition = {};
		} else if(subFilter.view != null) {
			findCondition = {
				team_id: subFilter.view
			};
		} else {
			res.success();
			return;
		}

		var data = {
			rights: {
				edit: subFilter.edit || false,
				add: subFilter.add || false,
				delete: subFilter.delete || false
			}
		};
		async.series([
				function(callB) {
					var results = [];
					var states = ["停售", "未开售", "推广期", "在售期", "清仓期", "归档", "备用"];
					findCondition.state = {
						$nin: [-1]
					};
					Merchandise.find(findCondition)
						.populate({
							path: 'manager',
							select: 'name'
						})
						.populate('product_id')
						.populate('shop_id')
						.populate('team_id')
						.sort({
							createdAt: -1
						})
						.exec(function(err, MerchandiseListResult) {
							if(dealErr.findErr(err, res)) return debug(new Error(err));
							MerchandiseListResult.forEach(function(Merchandises) {
								var shop = {};
								var team = {};
								var productId = "";
								var nameCN = "";
								var storeSku = "";
								if(Merchandises.team_id) team = {
									name: Merchandises.team_id.name,
									teamId: Merchandises.team_id._id
								};
								if(Merchandises.shop_id) shop = {
									name: Merchandises.shop_id.name,
									shopId: Merchandises.shop_id._id
								};
								if(Merchandises.product_id) {
									productId = Merchandises.product_id._id;
									nameCN = Merchandises.product_id.name_cn;
									storeSku = Merchandises.product_id.store_sku
								};
								var shelfTime = "";
								var state = {};
								if(Merchandises.shelf_time) shelfTime = moment(Merchandises.shelf_time).format("YYYY-MM-DD");
								if(Merchandises.state >= 0) state = {
									num: Merchandises.state,
									name: states[Merchandises.state]
								};
								results.push({
									id: Merchandises.id,
									sellerSku: Merchandises.seller_sku,
									storeSku: storeSku,
									productId: productId,
									FBA: Merchandises.FBA,
									fnsku: Merchandises.fnsku,
									asin: Merchandises.asin,
									nameCN: nameCN,
									shop: shop,
									team: team,
									state: state,
									manager: Merchandises.manager,
									projectedSales: Merchandises.projected_sales,
									price: Merchandises.price || 0,
									shelfTime: shelfTime
								});
							});
							data.list = results;
							callB(null);
						})
				},

				function(callB) {
					Product.aggregate([{
							$match: {}
						},
						{
							$sort: {
								store_sku: 1
							}
						},
						{
							$group: {
								_id: {
									_id: "$_id",
									store_sku: "$store_sku",
									name_cn: "$name_cn"
								}
							}
						}
					], function(err, productListResult) {
						if(dealErr.findErr(err, res)) return callB(new Error(err));
						var productResults = [];
						productListResult.forEach(function(productOneResult) {
							var prodResult = {};
							prodResult._id = productOneResult._id._id;
							prodResult.store_sku = productOneResult._id.store_sku;
							prodResult.name_cn = productOneResult._id.name_cn;
							productResults.push(prodResult);
						});
						data.stockList = productResults;
						callB(null);
					})
				},

				function(callB) {
					Shops.aggregate([{
							$match: {}
						},
						{
							$sort: {
								name: 1
							}
						},
						{
							$group: {
								_id: {
									_id: "$_id",
									name: "$name"
								}
							}
						}
					], function(err, shopsNameResult) {
						if(err) {
							callB(err);
							res.error(ERROR_CODE.NOT_EXISTS);
							return;
						}
						var shopResults = [];
						shopsNameResult.forEach(function(shopNameResult) {
							var shopResult = {};
							shopResult.shopId = shopNameResult._id._id;
							shopResult.name = shopNameResult._id.name;
							shopResults.push(shopResult);
						});
						data.shopsNames = shopResults;
						callB(null);
					});
				},

				function(callB) {
					var teams = [];
					Team.find({}, ["name"])
						.exec(function(err, teamListFound) {
							if(err) {
								callB(err);
								res.error(ERROR_CODE.NOT_EXISTS);
								return;
							}
							teamListFound.forEach(function(teamFound) {
								teams.push({
									teamId: teamFound._id,
									name: teamFound.name
								});
							});
							data.teamList = teams;
							callB(null);
						})
				},

				// 小组信息
				function(callB) {
					User.find({}).populate({
						path: 'team',
						select: 'name account'
					}).exec(function(err, docs) {
						var team = {};
						docs.map(function(item) {
							if(item['team']) {
								let key = item['team']['name'];
								if(team[key]) {
									team[key].push({
										_id: item['_id'],
										name: item['name'],
										account: item['account']
									})
								} else {
									team[key] = [{
										_id: item['_id'],
										name: item['name'],
										account: item['account']
									}]
								}
							}
						});
						data.teamUser = team;
						callB(null);
					})
				},
			],
			function(err) {
				if(err) {
					debug(err);
					return;
				}
				res.success(Utils.pakoZip(JSON.stringify(data)));
			}
		)
	},

	update: function(req, res, next) {
		var subFilter = req.subfilterMerchandiseEdit || {};
		if(subFilter.edit) {
			Merchandise.findOne({
				asin: req.body.asin,
				seller_sku: req.body.sellerSku,
				shop_id: mongoose.Types.ObjectId(req.body.shopId)
			}, function(err, MerchandiseResult) {
				if(dealErr.findErr(err, res)) return debug(new Error(err));
				if(MerchandiseResult) {
					console.log(1, MerchandiseResult)
					debug("merchandise change : " + MerchandiseResult.asin + " " + MerchandiseResult.seller_sku + " " + MerchandiseResult.shop_name +
						" [ projected_sales : " + MerchandiseResult.projected_sales + " -> " + req.body.projected_sales +
						" price : " + MerchandiseResult.price + " -> " + req.body.price +
						" team_name : " + MerchandiseResult.team_name + " -> " + req.body.team_name +
						" state : " + MerchandiseResult.state + " -> " + req.body.state +
						" ]"
					);
					if(req.body.manager) MerchandiseResult.manager = mongoose.Types.ObjectId(req.body.manager);
					if(req.body.productId) MerchandiseResult.product_id = mongoose.Types.ObjectId(req.body.productId);
					if(req.body.shelfTime) MerchandiseResult.shelf_time = moment(req.body.shelfTime).format('YYYY-MM-DD');
					MerchandiseResult.price = parseInt(req.body.price);
					MerchandiseResult.state = parseInt(req.body.state);
					MerchandiseResult.projected_sales = parseInt(req.body.projectedSales);
					MerchandiseResult.team_id = mongoose.Types.ObjectId(req.body.teamId);
					MerchandiseResult.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
					console.log(2, MerchandiseResult)
					MerchandiseResult.save(function(err, doc) {
						if(dealErr.updateErr(err, res)) return debug(new Error(err));
						res.success(doc);
					})
				}
			})
		} else {
			res.success();
			return;
		}
	},

	saveMerchandise: function(req, res, next) {
		var subFilter = req.subfilterMerchandiseEdit || {};
		if(subFilter.add) {
			Merchandise.findOne({
				asin: req.body.asin,
				seller_sku: req.body.sellerSku,
				shop_id: mongoose.Types.ObjectId(req.body.shopId)
			}, function(err, MerchandiseResult) {
				if(dealErr.findErr(err, res)) return debug(new Error(err));
				if(!MerchandiseResult) {
					if(!req.body.asin || !req.body.sellerSku) {
						res.error(ERROR_CODE.INVALID_ARGUMENT);
						return;
					}
					if(typeof(req.body.FBA) != "number") req.body.FBA = Utils.toNumber(req.body.FBA);
					if(typeof(req.body.projectedSales) != "number") req.body.projectedSales = Utils.toNumber(req.body.projectedSales);
					if(typeof(req.body.state) != "number") req.body.state = Utils.toNumber(req.body.state);
					if(typeof(req.body.price) != "number") req.body.price = Utils.toNumber(req.body.price);
					var merchandise = new Merchandise({
						id: UUID.v4(),
						seller_sku: req.body.sellerSku, // 卖家SKU
						product_id: mongoose.Types.ObjectId(req.body.productId), // 仓库SKU
						FBA: req.body.FBA, // 是否FBA 1是 0否
						fnsku: req.body.fnsku, // FNSKU
						asin: req.body.asin, // ASIN
						name: req.body.name, // 当地语言名字:英文\日文等
						shop_id: mongoose.Types.ObjectId(req.body.shopId), // 店铺名
						team_id: mongoose.Types.ObjectId(req.body.teamId), // 小组名
						manager: mongoose.Types.ObjectId(req.body.manager),
						state: req.body.state, // 状态 0:停售, 1:未开售, 2:推广期, 3:在售期, 4:清仓期 5:归档 6:备用
						price: req.body.price, // 基准价格
						projected_sales: req.body.projectedSales, // 预计销量
						createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
						updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
					});
					merchandise.save(function(err) {
						if(dealErr.createErr(err, res)) return debug(new Error(err));
						res.success(true);
					})
				} else {
					res.success(false)
				}
			})
		} else {
			res.success();
			return;
		}
	},

	deleteMerd: function(req, res, next) {
		var subFilter = req.subfilterMerchandiseEdit || {};
		if(subFilter.delete) {
			if(!req.params.id) {
				res.error(ERROR_CODE.MISSING_ARGUMENT);
				return;
			}
			Merchandise.findOne({
				id: req.params.id
			}, function(err, MerchandiseResult) {
				if(dealErr.findErr(err, res)) return debug(new Error(err));
				if(MerchandiseResult) {
					if(MerchandiseResult.state == 2 || MerchandiseResult.state == 3) {
						res.error(ERROR_CODE.IS_SELLING);
						return;
					}
					MerchandiseResult.state = -1;
					MerchandiseResult.deletedAt = moment().format("YYYY-MM-DD");
					MerchandiseResult.save(function(err) {
						if(dealErr.removeErr(err, res)) return debug(new Error(err));
						res.success();
					})
				} else {
					res.error(ERROR_CODE.NOT_EXISTS);
					return;
				}
			})
		} else {
			res.success();
			return;
		}
	},

	shops: function(req, res, next) {
		var results = {};
		var subFilter = req.subfilterShop || {};
		if(subFilter.view == "*") {
			results.rights = {
				edit: subFilter.edit || false,
				add: subFilter.add || false,
				delete: subFilter.delete || false
			}
		} else {
			res.error(ERROR_CODE.ACCESS_DENIED);
			return;
		}

		Shops.find(function(err, shopsListResult) {
			if(dealErr.findErr(err, res)) return debug(new Error(err));
			var list = [];
			shopsListResult.forEach(function(shopsResult) {
				var result = {
					id: shopsResult.id,
					name: shopsResult.name,
					site: shopsResult.site,
					sellerId: shopsResult.seller_id,
					createdAt: moment(shopsResult.createdAt).format('YYYY-MM-DD HH:mm:ss'),
					updatedAt: moment(shopsResult.updatedAt).format('YYYY-MM-DD HH:mm:ss')
				};
				list.push(result)
			});
			results.list = list;
			res.success(results);
		})
	},

	addShops: function(req, res, next) {
		var subFilter = req.subfilterShop || {};
		if(subFilter.add) {

		} else {
			res.error(ERROR_CODE.ACCESS_DENIED);
			return;
		}
		req.body.name = req.body.name.toUpperCase();
		var date = moment().format('YYYY-MM-DD HH:mm:ss');
		var names = req.body.name.split("-");
		var site = names[2];
		var newShop = new Shops({
			id: UUID.v4(),
			name: req.body.name,
			site: site,
			seller_id: req.body.sellerId,
			createdAt: date,
			updatedAt: date
		});

		newShop.save(function(err) {
			if(dealErr.createErr(err, res)) return debug(new Error(err));
			res.success();
		});
	},

	shopsOne: function(req, res, next, callback) {
		var findRequire = {};
		findRequire.id = req.body.id;
		Shops.findOne(findRequire, function(err, ShopOne) {
			callback(err, ShopOne)
		});
	},

	updateShops: function(req, res, next) {
		var subFilter = req.subfilterShop || {};
		if(subFilter.edit) {

		} else {
			res.error(ERROR_CODE.ACCESS_DENIED);
			return;
		}
		req.body.name = req.body.name.toUpperCase();
		require('../controllers').base.shopsOne(req, res, next, function(err, ShopsOne) {
			if(dealErr.findErr(err, res)) return debug(new Error(err));
			var name = req.body.name;
			ShopsOne.name = req.body.name;
			ShopsOne.site = (name.split("-"))[2];
			ShopsOne.seller_id = req.body.sellerId;
			ShopsOne.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
			ShopsOne.save(function(err) {
				if(dealErr.updateErr(err, res)) return debug(new Error(err));
				res.success();
			});
		})
	},

	//Product货品
	saveProduct: function(req, res, next) {
		var time = moment().format('YYYY-MM-DD HH:mm:ss');
		var product = new Product({
			id: UUID.v4(), // id 使用UUID
			store_sku: req.body.store_sku, // 仓库SKU
			name_cn: req.body.name_cn, // 英文名
			createdAt: time, // 创建时间
			updatedAt: time // 修改时间
		});
		product.save(function(err) {
			if(dealErr.createErr(err, res)) return debug(new Error(err));
			res.success(true);
		});
	},

	updateProduct: function(req, res, next) {
		if(req.body.id) {
			baseController.ProductOne(req.body.id, function(err, productOne) {
				if(err) {
					debug(err);
					return;
				}
				if(productOne) {
					var time = moment().format('YYYY-MM-DD HH:mm:ss');
					productOne.store_sku = req.body.store_sku;
					productOne.name_cn = req.body.name_cn; // 英文名
					productOne.updatedAt = time; // 修改时间
					productOne.save(function(err) {
						if(dealErr.findErr(err, res)) return debug(new Error(err));
						res.success(true);
					});
				} else {
					res.success(false);
				}
			})
		} else {
			res.error(ERROR_CODE.NOT_EXISTS);
		}
	},

	listProduct: function(req, res) {
		let productJson = {};
		let journalJson = {};
		let productList = [];
		let houseSelect = [];
		let house = req.query.house;
		let subfilter = req.subfilterStockControls;

		async.series([
			// 仓库选项
			function(callback) {
				Houses.find({}, ['name']).sort({
					name: 1
				}).exec(function(err, docs) {
					houseSelect = docs;
					callback(err)
				})
			},
			// 查询产品信息
			function(callback) {
				Product.find({}, ['id', 'name_cn', 'store_sku', 'createdAt']).sort({
					createdAt: -1
				}).exec(function(err, docs) {
					docs.map(function(item) {
						productJson[item.id] = item
					});
					callback(err)
				})
			},
			// 查询库存记录
			function(callback) {
				Journals.aggregate([{
					$unwind: '$house'
				}, {
					$group: {
						_id: {
							pid: '$id',
							house: '$house'
						},
						unit: {
							$last: '$unit'
						},
						house: {
							$last: '$house'
						},
						stock: {
							$last: '$stock'
						},
						list: {
							$push: {
								time: '$time',
								enter: '$enter'
							}
						}
					}
				}]).exec(function(err, docs) {
					Houses.populate(docs, {
						path: 'house',
						select: 'name'
					}, function(err, populate) {
						populate.map(function(item) {
							let journal = {
								duration: 0,
								list: item.list,
								stock: item.stock
							};
							journal.list.sort(function(x, y) {
								return new Date(y.time) - new Date(x.time)
							});
							if(item.stock) {
								for(let i = 0; i < journal.list.length; i++) {
									let value = journal.stock -= journal.list[i]['enter'];
									if(value <= 0) {
										let time = new Date() - new Date(journal.list[i]['time']);
										journal.duration = Math.floor(time / 86400000);
										break
									} else {
										let time = new Date() - new Date(journal.list[i]['time']);
										journal.duration = Math.floor(time / 86400000)
									}
								}
							};
							let info = {
								unit: item.unit,
								stock: item.stock,
								house: item.house,
								duration: journal.duration
							};
							// 按仓库分仓筛选
							if(house && house == item.house._id) {
								if(journalJson[item._id.pid]) journalJson[item._id.pid].push(info);
								else journalJson[item._id.pid] = [info];
							} else if(!house) {
								if(journalJson[item._id.pid]) journalJson[item._id.pid].push(info);
								else journalJson[item._id.pid] = [info];
							}
						});
						callback(err)
					})
				})
			},
		], function(err, results) {
			// 关联产品和库存记录
			for(var key in productJson) {
				let item = journalJson[key];
				if(house && item) {
					item.map(function(journal) {
						productList.push({
							id: productJson[key]['id'],
							name: productJson[key]['name_cn'],
							sku: productJson[key]['store_sku'],
							createdAt: productJson[key]['createdAt'],
							unit: journal.unit,
							house: journal.house,
							stock: journal.stock,
							duration: journal.duration
						})
					})
				} else if(!house && item) {
					item.map(function(journal) {
						productList.push({
							id: productJson[key]['id'],
							name: productJson[key]['name_cn'],
							sku: productJson[key]['store_sku'],
							createdAt: productJson[key]['createdAt'],
							unit: journal.unit,
							house: journal.house,
							stock: journal.stock,
							duration: journal.duration
						})
					})
				} else if(!house && !item) {
					productList.push({
						id: productJson[key]['id'],
						name: productJson[key]['name_cn'],
						sku: productJson[key]['store_sku'],
						createdAt: productJson[key]['createdAt']
					})
				}
			};
			productList.sort(function(x, y) {
				return new Date(y.createdAt) - new Date(x.createdAt)
			});
			res.send({
				houseSelect,
				productList,
				authority: subfilter
			})
		})
	},

	removeProduct: function(req, res, next) {
		// Product.remove({
		//     store_sku: req.body.store_sku
		// }, function (err) {
		//     if (err) {
		//         return err;
		//     }
		// });

		res.success();
	},

	ProductOne: function(id, callback) {
		var require = {};
		require.id = id;
		Product.findOne(require, function(err, productOne) {
			if(err) {
				return callback(err, null);
			}
			return callback(err, productOne);
		});
	}

};

var baseController = module.exports;