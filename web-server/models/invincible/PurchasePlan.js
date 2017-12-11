var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    name: "purchasePlan",
    schema: {
        _id: Schema.Types.ObjectId,
        plan_id: String,                                                    // 采购计划订单号
        status: Number,                                                     // 状态 100: 待处理, 101: 已退回, 200: 运营部审核中, 300: 供应链审核中, 400: 审核通过
        applicant: { type: Schema.Types.ObjectId, ref: 'user' },            // 申请人的id
        details: [{ type: Schema.Types.ObjectId, ref: 'purchasePlanDetail' }], // 采购计划订单明细的id数组
        logs: {},                                                           // 审核意见记录  {uuid: String}  uuid 为审核时生成的uuid，用于对应。String为审核意见文字
        history: [],                                                        // 历史信息  [{id: 使用uuid制作唯一标识,handler: 处理者id, data:{处理前状态，处理后状态} 处理内容, time: 处理时间}]  处理内容至少包括从什么状态更换到什么状态
        createdAt: Date,
        updatedAt: Date,
        deletedAt: Date
    }
};