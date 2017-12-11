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
                comment: "编号"
            },
            task_name: {
                type: DataTypes.STRING(255),
                allowNull: false,
                defaultValue: "",
                comment: "名称"
            },
            task_type: {
                type: DataTypes.STRING(255),
                allowNull: false,
                defaultValue: "",
                comment: "类型"
            },
            create_time: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: "",
                comment: "类型编号"
            },
            create_user: {
                type: DataTypes.STRING(255),
                allowNull: false,
                defaultValue: 0,
                comment: "状态"
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "值"
            },
            update_time: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: 0,
                comment: "创建时间"
            },
            task_rule: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 0,
                comment: "创建时间"
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
