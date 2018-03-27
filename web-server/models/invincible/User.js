var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    name: "user",
    schema: {
    	_id:                Schema.Types.ObjectId,
        name:               String,             // 姓名
        name_en:            String,             // 英文名
        account:            String,
        password:           String,
        status:             Number,
        needChangePassword: Boolean,
        lastChangePassword: Date,
        level:     			String, 			// 运营级别
        creator:            { type: Schema.Types.ObjectId, ref: 'user' },
        scope:              Number,
        role:               { type: Schema.Types.ObjectId, ref: 'role' },
        team:               { type: Schema.Types.ObjectId, ref: 'team' },
        permissions:        {},
        history:            [],
        createdAt:          Date,
        updatedAt:          Date,
        deletedAt:          Date
    }
};
