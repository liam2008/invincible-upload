var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    name: "purchasePlanDetail",
    schema: {
        _id: Schema.Types.ObjectId,
        plan_id: String,                                                    // 对应的采购计划订单号
        product_id: { type: Schema.Types.ObjectId, ref: 'product' },        // 对应产品的id

        local_storage: Number,                                              // 本地仓(广州仓)在途及库存总数
        fba_storage: Number,                                                // FBA仓在途及库存总数
        average_7: Number,                                                  // 7天平均销量
        average_30: Number,                                                 // 30天平均销量

        expected_sales: Number,                                             // 预计销量
        local_transport: Number,                                            // 国内运输和验货时间(天)
        abroad_transport: Number,                                           // 国际运输和入仓时间(天)
        prepare_period: Number,                                             // 备货周期
        safety_stock: Number,                                               // 安全库存天数
        purchase_amount: Number,                                            // 执行采购数量

        supplier: { type: Schema.Types.ObjectId, ref: 'supplier' },         // 供应商的id
        unit_cost: Number,                                                  // 单件采购成本
        estimate_production_days: Number,                                   // 预计生产时间
        least_amount: Number,                                               // 最少起订量
        advance_pay_rate: String,                                           // 结算方式
        first_time: String,                                                 // 是否首次采购

        remarks: String,                                                    // 备注
        history: [],                                                        // 历史信息(备用)
        createdAt: Date,
        updatedAt: Date,
        deletedAt: Date
    }
};