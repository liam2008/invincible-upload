module.exports = function(sequelize, DataTypes) {
    return sequelize.define(
        // modelName
        'amws_reviews',

        // attributes
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            review_id: {
                type: DataTypes.STRING(128),
                allowNull: false,
                defaultValue: "",
                comment: "评论唯一标识"
            },
            data_time: {
                type: DataTypes.STRING(64),
                allowNull: false,
                defaultValue: "",
                comment: "获取数据的时间"
            },
            review_time: {
                type: DataTypes.STRING(64),
                allowNull: false,
                defaultValue: "",
                comment: "评价时间"
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
            star: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "评分星级"
            },
            author_id: {
                type: DataTypes.STRING(128),
                allowNull: false,
                defaultValue: 0,
                comment: "评价人ID"
            },
            author: {
                type: DataTypes.STRING(128),
                allowNull: false,
                defaultValue: 0,
                comment: "评价名称"
            },
            verified_purchase: {
                type: DataTypes.STRING(32),
                allowNull: false,
                defaultValue: 0,
                comment: "是否VP"
            },
            has_img: {
                type: DataTypes.STRING(32),
                allowNull: false,
                defaultValue: 0,
                comment: "是否有图"
            },
            has_video: {
                type: DataTypes.STRING(32),
                allowNull: false,
                defaultValue: 0,
                comment: "是否有视频"
            },
            content: {
                type: DataTypes.STRING(0),
                allowNull: false,
                defaultValue: 0,
                comment: "评论内容"
            },
            vote_num: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "点赞次数"
            },
            reply_num: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "回复次数"
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
