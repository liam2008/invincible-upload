// 产品信息 面对产品自身(供应链)

module.exports = {
	name: "product",
	schema: {
		id: String, // id 使用UUID
		store_sku: String, // 仓库SKU
		name_cn: String, // 中文名
		name: String, // 英文名
		type: String, // 商品类型
		classify: String, // 商品分类
		combination: [], // 商品组合信息 {store_sku: xxx, count: nnn}
		team_name: String, // 小组名
		onsell: Number, // 在售状态
		photo: [],		//图片

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

		createdAt: Date, // 创建时间
		updatedAt: Date // 修改时间
	}
};