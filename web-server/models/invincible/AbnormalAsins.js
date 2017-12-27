// 异常ASIN信息

module.exports = {
    name: "abnormal_asin",
    schema: {
        identify: String,   // 唯一标识 用相关信息编制MD5码
        ASIN: String,       // ASIN
        site: String,       // 站点 US、UK 等
        data: {},           // 数据
        status: Number,     // 状态 0: 初始获取, 1: 已处理

        createdAt: Date,    // 创建时间
        updatedAt: Date     // 修改时间
    }
};