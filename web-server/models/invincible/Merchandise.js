// 商品信息 面对店铺

module.exports = {
    name: "merchandise",
    schema: {
        id:             String,     // id 使用UUID
        seller_sku:     String,     // 卖家SKU
        store_sku:      String,     // 仓库SKU
        FBA:            Number,     // 是否FBA 1是 0否
        fnsku:          String,     // FNSKU
        asin:           String,     // ASIN
        name:           String,     // 当地语言名字:英文\日文等
        shop_name:      String,     // 店铺名
        team_name:      String,     // 小组名
        state:          Number,     // 状态 0:停售, 1:未开售, 2:推广期, 3:在售期, 4:清仓期 5:归档 6:备用
        barcode:        String,     // 条形编码

        team_history:   [],         // 小组历史
        director:       String,     // 主管
        director_history: [],       // 主管历史
        price:          Number,     // 基准价格
        projected_sales: Number,    // 预计销量
        createdAt:      Date,       // 创建时间
        updatedAt:      Date,       // 修改时间
        deletedAt:      Date        // 删除时间
    }
};
