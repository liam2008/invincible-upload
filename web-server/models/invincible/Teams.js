var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
	name: "team",
	schema: {
		uuid: String, // uuid 用来做唯一辨识 如查找照片等功能
		name: { // 小组名称
			type: String,
			required: true,
			unique: true
		},
		leader: { // 小组长
			type: Schema.Types.ObjectId,
			ref: 'user'
		},
		members: [{ // 小组成员
			type: Schema.Types.ObjectId,
			ref: 'user'
		}],
		categories: [{ // 品类信息
			type: Schema.Types.ObjectId,
			ref: 'category'
		}],
		history: [], // 历史
		createdAt: Date, // 创建时间
		updatedAt: Date, // 修改时间
		deletedAt: Date // 删除时间
	}
};