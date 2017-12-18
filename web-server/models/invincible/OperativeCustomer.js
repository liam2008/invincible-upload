var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    name: "operativeCustomer",
    schema: {
        _id: Schema.Types.ObjectId,
        operate_team: String,                                                   // 运营小组
        work_order_type: Number,                                                // 工单类型(1：评论异常， 2：发现跟单， 3：普通工单， 0：其它)
        customerID: { type: Schema.Types.ObjectId, ref: 'user' },                 // 客服

        createdAt: Date,
        updatedAt: Date,
        deletedAt: Date
    }
};