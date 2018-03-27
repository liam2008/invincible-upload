var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

module.exports = {
    name: "workOrder",
    schema: {
        _id: Schema.Types.ObjectId,
        order_id: String,                                                   // 工单编号
        state: Number,                                                      // 状态(0：待处理， 1：已跟进， 2：已完结)
        type: Number,                                                       // 类型(1：评论异常， 2：发现跟单， 3：Lightning Deals， 4:销售权限， 5:品牌更改， 6:店铺IP问题, 7 ASIN被篡改, 8 文案被修改， 9 图片被篡改 0：其它)
        creator: { type: Schema.Types.ObjectId, ref: 'user' },              // 创建人
        team_id: { type: Schema.Types.ObjectId, ref: 'team' },              // 小组
        content: String,                                                    // 工单内容
        handler: { type: Schema.Types.ObjectId, ref: 'user' },              // 当前处理人
        history: [{
            log: String, // 处理意见
            remark: String, // 转派备注
            from: { type: Schema.Types.ObjectId, ref: 'user' },
            to: { type: Schema.Types.ObjectId, ref: 'user' },
            dealtAt: Date
        }],
        data: Object,                                                       // 爬虫数据
        remarks: [{                                                         // 备注
            writer: { type: Schema.Types.ObjectId, ref: 'user' },
            content: String,
            createdAt: { type: Date, default: moment().format("YYYY-MM-DD HH:mm:ss")}
        }],
		handle: { type: Number, default: 0 }, // 处理状态
        createdAt: { type: Date, default: moment().format("YYYY-MM-DD HH:mm:ss")},
        updatedAt: { type: Date, default: moment().format("YYYY-MM-DD HH:mm:ss")},
        deletedAt: Date
    }
};