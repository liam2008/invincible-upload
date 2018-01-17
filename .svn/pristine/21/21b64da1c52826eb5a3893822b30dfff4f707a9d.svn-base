var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

module.exports = {
    name: "sample_manager",
    schema:{
        _id: Schema.Types.ObjectId,                                                      // ID
        applicant:{ type: Schema.Types.ObjectId, ref: 'user' },                          // 申请借出人
        sample_order: { type: Schema.Types.ObjectId, ref: 'sample_purchase' },           // 借出样品采购单
        sample_amount: Number,                                                           // 当前样品数
        apply_amount: Number,                                                            // 申请样品数
        borrow_amount: {type: Number, default: 0},                                      // 借出样品数
        forecast_return_time: Date,                                                      // 预计归还时间
        return_amount: {type: Number, default: 0},                                      // 归还数量
        real_return_time: Date,                                                          // 实际归还时间
        dealer:  { type: Schema.Types.ObjectId, ref: 'user'},                            // 操作人
        reamarks: [],                                                                    // 备注

        createdAt: { type: Date, default: moment().format("YYYY-MM-DD HH:mm:ss")},
        updatedAt: { type: Date, default: moment().format("YYYY-MM-DD HH:mm:ss")},
        deletedAt: Date
    }
};
