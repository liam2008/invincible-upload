var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    name: "purchaseDetail",
    schema: {
        _id: Schema.Types.ObjectId,
        store_sku: String,                                                  // 库存SKU
        unit_price: Number,                                                 // 单价
        purchase_quantity: Number,                                          // 采购数量
        total_price: Number,                                                // 总金额(含运费)
        contract_covenant_date: Date,                                       // 合同约定交期
        deliver: Object,                                                    // 实际交期:交货数量
        deliver_total: Number,                                              // 已交货数量
        logistics_number: String,                                           // 物流追踪单号
        salesman: Array,                                                    // 业务员

        createdAt: Date,
        updatedAt: Date
    }
};