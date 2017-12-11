// 配置 主要是流程功能等内容的编辑

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    name: "config",
    schema: {
        _id:            Schema.Types.ObjectId,
        name:           String,                 // 名称 用于辨识
        type:           String,                 // 类型 获取时使用该字段搜索
        rule:           {},                     // 配置 json记录
        createdAt:      Date,
        updatedAt:      Date,
        deletedAt:      Date
    }
};
