var moment = require('moment');
var Product = require('../models/invincible').getModel('product');
var Journals = require('../models/adc').getModel('StoresJournals');

module.exports = {
	name: "stores",

	storesList: function(req, res) {
		Product.find({}).sort({
			createdAt: -1
		}).exec(function(err, product) {
			Journals.aggregate([{
				$group: {
					_id: '$id',
					unit: {
						$last: '$unit'
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
			}]).exec(function(err, journals) {
				var list = [];
				for(var i = 0; i < product.length; i++) {
					var item = {
						id: product[i]['id'],
						name: product[i]['name_cn'],
						sku: product[i]['store_sku']
					}
					for(var j = 0; j < journals.length; j++) {
						if(product[i]['id'] == journals[j]['_id']) {
							item.unit = journals[j]['unit'];
							item.stock = journals[j]['stock'];
							item.updatedAt = journals[j]['updatedAt'];
							break
						}
					}
					list.push(item)
				};
				res.json(list)
			})
		})
	},

	storesRegister: function(req, res) {
		var data = {
			id: req.query.id,
			unit: req.query.unit,
			time: req.query.time,
			stock: parseInt(req.query.stock),
			enter: parseInt(req.query.enter),
			output: parseInt(req.query.output),
			note: req.query.note,
			updatedAt: moment().format("YYYY-MM-DD HH:mm:ss")
		};
		data.stocked = data.stock;
		data.stock = data.stock + data.enter - data.output;
		new Journals(data).save(function(err) {
			err ? res.json(err) : res.json(data)
		})
	},

	storesJournal: function(req, res) {
		Product.findOne({
			id: req.query.id
		}, function(err, product) {
			Journals.find({
				id: req.query.id,
				time: {
					$gte: req.query.startTime || moment().subtract(1, 'days').format("YYYY-MM-DD"),
					$lte: req.query.endTime || moment().format("YYYY-MM-DD")
				}
			}).sort({
				updatedAt: -1
			}).exec(function(err, journals) {
				var list = [];
				for(var i = 0; i < journals.length; i++) {
					list.push({
						id: product['id'],
						sku: product['store_sku'],
						name: product['name_cn'],
						unit: journals[i]['unit'],
						stock: journals[i]['stock'],
						stocked: journals[i]['stocked'],
						time: journals[i]['time'],
						enter: journals[i]['enter'],
						output: journals[i]['output'],
						note: journals[i]['note'],
						updatedAt: journals[i]['updatedAt']
					})
				};
				res.json(list)
			})
		})
	}
}