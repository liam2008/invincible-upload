module.exports = function(sequelize, DataTypes) {
    return sequelize.define(
        // modelName
        't_crawler_task',

        // attributes
        {
            task_id: {
                type: DataTypes.STRING(64),
                allowNull: false,
                defaultValue: "",
                comment: "���"
            },
            task_name: {
                type: DataTypes.STRING(255),
                allowNull: false,
                defaultValue: "",
                comment: "����"
            },
            task_type: {
                type: DataTypes.STRING(255),
                allowNull: false,
                defaultValue: "",
                comment: "����"
            },
            create_time: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: "",
                comment: "���ͱ��"
            },
            create_user: {
                type: DataTypes.STRING(255),
                allowNull: false,
                defaultValue: 0,
                comment: "״̬"
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "ֵ"
            },
            update_time: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: 0,
                comment: "����ʱ��"
            },
            task_rule: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 0,
                comment: "����ʱ��"
            }
        },

        // options
        {
            tableName: 't_crawler_task',
            timestamps: true,
            getterMethods: {
            },
            setterMethods: {
            }
        }
    );
};
