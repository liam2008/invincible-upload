const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

module.exports = {
	// 在线学习
	name: 'FileManage',
	schema: {
		name: { // 文件名
			type: String,
			required: true,
			unique: true
		},
		type: String, // 类型
		size: String, // 大小
		tips: String, // 标签
		fileId: String, // UUID
		authorize: [Schema.Types.ObjectId], // 权限
		exists: { // 没删除
			type: Boolean,
			default: true
		},
		updated: { // 更新时间
			type: String,
			default: moment().format('YYYY-MM-DD HH:mm:ss')
		}
	}
};