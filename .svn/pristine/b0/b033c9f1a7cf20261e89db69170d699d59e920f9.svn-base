var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

module.exports = {
    name: "sample_purchase",
    schema:{
        _id: Schema.Types.ObjectId,                                     // ID
        sample_id: { type: Schema.Types.ObjectId, ref: 'sample'},       // 采购样品
        mode: Number,                                                   // 采购类型(1、样品采购)
        type: Number,                                                   // 采购方式（1、国内采购、2、亚马逊采购）
        sample_number: String,                                          // 编号
        status: Number,                                                 // 采购状态(1、已创建，待编辑、2、已提交，待采购、3、采购中，待收货、4、部分收货、5、全部收货。)
        supplier: { type: Schema.Types.ObjectId, ref: 'supplier' },     // 供应商
        purchase_amount:Number,                                         // 采购数量
        sign_amount: Number,                                            // 签收数量
        price: Number,                                                  // 单价
        freight:Number,                                                 // 运费
        applicant:{ type: Schema.Types.ObjectId, ref: 'user' },         // 申请人
        external_number: String,                                        // 外部单号
        remarks: [],                                                    // 备注
        stock_in: Date,                                                 // 入库时间

        createdAt: { type: Date, default: moment().format("YYYY-MM-DD HH:mm:ss")},
        updatedAt: { type: Date, default: moment().format("YYYY-MM-DD HH:mm:ss")},
        deletedAt: Date
    }
};
