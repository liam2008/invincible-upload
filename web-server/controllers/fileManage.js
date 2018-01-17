const DB = require('../models/invincible');
const FileManage = DB.getModel('FileManage');
const Users = DB.getModel('user');
const mongoose = require('mongoose');
const multiparty = require('multiparty');
const moment = require('moment');
const async = require('async');
const fs = require("fs");
const uploadDir = 'public/';
const classifyDir = '在线学习/';

module.exports = {
	name: "fileManage",

	// 文件列表
	List: function(req, res) {
		const loginUserId = req.agent.id || '';
		const pageSize = parseInt(req.query.pageSize) || 10;
		const currentPage = parseInt(req.query.currentPage) || 1;
		const where = {
			authorize: {
				$in: [mongoose.Types.ObjectId(loginUserId)]
			}
		};
		if(req.query.type) where.type = req.query.type;
		if(req.query.keyword) {
			where.name = {
				$regex: req.query.keyword,
				$options: 'i'
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
			res.send({
				pageSize,
				currentPage,
				results: results.docs,
				pageCount: Math.ceil(results.count / pageSize)
			})
		})
	},

	// 文件上传
	Upload: function(req, res) {
		const app = require('../app');
		const assestManager = app.getService('AssetsManager');
		const loginUserId = req.agent.id || '';

		

		const type = req.body.type;
		const base64 = new Buffer(req.body.result);
	
		

		assestManager.putTrainingFile({
			type: type,
			buffer: base64
		}, function(err) {
			console.log(err)
		});

		//		const form = new multiparty.Form({
		//			uploadDir: uploadDir + classifyDir
		//		});

		//		form.parse(req, function(err, fields, files) {
		//			let file = files['file'][0];
		//			
		//			
		//			
		//			
		//			
		//			console.log(file)

		//			let filePath = file.path;
		//			let fileName = file.originalFilename;
		//			let fileSize = Math.round(file['size'] / 1024) + ' KB';
		//			let fileType = fileName.substr(fileName.lastIndexOf('.') + 1, 3);
		//			if(fs.existsSync(uploadDir + classifyDir + fileName)) {
		//				fileName = '复件' + moment().format('YYYYMMDDhmmss') + '_' + fileName;
		//			};
		//			fs.rename(filePath, uploadDir + classifyDir + fileName, function(err) {
		//				if(!err) {
		//					new FileManage({
		//						name: fileName,
		//						type: fileType,
		//						size: fileSize,
		//						path: classifyDir + fileName,
		//						authorize: [mongoose.Types.ObjectId(loginUserId)]
		//					}).save(function(err, doc) {
		//						res.send(doc)
		//					})
		//				} else {
		//					fs.unlinkSync(filePath);
		//					res.send(false)
		//				}
		//			})
		//		})
	},

	// 文件更新
	Update: function(req, res) {
		const id = req.body.id;
		const oldName = req.body.oldName;
		const newName = req.body.newName;
		const oldPath = uploadDir + classifyDir + oldName;
		const fileType = oldName.substr(oldName.lastIndexOf('.'));
		const newPath = uploadDir + classifyDir + newName + fileType;
		FileManage.update({
			_id: id
		}, {
			name: newName + fileType,
			path: classifyDir + newName + fileType
		}, function(err, doc) {
			if(err) {
				res.send(err)
			} else {
				fs.renameSync(oldPath, newPath);
				res.send(doc)
			}
		})
	},

	// 文件移除
	Remove: function(req, res) {
		const id = req.query.id;
		FileManage.findOne({
			_id: id
		}, function(err, doc) {
			doc.remove(function(err) {
				let path = uploadDir + doc.path;
				if(fs.existsSync(path)) fs.unlinkSync(path);
				res.send(doc)
			})
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
		const _id = req.body.id;
		const authorize = req.body.authorize;
		FileManage.update({
			_id
		}, {
			authorize
		}, function(err, doc) {
			res.send(doc)
		})
	}

}