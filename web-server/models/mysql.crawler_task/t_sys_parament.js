module.exports = function(sequelize, DataTypes) {
    return sequelize.define(
        // modelName
        't_sys_parament',

        // attributes
        {
            code: {
                type: DataTypes.STRING(64),
                allowNull: false,
                defaultValue: "",
                comment: "编号"
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
                defaultValue: "",
                comment: "名称"
            },
            type: {
                type: DataTypes.STRING(255),
                allowNull: false,
                defaultValue: "",
                comment: "类型"
            },
            type_code: {
                type: DataTypes.STRING(255),
                allowNull: false,
                defaultValue: "",
                comment: "类型编号"
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "状态"
            },
            val: {
                type: DataTypes.STRING(255),
                allowNull: false,
                defaultValue: 0,
                comment: "值"
            },
            create_time: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: 0,
                comment: "创建时间"
            }
        },

        // options
        {
            tableName: 't_sys_parament',
            timestamps: true,
            getterMethods: {
            },
            setterMethods: {
            }
        }
    );
};
