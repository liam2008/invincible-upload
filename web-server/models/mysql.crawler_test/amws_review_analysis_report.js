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
                comment: "��ƷΨһ��ʾ"
            },
            side: {
                type: DataTypes.STRING(32),
                allowNull: false,
                defaultValue: 0,
                comment: "վ�㣬������վ�㣬�ձ�վ��"
            },
            persentiment_json: {
                type: DataTypes.STRING(0),
                allowNull: false,
                defaultValue: 0,
                comment: "����������򣬸������֣�����NP��NP�����۸�����JSON��ʽ"
            },
            word_json: {
                type: DataTypes.STRING(0),
                allowNull: false,
                defaultValue: 0,
                comment: "ÿ�ִ���ÿ�����֣�������ִ�����ǰn������ͳ��ִ���"
            },
            review_cnt: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "���۵ĸ���"
            },
            brand: {
                type: DataTypes.STRING(256),
                allowNull: false,
                defaultValue: 0,
                comment: "��Ʒ��Ʒ��"
            },
            in_time: {
                type: DataTypes.STRING(64),
                allowNull: false,
                defaultValue: 0,
                comment: "��������ʱ��"
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
