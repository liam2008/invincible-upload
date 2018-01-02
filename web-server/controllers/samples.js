var list = [{
	id: 'SPO180101001',
	status: '全部收货',
	img: 'https://i1.mifile.cn/a4/848def18-47d9-4ca0-8822-c2ac61b83779',
	name: '样品名称示例Sample name sample',
	link: '#',
	supplier: '广州智干电子商务科技有限公司',
	model: 'Model',
	spec: 'Spec',
	color: '白色',
	number: '999',
	signNumber: '999',
	unit: '套',
	price: '999.00',
	freight: 99.00,
	applicant: '林国胜',
	createdAt: '2017-12-27 12:00:00'
}]
var item = {
	applicant: '林国胜',
	purchaseType: '样品采购',
	purchaseMethod: '国内采购',
	details: [{
		img: 'https://i1.mifile.cn/a4/848def18-47d9-4ca0-8822-c2ac61b83779',
		name: '样品名称示例Sample name sample',
		link: '#',
		supplier: '广州智干电子商务科技有限公司',
		model: 'Model',
		spec: 'Spec',
		color: '白色',
		number: '999',
		unit: '套',
		price: '999.00',
		freight: '99.00'
	}]
}

module.exports = {
	name: "samples",
	//样品单列表
	buyList: function(req, res) {
		res.send({
			list: list,
			pageCount: 1
		})
	},
	//样品单编辑
	buySave: function(req, res) {
		res.send(req.body)
	},
	//样品单删除
	buyRemove: function(req, res) {
		res.send(true)
	},
	//样品单标记
	buyUpdate: function(req, res) {
		res.send(true)
	},
	//样品单详情
	buyDetails: function(req, res) {
		res.send(item)
	},
	//样品单关联
	buyOddNumber: function(req, res) {
		res.send(req.body)
	},
	//样品单签收
	buySignNumber: function(req, res) {
		res.send(req.body)
	}
}