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
                comment: "���"
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
                defaultValue: "",
                comment: "����"
            },
            type: {
                type: DataTypes.STRING(255),
                allowNull: false,
                defaultValue: "",
                comment: "����"
            },
            type_code: {
                type: DataTypes.STRING(255),
                allowNull: false,
                defaultValue: "",
                comment: "���ͱ��"
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "״̬"
            },
            val: {
                type: DataTypes.STRING(255),
                allowNull: false,
                defaultValue: 0,
                comment: "ֵ"
            },
            create_time: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: 0,
                comment: "����ʱ��"
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
