var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    name: "role",
    schema: {
        _id:            Schema.Types.ObjectId,
        name:           String,
        type:           String,
        department:     String,
        management:     [],     // 可管理的角色type
        routes:         [],
        history:        [],
        createdAt:      Date,
        updatedAt:      Date,
        deletedAt:      Date
    }
};
