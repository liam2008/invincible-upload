module.exports = function(sequelize, DataTypes) {
    return sequelize.define(
        // modelName
        'amws_goods',

        // attributes
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            goods_key: {
                type: DataTypes.STRING(256),
                allowNull: false,
                defaultValue: "",
                comment: "组合主键"
            },
            in_time: {
                type: DataTypes.STRING(64),
                allowNull: true,
                defaultValue: "",
                comment: "数据统计时间"
            },
            asin: {
                type: DataTypes.STRING(128),
                allowNull: true,
                defaultValue: 0,
                comment: "商品唯一标示"
            },
            side: {
                type: DataTypes.STRING(32),
                allowNull: true,
                defaultValue: 0,
                comment: "站点，如美国站点，日本站点"
            },
            img_url: {
                type: DataTypes.STRING(256),
                allowNull: false,
                defaultValue: 0,
                comment: "图片URL"
            },
            title: {
                type: DataTypes.STRING(128),
                allowNull: false,
                defaultValue: 0,
                comment: "标题"
            },
            price: {
                type: DataTypes.STRING(32),
                allowNull: false,
                defaultValue: 0,
                comment: "售价"
            },
            total_star: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "评价星级"
            },
            reviews_cnt: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "评价数量"
            },
            vp_cnt: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "VP数量"
            },
            vp_proportion: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "VP数量/reviews数量"
            },
            nvp_cnt: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "非VP数量"
            },
            nvp_proportion: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "非VP数量/reviews数量"
            },
            review_first_time: {
                type: DataTypes.STRING(32),
                allowNull: false,
                defaultValue: 0,
                comment: "最早评价的时间"
            },
            review_last_time: {
                type: DataTypes.STRING(32),
                allowNull: false,
                defaultValue: 0,
                comment: "最近评价的时间"
            },
            brand: {
                type: DataTypes.STRING(128),
                allowNull: false,
                defaultValue: 0,
                comment: "商品品牌"
            }
        },

        // options
        {
            tableName: 'amws_goods',
            timestamps: false,
            getterMethods: {
            },
            setterMethods: {
            }
        }
    );
};
