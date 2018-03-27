var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 产品信息 面对产品自身(供应链)
module.exports = {
	name: "product",
	schema: {
		id: String, // id 使用UUID
		store_sku: String, // 仓库SKU
		name: String, // 英文名
		name_cn: String, // 中文名
		name_brief: String, // 名称简写
		categories: { // 品类信息
			type: Schema.Types.ObjectId,
			ref: 'category'
		},
		onsell: Number, // 在售状态 （等待开发0、正常销售1、商品清仓2、停止销售3）
		combination: [{ // 商品组合信息 {store_sku: xxx, count: nnn}
			store_sku: {
				type: Schema.Types.ObjectId,
				ref: 'product'
			},
			count: {
				type: Number,
				default: 1
			}
		}],
		team_name: String, // 小组名
		type: String, // 商品类型
		photo: [], //图片

		name_product: String, // 品名
		origin: String, // 原产地
		material: String, // 材质
		usefor: String, // 用途
		declare_value: Number, // 申报价值
		hs_code: String, // 海关编码

		weight: Number, // 单品重量
		size: {}, // 单品体积
		pickWeight: Number, // 装箱重量
		pickSize: {}, // 装箱体积

		histories: [], // 更改记录 （head: 时间 操作人，body: 操作内容）
		deleted: { // 是否失效
			type: Boolean,
			default: false
		},

		updatedAt: {
			type: Date,
			default: Date.now
		},
		createdAt: {
			type: Date,
			default: Date.now
		}
	}
};