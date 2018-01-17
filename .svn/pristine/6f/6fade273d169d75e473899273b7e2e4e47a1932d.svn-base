var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var moment = require('moment');

module.exports = {
    name: "sample",
    schema:{
        _id: Schema.Types.ObjectId,                                      // ID
        name: String,                                                    // 样品名称
        model: String,                                                   // 型号
        spec: String,                                                    // 规格
        color: String,                                                   // 颜色
        link: String,                                                    // 链接
        unit: String,                                                    // 单位
        picture: String,                                                 // 图片

        createdAt: { type: Date, default: moment().format("YYYY-MM-DD HH:mm:ss")},
        updatedAt: { type: Date, default: moment().format("YYYY-MM-DD HH:mm:ss")},
        deletedAt: Date
    }
};
