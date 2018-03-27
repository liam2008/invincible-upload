/*
 * Base Dependencies
 */

/*
 * Server Dependencies
 */
var debug = require('debug')('smartdo:controller:daily');
var ServerError = require('../errors/server-error');
var uuid = require('uuid');
var table = require('../utils/table-utils');
var async = require('async');
var moment = require('moment');
var UUID = require('uuid');
var DB = require('../models/invincible');
var Product = DB.getModel('product');
var DailySell = DB.getModel('daily_sell');
var TeamManager = DB.getModel('team_manager');
var Merchandise = DB.getModel('merchandise');
var Epitaph = DB.getModel('epitaph');
var Shops = DB.getModel('shops');
var mongoose = require('mongoose');
var Shared = require('../../shared/');
var Utils = Shared.Utils;
var ERROR_CODE = Shared.ERROR;
var MESSAGE = Shared.MESSAGE;

/*
 * UModules Dependencies
 */

module.exports = {
	name: "daily",

	list: function(req, res, next) {
		var subFilter = req.subfilterDailyInfo || {};
		var teamRequire = {};
		if(subFilter.view == "*") {
			teamRequire = {};
		} else if(subFilter.view != null) {
			teamRequire = {
				team_id: subFilter.view
			};
		} else {
			res.success(Utils.pakoZip(JSON.stringify({
				results: [],
				reportDate: ""
			})));
			return;
		}

		var findRequire = {};
		var results = [];
		var nowMoment = moment();
		var subDays = 1;
		if(nowMoment.format('HH') < 17) {
			subDays = 2;
		}
		var date = req.query.timeRange || moment().subtract(subDays, 'days').format("YYYY-MM-DD") + "~" + moment().subtract(subDays, 'days').format("YYYY-MM-DD");
		var startDate = date.split('~')[0];
		var endDate = date.split('~')[1];
		var skus = [];
		var map_seller2store = {};
		var map_seller2name = {};
		var map_seller2team = {};
		var map_seller2projected = {};
		var map_seller2state = {};
		var map_seller2shelf = {};
		var epitaph = {};
		async.series([
				// 在商品列表中 通过卖家SKU找到相应的仓库SKU、店铺名和小组名
				function(callB) {
					Merchandise.find(teamRequire)
						.populate("product_id")
						.populate("shop_id")
						.populate("team_id")
						.exec(function(err, foundResult) {
							if(err) {
								callB(err);
								return;
							}
							for(var i = 0; i < foundResult.length; i++) {
								var row = foundResult[i];
								var asin = row.asin || "";
								var sellerSku = row.seller_sku || "";
								var shopModel = row.shop_id || {};
								var key = asin + sellerSku + shopModel.name;
								if(row.product_id) {
									map_seller2store[key] = row.product_id.store_sku;
								} else {
									map_seller2store[key] = row.store_sku || "";
								}
								map_seller2team[key] = "";
								if(row.team_id) map_seller2team[key] = row.team_id.name;
								map_seller2projected[key] = row.projected_sales;
								map_seller2state[key] = row.state;
								if(row.product_id) map_seller2name[key] = row.product_id.name_cn;
								map_seller2shelf[key] = row.shelf_time;
							}
							callB(null);
						});
				},
				// 找出这天的销售情况
				function(callB) {
					findRequire.date = {
						$gte: startDate,
						$lte: endDate
					};
					DailySell.find(findRequire, function(err, findDailyResult) {
						if(err) {
							callB(err);
							return;
						}
						findDailyResult.forEach(function(list) {
							var seller_sku = list.seller_sku || "";
							var asin = list.asin || "";
							var shop_name = list.shop_name || "";
							var key = asin + seller_sku + shop_name;
							// 如果key未出现过，则新增，否则合并合计数据
							var num = skus.indexOf(key);
							if(num == -1) {
								skus.push(key);
								results.push({
									asin: list.asin,
									name: list.name,
									sellerSku: list.seller_sku,
									salesVolume: list.sales_volume,
									salesPrice: list.sales_price,
									unitPrice: list.unit_price,
									sellableStock: list.sellable_stock,
									receiptingStock: list.receipting_stock,
									transportStock: list.transport_stock,
									shopName: shop_name,
									createdAt: list.createdAt
								});
							} else {
								var rowfind = results[num];
								rowfind.salesVolume = rowfind.salesVolume + list.sales_volume;
								rowfind.salesPrice = rowfind.salesPrice + list.sales_price;
								if(list.createdAt >= rowfind.createdAt) {
									rowfind.unitPrice = list.unit_price || rowfind.unitPrice;
									rowfind.sellableStock = list.sellable_stock;
									rowfind.receiptingStock = list.receipting_stock;
									rowfind.transportStock = list.transport_stock;
								}
							}
						});
						callB(null);
					});
				},

				// 销售情况中加上中文名和仓库SKU
				function(callB) {
					for(var i = 0; i < results.length; i++) {
						var row = results[i];
						var asin = row.asin || "";
						var sellerSku = row.sellerSku || "";
						var shopName = row.shopName;
						var key = asin + sellerSku + shopName;
						row.name = map_seller2name[key] || "";
						row.storeSku = map_seller2store[key] || "";
						row.teamName = map_seller2team[key] || "";
						row.projectedSales = map_seller2projected[key] || 0;
						row.state = map_seller2state[key] || 0;
						row.shelfTime = (map_seller2shelf[key] ? moment(map_seller2shelf[key]).format("YYYY-MM-DD") : "");
					}
					callB(null);
				},

				// 获取墓志铭
				function(callback) {
					Epitaph.find({}, {
						content: 1,
						merchandise: 1
					}, function(err, docs) {
						docs.map(function(item) {
							epitaph[item.merchandise] = item.content
						});
						callback(null)
					})
				}

			],
			function(err, result) {
				if(err) {
					debug(new Error(err));
					return;
				};
				results.map(function(item) {
					if(epitaph[item.asin]) {
						item.epitaph = epitaph[item.asin]
					}
				});
				res.success(Utils.pakoZip(JSON.stringify({
					results,
					reportDate: date
				})))
			}
		);
	},

	saveDailySell: function(req, res, next) {
		var date = req.body.time;
		var shopName = req.body.shopName;
		var arr = req.body.dataList || [];

		var iterator = function(json, cb) {
			if(json == null || json.asin == null || json.asin == "") {
				cb(null);
				return;
			}

			var asin = json.asin;
			var seller_sku = json.seller_sku;

			var salesNeedSave = true;

			//正常数据 往下走
			async.series([
					// 检查销售表有没有相关信息 ASIN 和 日期
					function(callB) {
						DailySell.find({
							shopName: shopName,
							seller_sku: seller_sku,
							date: date
						}, function(err, findDailyResult) {
							if(err) {
								callB(err);
								return;
							}

							if(findDailyResult.length > 0) {
								salesNeedSave = false;
							}

							callB(null);
						});
					},
					// 如果需要保存销售信息 salesNeedSave == true 则保存一下销售信息
					function(callB) {
						if(salesNeedSave) {
							json.sales_volume = Utils.toNumber(json.sales_volume);
							json.unit_price = Utils.toNumber(json.unit_price);
							json.sales_price = Utils.toNumber(json.sales_price);
							json.sellable_stock = Utils.toNumber(json.sellable_stock);
							json.receipting_stock = Utils.toNumber(json.receipting_stock);
							json.transport_stock = Utils.toNumber(json.transport_stock);
							var time = moment().format('YYYY-MM-DD HH:mm:ss');

							var newSell = new DailySell({
								asin: asin,
								seller_sku: seller_sku,
								date: date,
								sales_volume: json.sales_volume,
								unit_price: json.unit_price,
								sales_price: json.sales_price,
								sellable_stock: json.sellable_stock,
								receipting_stock: json.receipting_stock,
								transport_stock: json.transport_stock,
								createdAt: time,
								updatedAt: time,
								shop_name: shopName
							});

							newSell.save(function(err) {
								if(err) {
									callB(err);
									return;
								}

								callB(null);
							});
						} else {
							callB(null);
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
			res.success('');
		});
	},

	report: function(req, res, next) {
		var subFilter = req.subfilterDailyReport || {};
		var teamRequire = {};
		if(subFilter.view == "*") {
			teamRequire = null;
		} else if(subFilter.view != null) {
			teamRequire = subFilter.view
		} else {
			res.success(Utils.pakoZip(JSON.stringify({
				results: [],
				reportDate: ""
			})));
			return;
		}

		var findRequire = {};
		var findRequire2 = {};
		if(teamRequire) {
			findRequire.team_id = {
				$in: teamRequire
			};
			findRequire2 = {
				$or: []
			};
		}
		Merchandise.find(findRequire)
			.populate("product_id")
			.populate("team_id")
			.exec(function(err, merchandiseFound) {
				if(err) {
					debug(new Error(err));
					return;
				}
				var row;
				var asins = {};
				var teamIDs = {};
				var resultPrice = {};
				var resultCount = {};
				var resultYesPrice = {};
				var resultYesCount = {};
				var resultAveragePrice = {};
				var resultAverageCount = {};
				var monthAllPrice = {};
				var monthAllCount = {};
				var lineDatePrice = {};
				var lineDateCount = {};
				var barData = [];
				var nowMonthStart = 0;
				var stockLoss = {};

				var key;
				var state = {};

				var Moment = function() {
					var now;
					if(req.query.time) {
						now = moment(req.query.time);
					} else {
						now = moment().subtract(1, 'day');
						if(moment().format('HH') < 17) {
							now = now.subtract(1, 'day');
						}
					}
					return now;
				};

				var date = Moment().format('YYYY-MM-DD');
				var yesDate = Moment().subtract(1, 'day').format('YYYY-MM-DD');
				var date30Ago = Moment().subtract(29, 'day').format('YYYY-MM-DD');
				var line60DateMoment = Moment().subtract(59, 'day');
				var line60Date = line60DateMoment.format('YYYY-MM-DD');
				var startMonthMoment = Moment().startOf('month');
				var startMonthDate = startMonthMoment.format('YYYY-MM-DD');
				var endMonthMoment = Moment().endOf('month');
				var endMonthDate = endMonthMoment.format('YYYY-MM-DD');

				for(var b = 0; b < endMonthMoment.format('DD'); b++) {
					barData[b] = {};
					barData[b].y = 0;
					barData[b].date = startMonthMoment.format('YYYY-MM-DD');
					barData[b].monthAllSales = 0;
					startMonthMoment.add(1, 'day');
				}
				for(var i = 0; i < merchandiseFound.length; i++) {
					row = merchandiseFound[i];
					if(findRequire2.$or) findRequire2.$or.push({
						asin: row.asin,
						seller_sku: row.seller_sku
					});
					key = row.asin.toString() + row.seller_sku.toString();
					if(row.team_id) {
						asins[key] = row.team_id.name;
						teamIDs[key] = row.team_id._id;
					}
					state[key] = row.state;
				}

				lineDatePrice.time = [];
				lineDateCount.time = [];
				var line60EachDate = line60DateMoment.format("YYYY-MM-DD");
				while(line60EachDate <= endMonthDate) {
					lineDatePrice.time.push(line60EachDate);
					lineDateCount.time.push(line60EachDate);
					if(line60EachDate == startMonthDate) {
						nowMonthStart = lineDatePrice.time.length - 1;
					}
					line60DateMoment.add(1, 'day');
					line60EachDate = line60DateMoment.format("YYYY-MM-DD");
				}

				findRequire2.date = {
					"$gte": line60Date,
					"$lte": endMonthDate
				};
				DailySell.find(findRequire2, function(err, DailySellFound) {
					if(err) {
						debug(new Error(err));
						return;
					}
					var teamName;
					var teamID;
					var teamDate = {};
					var allTeam = [];
					var lossFindRequire = {};
					lossFindRequire.$or = [{
						asin: null,
						seller_sku: null
					}];

					var allTeamName = [];
					for(var i = 0; i < DailySellFound.length; i++) {
						row = DailySellFound[i];
						key = row.asin.toString() + row.seller_sku.toString();
						teamName = asins[key] || "未知组";
						teamID = teamIDs[key] || null;

						if(allTeamName.indexOf(teamName) == -1) {
							allTeam.push({
								teamName: teamName,
								teamID: teamID
							});
							allTeamName.push(teamName);
						}

						if((state[key] == 2 || state[key] == 3) && row.sellable_stock == 0 && row.transport_stock == 0 && row.date == date && row.sales_volume == 0) {
							lossFindRequire.$or.push({
								asin: row.asin.toString(),
								seller_sku: row.seller_sku.toString()
							});
						}

						//30Date
						if(date30Ago <= row.date && row.date <= date) {
							if(!asins[key]) {
								debug("cant find asin: %s with seller sku: %s", row.asin.toString(), row.seller_sku.toString());
							}
							resultAveragePrice[teamName] = resultAveragePrice[teamName] || 0;
							resultAverageCount[teamName] = resultAverageCount[teamName] || 0;
							resultAveragePrice[teamName] += row.sales_price;
							resultAverageCount[teamName] += row.sales_volume;
							if(!teamDate[teamName]) {
								teamDate[teamName] = [];
							}
							if(teamDate[teamName].indexOf(row.date) == -1) teamDate[teamName].push(row.date);

							resultPrice[teamName] = resultPrice[teamName] || 0;
							resultCount[teamName] = resultCount[teamName] || 0;
							if(row.date == date) {
								resultPrice[teamName] += row.sales_price;
								resultCount[teamName] += row.sales_volume;
							}

							resultYesPrice[teamName] = resultYesPrice[teamName] || 0;
							resultYesCount[teamName] = resultYesCount[teamName] || 0;
							if(row.date == yesDate) {
								resultYesPrice[teamName] += row.sales_price;
								resultYesCount[teamName] += row.sales_volume;
							}
						}

						//monthDate
						if(startMonthDate <= row.date && row.date <= endMonthDate) {
							if(row.date <= date) {
								monthAllPrice[teamName] = monthAllPrice[teamName] || 0;
								monthAllPrice[teamName] += row.sales_price;
								monthAllCount[teamName] = monthAllCount[teamName] || 0;
								monthAllCount[teamName] += row.sales_volume;
							}

							for(var l = 0; l <= barData.length; l++) {
								if(barData[l].date == row.date) {
									barData[l].y = barData[l].y || 0;
									barData[l].y += row.sales_price;
									break;
								}
							}
						}

						//lineDate
						if(teamName != "未知组") {
							if(!lineDatePrice[teamName]) {
								lineDatePrice[teamName] = [];
								lineDateCount[teamName] = [];
							}
							for(var j = 0; j < lineDatePrice.time.length; j++) {
								if((lineDatePrice.time)[j] == row.date) {
									lineDatePrice[teamName][j] = lineDatePrice[teamName][j] || 0;
									lineDatePrice[teamName][j] += row.sales_price;
									lineDateCount[teamName][j] = lineDateCount[teamName][j] || 0;
									lineDateCount[teamName][j] += row.sales_volume;
									break;
								}
							}
						}
					}

					var num = {};
					for(teamName in resultAveragePrice) {
						num[teamName] = teamDate[teamName].length;
						if(resultAveragePrice[teamName]) {
							resultAveragePrice[teamName] = resultAveragePrice[teamName] / num[teamName];
						}
						if(resultAverageCount[teamName]) {
							resultAverageCount[teamName] = resultAverageCount[teamName] / num[teamName];
						}
					}

					for(var m = 0; m < barData.length; m++) {
						if(barData[m].y != 0) {
							for(var n = 0; n <= m; n++) {
								barData[m].monthAllSales += barData[n].y;
							}
						}
						barData[m].y = parseFloat(barData[m].y.toFixed(2));
						barData[m].monthAllSales = parseFloat(barData[m].monthAllSales.toFixed(2));
					}

					for(teamName in monthAllPrice) {
						monthAllPrice[teamName] = parseFloat(monthAllPrice[teamName].toFixed(2));
					}

					for(var lineDateMonthTeam in lineDatePrice) {
						if(lineDateMonthTeam != "time") {
							for(var c = lineDatePrice.time.length - 1; c >= 0; c--) {
								if(lineDatePrice[lineDateMonthTeam][c]) {
									lineDatePrice[lineDateMonthTeam][c] = parseFloat(lineDatePrice[lineDateMonthTeam][c].toFixed(2));
								} else {
									lineDatePrice[lineDateMonthTeam][c] = null;
								}
							}
						}
					}
					for(var lineDateMonthTeam in lineDateCount) {
						if(lineDateMonthTeam != "time") {
							for(var d = lineDateCount.time.length - 1; d >= 0; d--) {
								if(!lineDateCount[lineDateMonthTeam][d]) {
									lineDateCount[lineDateMonthTeam][d] = null;
								}
							}
						}
					}
					var num2 = {};
					var dateCount = {};
					var lossVolume = {};
					lossFindRequire.date = {};
					lossFindRequire.date.$gte = moment(date).subtract(10, 'day').format('YYYY-MM-DD');
					lossFindRequire.date.$lte = date;
					DailySell.find(lossFindRequire).sort({
						date: -1
					}).exec(function(err, lossList) {
						if(lossList.length > 0) {
							var lossVolumeDate = {};
							var priceNotEnd = {};
							var volumeNotEnd = {};
							var unitPrice = {};
							lossList.forEach(function(loss) {
								var key = loss.asin.toString() + loss.seller_sku.toString();
								if(!lossVolumeDate[key]) lossVolumeDate[key] = date;
								if(priceNotEnd[key] == undefined) priceNotEnd[key] = true;
								if(volumeNotEnd[key] == undefined) volumeNotEnd[key] = true;
								if(priceNotEnd[key] && loss.unit_price != 0) {
									priceNotEnd[key] = false;
									unitPrice[key] = loss.unit_price;
								}
								if(volumeNotEnd[key]) {
									lossVolumeDate[key] = loss.date;
									if((loss.sales_volume != 0) && (loss.sales_volume)) {
										volumeNotEnd[key] = false;
									}
								}
							});

							var key2;
							lossList.forEach(function(loss) {
								key2 = loss.asin.toString() + loss.seller_sku.toString();
								if(loss.date <= moment(lossVolumeDate[key2]).format('YYYY-MM-DD') && loss.date >= moment(lossVolumeDate[key2]).subtract(2, 'day').format('YYYY-MM-DD')) {
									lossVolume[key2] = lossVolume[key2] || 0;
									lossVolume[key2] += loss.sales_volume;
									dateCount[key2] = dateCount[key2] || [];
									if(dateCount[key2].indexOf(loss.date) == -1) dateCount[key2].push(loss.date);
									num2[key2] = dateCount[key2].length;
								}
							});
							for(var lossKey in lossVolume) {
								stockLoss[asins[lossKey]] = stockLoss[asins[lossKey]] || 0;
								stockLoss[asins[lossKey]] += unitPrice[lossKey] * (lossVolume[lossKey] / num2[lossKey]);
							}
						}
						allTeam.forEach(function(Team) {
							if(stockLoss[Team.teamName]) {
								stockLoss[Team.teamName] = stockLoss[Team.teamName].toFixed(2);
							}
						});

						var relativelyYesPercentPrice;
						var relativelyYesPercentCount;

						for(var c = 0; c < allTeam.length; c++) {
							for(var d = c; d < allTeam.length; d++) {
								if(resultPrice[allTeam[c].teamName] < resultPrice[allTeam[d].teamName] || typeof(resultPrice[allTeam[c].teamName]) == "undefined") {
									var temp = allTeam[c];
									allTeam[c] = allTeam[d];
									allTeam[d] = temp;
								}
							}
						}

						var sendResult = [];
						allTeam.forEach(function(team) {
							var teamName = team.teamName;
							var teamID = team.teamID;
							if(resultYesPrice[teamName] == 0) {
								relativelyYesPercentPrice = 0;
							} else {
								relativelyYesPercentPrice = (resultPrice[teamName] - resultYesPrice[teamName]) / resultYesPrice[teamName];
							}
							if(resultYesCount[teamName] == 0) {
								relativelyYesPercentCount = 0;
							} else {
								relativelyYesPercentCount = (resultCount[teamName] - resultYesCount[teamName]) / resultYesCount[teamName];
							}
							sendResult.push({
								team: {
									teamName: teamName,
									teamId: teamID
								},
								averageSales: resultAveragePrice[teamName] || 0,
								averageCount: resultAverageCount[teamName] || 0,
								relativelyYesMultiplicationPrice: (resultPrice[teamName] - resultYesPrice[teamName]) || 0,
								relativelyYesPercentPrice: relativelyYesPercentPrice || 0,
								relativelyYesMultiplicationCount: (resultCount[teamName] - resultYesCount[teamName]) || 0,
								relativelyYesPercentCount: relativelyYesPercentCount || 0,
								dailySales: resultPrice[teamName] || 0,
								dailyCount: resultCount[teamName] || 0,
								monthSales: monthAllPrice[teamName] || 0,
								monthCount: monthAllCount[teamName] || 0,
								stockLoss: stockLoss[teamName] || "-"
							})
						});

						function objKeySort(obj) { //排序的函数
							var newkey = Object.keys(obj).sort();
							//先用Object内置类的keys方法获取要排序对象的属性名，再利用Array原型上的sort方法对获取的属性名进行排序，newkey是一个数组
							var newObj = {}; //创建一个新的对象，用于存放排好序的键值对
							for(var i = 0; i < newkey.length; i++) { //遍历newkey数组
								newObj[newkey[i]] = obj[newkey[i]]; //向新创建的对象中按照排好的顺序依次增加键值对
							}
							return newObj; //返回排好序的新对象
						}
						lineDatePrice = objKeySort(lineDatePrice);
						lineDateCount = objKeySort(lineDateCount);

						var sendResult = {
							result: sendResult,
							date: date,
							lineDatePrice: lineDatePrice,
							lineDateCount: lineDateCount,
							barData: barData,
							nowMonthStart: nowMonthStart
						};

						res.success(sendResult);
					});
				});
			})
	},

	import: function(req, res, next) {
		Shops.distinct("name", function(err, shopNames) {
			if(err) {
				debug(err);
				res.success();
				return;
			}
			shopNames.sort();

			res.success(shopNames);
		});
	},

	PopupList: function(req, res, next) {
		var results = [];
		var date = req.query.time;
		var teamID = mongoose.Types.ObjectId(req.query.teamID);
		var map_seller2store = {};
		var map_seller2name = {};
		var map_seller2team = {};
		var map_seller2shop = {};
		var map_seller2projected = {};
		var map_seller2state = {};
		var lossFindRequire = {};
		var lossVolume = {};
		lossFindRequire.$or = [];
		lossFindRequire.date = {};
		lossFindRequire.date.$gte = moment(date).subtract(60, 'day').format('YYYY-MM-DD');
		lossFindRequire.date.$lte = date;
		var stockLoss = {};
		var lossVolumeAve = {};
		var unitPrice = {};

		async.series([
				// 在商品列表中 通过卖家SKU找到相应的仓库SKU、店铺名和小组名
				function(callB) {
					Merchandise.find({
							team_id: teamID,
							state: {
								$in: [2, 3]
							}
						})
						.populate("product_id")
						.populate("shop_id")
						.populate("team_id")
						.exec(function(err, foundResult) {
							if(err) {
								callB(err);
								return;
							}

							for(var i = 0; i < foundResult.length; i++) {
								var row = foundResult[i];
								var asin = row.asin || "";
								var sellerSku = row.seller_sku || "";
								var key;
								key = asin + sellerSku;
								map_seller2store[key] = row.store_sku;
								if(row.team_id) map_seller2team[key] = row.team_id.name;
								map_seller2projected[key] = row.projected_sales;
								map_seller2state[key] = row.state;
								if(row.shop_id) map_seller2shop[key] = row.shop_id.name;
								if(row.product_id) map_seller2name[key] = row.product_id.name_cn;
								lossFindRequire.$or.push({
									asin: asin,
									seller_sku: sellerSku
								})
							}
							callB(null);
						});
				},
				// 找出这天的销售情况
				function(callB) {
					var dateCount = {};

					DailySell.find(lossFindRequire).sort({
						date: -1
					}).exec(function(err, lossList) {
						var key2;
						var num2 = {};
						var lossVolumeDate = {};
						var priceNotEnd = {};
						var volumeNotEnd = {};
						lossList.forEach(function(loss) {
							var key = loss.asin.toString() + loss.seller_sku.toString();
							if(!lossVolumeDate[key]) lossVolumeDate[key] = date;
							if(priceNotEnd[key] == undefined) priceNotEnd[key] = true;
							if(volumeNotEnd[key] == undefined) volumeNotEnd[key] = true;
							if(priceNotEnd[key] && (loss.unit_price != 0)) {
								priceNotEnd[key] = false;
								unitPrice[key] = loss.unit_price;
							}
							if(volumeNotEnd[key]) {
								lossVolumeDate[key] = loss.date;
								if((loss.sales_volume != 0) && (loss.sales_volume)) {
									volumeNotEnd[key] = false;
								}
							}
						});
						lossList.forEach(function(loss) {
							key2 = loss.asin.toString() + loss.seller_sku.toString();
							if(loss.date <= moment(lossVolumeDate[key2]).format('YYYY-MM-DD') && loss.date >= moment(lossVolumeDate[key2]).subtract(2, 'day').format('YYYY-MM-DD')) {
								lossVolume[key2] = lossVolume[key2] || 0;
								lossVolume[key2] += loss.sales_volume;
								dateCount[key2] = dateCount[key2] || [];
								if(dateCount[key2].indexOf(loss.date) == -1) dateCount[key2].push(loss.date);
								num2[key2] = dateCount[key2].length;
							}

							if(loss.date == date && loss.sellable_stock == 0 && loss.transport_stock == 0 && loss.sales_volume == 0) {
								results.push({
									asin: loss.asin,
									sellerSku: loss.seller_sku,
									sellableStock: loss.sellable_stock,
									receiptingStock: loss.receipting_stock,
									transportStock: loss.transport_stock
								});
							}
						});

						results.forEach(function(result) {
							var lossKey = result.asin + result.sellerSku;
							stockLoss[lossKey] = stockLoss[lossKey] || 0;
							if(num2[lossKey]) {
								lossVolumeAve[lossKey] = (lossVolume[lossKey] / num2[lossKey]);
								stockLoss[lossKey] += unitPrice[lossKey] * lossVolumeAve[lossKey];
								lossVolumeAve[lossKey] = lossVolumeAve[lossKey].toFixed(2);
							} else {
								lossVolumeAve[lossKey] = 0;
							}
						});
						for(var key in stockLoss) {
							stockLoss[key] = stockLoss[key].toFixed(2);
						}
						callB(null);
					});
				},

				// 销售情况中加上中文名和仓库SKU
				function(callB) {
					for(var i = 0; i < results.length; i++) {
						var row = results[i];
						var asin = row.asin || "";
						var sellerSku = row.sellerSku || "";
						var key = asin + sellerSku;
						row.name = map_seller2name[key] || "";
						row.storeSku = map_seller2store[key] || "";
						row.teamName = map_seller2team[key] || "";
						row.projectedSales = map_seller2projected[key] || 0;
						row.state = map_seller2state[key] || 0;
						row.averageLoss = stockLoss[key] || "-";
						row.lossVolume = lossVolumeAve[key] || 0.00;
						row.shopName = map_seller2shop[key] || "";
						row.unitPrice = unitPrice[key];
					}
					callB(null);
				}
			],
			function(err, result) {
				if(err) {
					debug(new Error(err));
					return;
				}
				res.success(results);
			}
		);
	},

	// 墓志铭
	epitaph: function(req, res) {
		var asin = req.body.asin;
		var content = req.body.content;
		var account = req.agent.account;

		Epitaph.findOne({
			merchandise: asin
		}, function(err, epitaph) {
			if(epitaph) {
				if(epitaph.content != content) {
					epitaph.histories.push({
						head: moment().format('YYYY-MM-DD HH:mm:ss, ') + account,
						body: epitaph.content + ' 变更为 ' + content
					});
					epitaph.content = content;
					epitaph.save(function(err, doc) {
						res.send(err || doc)
					})
				} else {
					res.send('same')
				}
			} else {
				new Epitaph({
					content: content,
					merchandise: asin,
					histories: [{
						head: moment().format('YYYY-MM-DD HH:mm:ss, ') + account,
						body: '添加：' + content
					}]
				}).save(function(err, doc) {
					res.send(err || doc)
				})
			}
		})
	},

	// 墓志铭选择
	epitaphOpt: function(req, res) {
		var asin = {};
		var list = [];
		async.series([
			function(callback) {
				Merchandise.find({}, {
					asin: 1
				}, function(err, docs) {
					docs.map(function(item) {
						asin[item['asin']] = {
							_id: item['_id'],
							asin: item['asin']
						}
					});
					callback(null)
				})
			},
			function(callback) {
				Epitaph.find({}, {
					content: 1,
					merchandise: 1
				}, function(err, docs) {
					docs.map(function(item) {
						if(asin[item['merchandise']]) {
							asin[item['merchandise']]['epitaph'] = item['content']
						}
					});
					callback(null)
				})
			}
		], function(err, results) {
			for(var key in asin) {
				list.push(asin[key])
			};
			res.send(list)
		})
	},

	// 运营销售信息
	operationSales: function(req, res) {
		var subFilter = req.subfilterOperationSales || {};
		var currentPage = parseInt(req.query.currentPage) || 1;
		var pageSize = parseInt(req.query.itemsPerPage) || 10;
		var totalItems = 0;
		var salesList = [];
		var dailysellJson = {};
		var merchandiseJson = {};
		var merchandiseList = [];
		var managerJson = {};
		var teamList = [];
		var managerList = [];
		var findAsin = [];

		/* 总监和经理：查看所有销售情况
		 * 类目主管：查看自己管理的所有小组的销售情况
		 * 组员和组长：查看本小组销售情况
		 */
		if(!subFilter.view) {
			res.send({
				teamList,
				managerList,
				merchandiseList,
				salesList: pagination,
				totalItems: salesList.length
			})
		};

		async.series([
			// 计算小组和组员信息选项
			function(callback) {
				var findWhere = {
					team_id: {
						$ne: null
					},
					manager: {
						$ne: null
					},

					state: {$in: [1,2,3,4]}
				};

				if(subFilter.findTeam) findWhere.team_id.$in = subFilter.findTeam;

				Merchandise.find(findWhere, ['asin', 'seller_sku', 'shop_id', 'team_id', 'manager']).populate({
					path: 'shop_id',
					select: 'name'
				}).populate({
					path: 'team_id',
					select: 'name'
				}).populate({
					path: 'manager',
					select: 'name level'
				}).exec(function(err, docs) {
					docs.map(function(item) {
						if(teamList.indexOf(item['team_id']) == -1) teamList.push(item['team_id']);
						if(managerList.indexOf(item['manager']) == -1) managerList.push(item['manager']);
					});
					callback(null)
				})
			},
			// 获取商品管理者信息
			function(callback) {
				var findWhere = {
					team_id: {
						$ne: null
					},
					manager: {
						$ne: null
					}
				};

				if(subFilter.findTeam) findWhere.team_id.$in = subFilter.findTeam;
				if(req.query.team) findWhere.team_id = mongoose.Types.ObjectId(req.query.team);
				if(req.query.manager) findWhere.manager = mongoose.Types.ObjectId(req.query.manager);

				Merchandise.find(findWhere, ['asin', 'seller_sku', 'shop_id', 'team_id', 'manager']).populate({
					path: 'shop_id',
					select: 'name'
				}).populate({
					path: 'team_id',
					select: 'name'
				}).populate({
					path: 'manager',
					select: 'name level'
				}).exec(function(err, docs) {
					docs.map(function(item) {
						let index = (item['shop_id'] ? item['shop_id']['name'] : null) + '&' + item['asin'] + '&' + item['seller_sku'];
						merchandiseJson[index] = item;
						findAsin.push(item['asin']);
					});
					callback(null)
				})
			},
			// 获取期间销售信息
			function(callback) {
				var startTime = req.query.startTime || moment().format('YYYY-MM-DD');
				var endTime = req.query.endTime || moment().format('YYYY-MM-DD');
				DailySell.aggregate([{
					$match: {
						asin: {
							$in: findAsin
						},
						date: {
							$gte: startTime,
							$lte: endTime
						}
					}
				}, {
					$group: {
						_id: {
							asin: '$asin',
							shop: '$shop_name',
							msku: '$seller_sku'
						},
						total: {
							$sum: '$sales_price'
						}
					}
				}]).exec(function(err, docs) {
					docs.map(function(item) {
						let index = item['_id']['shop'] + '&' + item['_id']['asin'] + '&' + item['_id']['msku'];
						dailysellJson[index] = {
							salesVolume: item['total'] || 0
						}
					});
					callback(null)
				})
			},
			// 获取本月销售信息
			function(callback) {
				DailySell.aggregate([{
					$match: {
						asin: {
							$in: findAsin
						},
						date: {
							$gte: moment().startOf('months').format('YYYY-MM-DD'),
							$lte: moment().endOf('months').format('YYYY-MM-DD')
						}
					}
				}, {
					$group: {
						_id: {
							asin: '$asin',
							shop: '$shop_name',
							msku: '$seller_sku'
						},
						total: {
							$sum: '$sales_price'
						}
					}
				}]).exec(function(err, docs) {
					docs.map(function(item) {
						var index = item['_id']['shop'] + '&' + item['_id']['asin'] + '&' + item['_id']['msku'];
						if(dailysellJson[index]) dailysellJson[index]['monthlySales'] = item['total'] || 0;
					});
					callback(null)
				})
			},
			// 管理用户对应销售额
			function(callback) {
				for(var key in merchandiseJson) {
					var item = merchandiseJson[key];
					var managerKey = item['manager']['name'];
					var salesVolume = 0;
					var monthlySales = 0;
					if(dailysellJson[key]) {
						salesVolume = dailysellJson[key]['salesVolume'];
						monthlySales = dailysellJson[key]['monthlySales'];
					};
					if(managerJson[managerKey]) {
						var asinIndex = managerJson[managerKey]['asin'].indexOf(item['asin']);
						if(asinIndex == -1) {
							managerJson[managerKey].asin.push(item['asin']);
							managerJson[managerKey].salesVolume.push(salesVolume)
							managerJson[managerKey].monthlySales.push(monthlySales)
						} else {
							managerJson[managerKey]['salesVolume'][asinIndex] += salesVolume;
							managerJson[managerKey]['monthlySales'][asinIndex] += monthlySales;
						};
						managerJson[managerKey].totalSales += salesVolume;
					} else {
						managerJson[managerKey] = {
							shop: item['shop_id'] ? item['shop_id']['name'] : null,
							team: item['team_id'] ? item['team_id']['name'] : null,
							manager: item['manager']['name'],
							level: item['manager']['level'],
							asin: [item['asin']],
							totalSales: salesVolume,
							salesVolume: [salesVolume],
							monthlySales: [monthlySales]
						}
					}
				};
				callback(null)
			}
		], function(err, results) {
			for(let key in managerJson) {
				if(req.query.level && req.query.level == managerJson[key]['level']) {
					salesList.push(managerJson[key])
				} else if(!req.query.level) {
					salesList.push(managerJson[key])
				}
			};
			salesList.sort(function(x, y) {
				return y.totalSales - x.totalSales
			});
			for(var i = 0; i < salesList.length; i++) {
				salesList[i]['ranking'] = i + 1
			};
			salesList.map(function(item) {
				for(var i = 0; i < item.asin.length; i++) {
					merchandiseList.push({
						ranking: item.ranking,
						team: item.team,
						manager: item.manager,
						level: item.level,
						asin: item.asin[i],
						salesVolume: item.salesVolume[i],
						totalSales: item.totalSales,
						monthlySales: item.monthlySales[i]
					})
				}
			});
			//分页
			var pagination = [];
			for(var i = (currentPage - 1) * pageSize; i < currentPage * pageSize; i++) {
				if(salesList[i]) pagination.push(salesList[i])
			};
			res.send({
				teamList,
				managerList,
				merchandiseList,
				salesList: pagination,
				totalItems: salesList.length
			})
		})
	}
};