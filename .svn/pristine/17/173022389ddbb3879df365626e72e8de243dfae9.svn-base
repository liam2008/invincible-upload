var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    name: "purchase",
    schema: {
        _id: Schema.Types.ObjectId,
        order_number: String,                                                   // 订单号
        contract_number: String,                                                // 合同号
        order_time: Date,                                                       // 下单时间
        supplier: { type: Schema.Types.ObjectId, ref: 'supplier' },             // 供应商
        buyer: String,                                                          // 采购员
        purDetails: [{ type: Schema.Types.ObjectId, ref: 'purchaseDetail' }],   // 库存SKU的ID
        purchase_total_price: Number,                                           // 订单总金额
        order_status: Number,                                                   // 订单基本状态（10：待处理，20：大货生产中，30：生产完成待确认，40：部分交货,50：部分入库，60：完全交货-订单完成，70：完全入库-订单完成，80：订单取消）
        pickup_way: String,                                                     // 提货方式
        isDeclare: Number,                                                      // 是否报关（0：否，1：是）

        createdAt: Date,
        updatedAt: Date
    }
};