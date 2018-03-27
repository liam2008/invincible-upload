const app = require('../app');
const DB = require('../models/invincible');
const FileManage = DB.getModel('FileManage');
const Users = DB.getModel('user');
const mongoose = require('mongoose');
const multiparty = require('multiparty');
const moment = require('moment');
const async = require('async');
const fs = require('fs');
var Shared = require('../../shared/');
var Utils = Shared.Utils;
var UUID = require('uuid');
var ERROR_CODE = Shared.ERROR;

module.exports = {
	name: "fileManage",

	// 文件列表
	List: function(req, res) {
		const assestManager = app.getService('AssetsManager');
		const loginUserId = req.agent.id;
		const isSuthorize = req.query.isSuthorize;
		const pageSize = parseInt(req.query.pageSize) || 10;
		const currentPage = parseInt(req.query.currentPage) || 1;
		const where = {
			exists: true
		};
		if(req.query.type === 'doc+zip') {
			where.$or = [{
				type: 'doc'
			}, {
				type: 'zip'
			}]
		} else if(req.query.type) {
			where.type = req.query.type
		};
		if(req.query.keyword) {
			where.$or = [{
				name: {
					$regex: req.query.keyword,
					$options: 'i'
				}
			}, {
				tips: {
					$regex: req.query.keyword,
					$options: 'i'
				}
			}]
		};
		if(isSuthorize) {
			where.authorize = {
				$in: [
					mongoose.Types.ObjectId(loginUserId),
					mongoose.Types.ObjectId('000000000000000000000000')
				]
			}
		};
		async.series({
			count: function(callback) {
				FileManage.count(where, function(err, count) {
					callback(null, count)
				})
			},
			docs: function(callback) {
				FileManage.find(where).sort({
					updated: -1
				}).skip((currentPage - 1) * pageSize).limit(pageSize).exec(function(err, docs) {
					callback(null, docs)
				})
			}
		}, function(err, results) {
			let list = [];
			for(var i = 0; i < results.docs.length; i++) {
				let item = results.docs[i];
				list.push({
					_id: item._id,
					type: item.type,
					name: item.name,
					tips: item.tips,
					size: item.size,
					updated: item.updated,
					authorize: item.authorize,
					path: assestManager.getTrainingUri(item['fileId'], item['type'], true)

				})
			};
			res.send({
				pageSize,
				currentPage,
				results: list,
				pageCount: Math.ceil(results.count / pageSize)
			})
		})
	},

	// 文件是否存在
	Exists: function(req, res) {
		FileManage.findOne({
			name: req.query.name
		}, function(err, doc) {
			res.send(err || doc)
		})
	},

	// 文件上传
	Upload: function(req, res) {
		let assestManager = app.getService('AssetsManager');
		let form = new multiparty.Form({
			uploadDir: 'public/'
		});
		form.parse(req, function(err, fields, files) {
			let file = files.file[0];
			let fileName = file['originalFilename'];
			let filePath = file['path']
			let fileSize = Math.round(file['size'] / 1024) + ' KB';
			let fileType = fileName.substr(fileName.lastIndexOf('.') + 1, 3);
			let uuid = UUID.v4();
			let time = moment().format('YYYY-MM-DD HH:mm:ss');
			let authorize = [mongoose.Types.ObjectId('000000000000000000000000')];

			fs.readFile(filePath, function(error, data) {
				FileManage.findOne({
					name: fileName
				}, function(err, doc) {
					if(doc) {
						assestManager.putTrainingFile({
							data: data,
							type: fileType,
							uuid: doc.fileId
						}, function(err, result) {
							if(err) res.send(err.code);
							if(result) {
								doc.exists = true;
								doc.updated = time;
								doc.save(function(err, doc) {
									fs.unlinkSync(filePath);
									res.send(err || doc)
								})
							}
						})
					} else {
						assestManager.putTrainingFile({
							data: data,
							type: fileType,
							uuid: uuid
						}, function(err, result) {
							if(err) res.send(err.code);
							if(result) {
								new FileManage({
									authorize,
									fileId: uuid,
									name: fileName,
									type: fileType,
									size: fileSize
								}).save(function(err, doc) {
									fs.unlinkSync(filePath);
									res.send(err || doc)
								})
							}
						})
					}
				})
			})
		})
	},

	// 文件下载
	Download: function(req, res) {
		var fs = require('fs');
		var path = require('path');
		var request = require('request');
		var type = req.query.name.substr(req.query.name.indexOf('.'));
		var path = path.resolve(__dirname, '../public/download');
		var stream = fs.createWriteStream(path);
		request(req.query.path).pipe(stream).on('close', function() {
			res.download(path, req.query.name);
		})
	},

	// 文件改名
	Update: function(req, res) {
		const id = req.body.id;
		const name = req.body.newName;
		const type = req.body.oldName.substr(req.body.oldName.lastIndexOf('.'));
		FileManage.update({
			_id: id
		}, {
			name: name + type
		}, function(err, doc) {
			res.send(err || name + type)
		})
	},

	// 文件移除
	Remove: function(req, res) {
		const id = req.query.id;
		FileManage.update({
			_id: id
		}, {
			exists: false
		}, function(err, doc) {
			res.send(err || id)
		})
	},

	// 用户列表
	Users: function(req, res) {
		Users.find({}, {
			name: 1,
			account: 1
		}).sort({
			name: 1
		}).exec(function(err, docs) {
			res.send(docs)
		})
	},

	// 文件权限
	Authorize: function(req, res) {
		const _id = req.body._id;
		const tips = req.body.tips;
		const authorize = req.body.authorize;
		FileManage.update({
			_id
		}, {
			tips,
			authorize
		}, function(err, doc) {
			res.send(doc)
		})
	}

}