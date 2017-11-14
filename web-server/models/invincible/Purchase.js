var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    name: "purchase",
    schema: {
        _id: Schema.Types.ObjectId,
        order_number: String,                                               // 订单号
        contract_number: String,                                            // 合同号
        order_time: Date,                                                   // 下单时间
        supplier: { type: Schema.Types.ObjectId, ref: 'supplier' },         // 供应商
        buyer: String,                                                      // 采购员
        purDetails: Array,                                                  // 库存SKU的ID
        purchase_total_price: Number,                                       // 订单总金额
        order_status: Number,                                               // 订单基本状态
        pickup_way: String,                                                 // 提货方式
        remark: String,                                                     // 详细备注

        createdAt: Date,
        updatedAt: Date
    }
};