var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    name: "team",
    schema: {
        _id:        Schema.Types.ObjectId,
        name:       String,     // 小组名称
        leader:     { type: Schema.Types.ObjectId, ref: 'user' },     // 小组长
        members:    [],         // 小组成员
        history:    [],         // 历史
        createdAt:  Date,       // 创建时间
        updatedAt:  Date,       // 修改时间
        deletedAt:  Date        // 删除时间
    }
};
