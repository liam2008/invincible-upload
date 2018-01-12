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
                comment: "����Ψһ��ʶ"
            },
            data_time: {
                type: DataTypes.STRING(64),
                allowNull: false,
                defaultValue: "",
                comment: "��ȡ���ݵ�ʱ��"
            },
            review_time: {
                type: DataTypes.STRING(64),
                allowNull: false,
                defaultValue: "",
                comment: "����ʱ��"
            },
            asin: {
                type: DataTypes.STRING(128),
                allowNull: false,
                defaultValue: 0,
                comment: "��ƷΨһ��ʾ"
            },
            side: {
                type: DataTypes.STRING(32),
                allowNull: false,
                defaultValue: 0,
                comment: "վ�㣬������վ�㣬�ձ�վ��"
            },
            star: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "�����Ǽ�"
            },
            author_id: {
                type: DataTypes.STRING(128),
                allowNull: false,
                defaultValue: 0,
                comment: "������ID"
            },
            author: {
                type: DataTypes.STRING(128),
                allowNull: false,
                defaultValue: 0,
                comment: "��������"
            },
            verified_purchase: {
                type: DataTypes.STRING(32),
                allowNull: false,
                defaultValue: 0,
                comment: "�Ƿ�VP"
            },
            has_img: {
                type: DataTypes.STRING(32),
                allowNull: false,
                defaultValue: 0,
                comment: "�Ƿ���ͼ"
            },
            has_video: {
                type: DataTypes.STRING(32),
                allowNull: false,
                defaultValue: 0,
                comment: "�Ƿ�����Ƶ"
            },
            content: {
                type: DataTypes.STRING(0),
                allowNull: false,
                defaultValue: 0,
                comment: "��������"
            },
            vote_num: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "���޴���"
            },
            reply_num: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "�ظ�����"
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
