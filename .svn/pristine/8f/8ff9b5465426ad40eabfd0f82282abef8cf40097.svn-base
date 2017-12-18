var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    name: "workOrder",
    schema: {
        _id: Schema.Types.ObjectId,
        order_id: String,                                                   // 工单编号
        state: Number,                                                      // 状态(0：待处理， 1：已跟进， 2：已完结)
        type: Number,                                                       // 类型(1：评论异常， 2：发现跟单， 3：普通工单， 0：其它)
        creater: { type: Schema.Types.ObjectId, ref: 'user' },              // 创建人
        content: String,                                                    // 工单内容
        handler: { type: Schema.Types.ObjectId, ref: 'user' },              // 当前处理人
        history: [{
            log: String,
            from: { type: Schema.Types.ObjectId, ref: 'user' },
            to: { type: Schema.Types.ObjectId, ref: 'user' },
            dealedAt: Date
        }],

        createdAt: Date,
        updatedAt: Date,
        deletedAt: Date
    }
};