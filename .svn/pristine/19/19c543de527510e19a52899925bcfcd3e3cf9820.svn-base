module.exports = function(sequelize, DataTypes) {
    return sequelize.define(
        // modelName
        'amws_review_analysis_report',

        // attributes
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            asin: {
                type: DataTypes.STRING(128),
                allowNull: false,
                defaultValue: 0,
                comment: "商品唯一标示"
            },
            side: {
                type: DataTypes.STRING(32),
                allowNull: false,
                defaultValue: 0,
                comment: "站点，如美国站点，日本站点"
            },
            persentiment_json: {
                type: DataTypes.STRING(0),
                allowNull: false,
                defaultValue: 0,
                comment: "各个情感倾向，各个评分，各个NP非NP的评论个数，JSON格式"
            },
            word_json: {
                type: DataTypes.STRING(0),
                allowNull: false,
                defaultValue: 0,
                comment: "每种词性每种评分，词语出现次数的前n个词语和出现次数"
            },
            review_cnt: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "评论的个数"
            },
            brand: {
                type: DataTypes.STRING(256),
                allowNull: false,
                defaultValue: 0,
                comment: "商品的品牌"
            },
            in_time: {
                type: DataTypes.STRING(64),
                allowNull: false,
                defaultValue: 0,
                comment: "生产报告时间"
            }
        },

        // options
        {
            tableName: 'amws_reviews',
            timestamps: false,
            getterMethods: {
            },
            setterMethods: {
            }
        }
    );
};
