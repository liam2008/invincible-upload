const moment = require('moment');
const async = require('async');
const DB = require('../models/invincible');
const Product = DB.getModel('product');
const Houses = DB.getModel('StoresHouses');
const Journals = DB.getModel('StoresJournals');

module.exports = {
	name: "stores",

	// 仓库列表
	houseList: function(req, res) {
		Houses.find({}).sort({
			createdAt: -1
		}).exec(function(err, docs) {
			res.send(docs)
		})
	},
	// 仓库保存
	houseSave: function(req, res) {
		let name = req.body.name;
		new Houses({
			name
		}).save(function(err, doc) {
			err ? res.send(500, err) : res.send(doc)
		})
	},
	// 仓库更新
	houseUpdate: function(req, res) {
		let _id = req.body._id;
		let name = req.body.name;
		let updatedAt = Date.now();
		Houses.update({
			_id
		}, {
			name,
			updatedAt
		}, function(err, doc) {
			err ? res.send(500, err) : res.send(doc)
		})
	},

	// 库存列表
	storesList: function(req, res) {
		let productJson = {};
		let journalJson = {};
		let productList = [];
		let houseSelect = [];

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
				Product.find({}, ['id', 'name_cn', 'store_sku']).sort({
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
						updatedAt: {
							$last: '$updatedAt'
						},
						list: {
							$push: {
								time: '$time',
								enter: '$enter'
							}
						}
					}
				}, {
					$sort: {
						updatedAt: -1
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
								house: item.house.name,
								updatedAt: item.updatedAt,
								duration: journal.duration
							};
							if(journalJson[item._id.pid]) journalJson[item._id.pid].push(info);
							else journalJson[item._id.pid] = [info];
						});
						callback(err)
					})
				})
			},
		], function(err, results) {
			// 关联产品和库存记录
			for(var key in productJson) {
				let item = journalJson[key];
				let getStock = list => {
					let stock = 0;
					list.map(function(item) {
						stock += item.stock
					});
					return stock
				};
				productList.push({
					id: productJson[key]['id'],
					name: productJson[key]['name_cn'],
					sku: productJson[key]['store_sku'],
					unit: item ? item[0]['unit'] : null,
					updatedAt: item ? item[0]['updatedAt'] : null,
					stock: item ? getStock(journalJson[key]) : 0,
					journals: journalJson[key]
				})
			};
			productList.sort(function(x, y) {
				return new Date(y.updatedAt) - new Date(x.updatedAt)
			});
			res.send({
				houseSelect,
				productList
			})
		})
	},
	// 库存登记
	storesRegister: function(req, res) {
		let data = {
			id: req.body.id,
			unit: req.body.unit,
			note: req.body.note,
			time: req.body.time,
			house: req.body.house,
			stock: parseInt(req.body.stock) || 0,
			enter: parseInt(req.body.enter) || 0,
			output: parseInt(req.body.output) || 0,
			updatedAt: moment().format("YYYY-MM-DD HH:mm:ss")
		};

		Journals.find({
			id: data.id,
			house: data.house
		}).sort({
			updatedAt: -1
		}).exec(function(err, docs) {
			if(docs.length) {
				data.stocked = docs[0]['stock'];
				data.stock = docs[0]['stock'] + data.enter - data.output;
			} else {
				data.stocked = 0;
				data.stock = data.enter - data.output;
			};
			new Journals(data).save(function(err, doc) {
				err ? res.send(500, err) : res.send(doc)
			})
		})
	},
	// 库存记录
	storesJournal: function(req, res) {
		let id = req.query.id;
		let house = req.query.house;
		let startTime = req.query.startTime || moment().subtract(1, 'days').format("YYYY-MM-DD");
		let endTime = req.query.endTime || moment().format("YYYY-MM-DD");

		Product.findOne({
			id
		}, function(err, product) {
			Journals.find({
				id,
				time: {
					$gte: startTime,
					$lte: endTime
				}
			}).populate({
				path: 'house',
				select: 'name'
			}).sort({
				updatedAt: -1
			}).exec(function(err, journals) {
				let list = [];
				journals.map(function(item) {
					let info = {
						id: product['id'],
						sku: product['store_sku'],
						name: product['name_cn'],
						unit: item['unit'],
						stock: item['stock'],
						stocked: item['stocked'],
						time: item['time'],
						enter: item['enter'],
						output: item['output'],
						note: item['note'],
						house: item['house']['name'],
						updatedAt: item['updatedAt']
					};
					if(house && house == item['house']['_id']) {
						list.push(info)
					} else if(!house) {
						list.push(info)
					};
				});
				res.send(list)
			})
		})
	}
}