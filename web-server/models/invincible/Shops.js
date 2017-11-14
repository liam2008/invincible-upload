
module.exports = {
    name: "shops",
    schema: {
        id:         String,     // uuid
        seller_id:  String,     // 亚马逊上面的店铺ID
        name:       String,     // 店铺名称
        site:       String,     // 站点 US UK JP DE ...
        createdAt:  Date,       // 创建时间
        updatedAt:  Date,       // 修改时间
        deletedAt:  Date        // 删除时间
    }
};
