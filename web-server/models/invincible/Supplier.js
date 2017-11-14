var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    name: "supplier",
    schema: {
        _id: Schema.Types.ObjectId,
        name: String,                       // 供应商名字
        contacts: String,                   // 联系人
        telephone: String,                  // 固定电话
        cellphone: String,                  // 手机号码

        createdAt: Date,
        updatedAt: Date
    }
};
