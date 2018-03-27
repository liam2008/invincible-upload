var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//仓库出入库日志
module.exports = {
	name: "StoresJournals",
	schema: {
		id: String, //产品ID
		house: { // 仓库信息
			type: Schema.Types.ObjectId,
			ref: 'StoresHouses'
		},
		unit: String, //单位
		stock: Number, //当前库存
		stocked: Number, //期初库存
		time: String, //出入库时间
		enter: Number, //入库数量
		output: Number, //出库数量
		note: String, //备注
		updatedAt: String //更新时间
	}
};