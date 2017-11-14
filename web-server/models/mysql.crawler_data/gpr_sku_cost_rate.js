module.exports = function(sequelize, DataTypes) {
    return sequelize.define(
        // modelName
        'gpr_sku_cost_rate',

        // attributes
        {
            yyyymmdd: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: "",
                comment: "ͳ������"
            },
            group_name: {
                type: DataTypes.STRING(64),
                allowNull: false,
                defaultValue: "",
                comment: "С��"
            },
            store_name: {
                type: DataTypes.STRING(64),
                allowNull: false,
                defaultValue: "",
                comment: "����"
            },
            sku: {
                type: DataTypes.STRING(32),
                allowNull: false,
                defaultValue: "",
                comment: "SKU"
            },
            sales_quantify: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "����"
            },
            sales_volume: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "���۶�"
            },
            refund_quantify: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "�˿�����"
            },
            refund_volume: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "�˿���"
            },
            actual_sales_volume: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "ʵ�����۶�"
            },
            selling_fees: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "Ӷ��"
            },
            selling_fees_rate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "Ӷ��ռ��"
            },
            ful_cost: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "Ful Cost"
            },
            ful_cost_rate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "��������ռ��"
            },
            merge_inventory_fees: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "�ϲַ�"
            },
            merge_inventory_fees_rate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "�ϲ�ռ��"
            },
            fba_inventory_fees: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "FBA�ִ���"
            },
            ad_fee: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "����"
            },
            ad_fee_rate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "���ռ��"
            },
            promotion_fees: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "ˢ����"
            },
            promotion_fees_rate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "ˢ��ռ��"
            },
            product_unit_price: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "��Ʒ����"
            },
            product_cost: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "��Ʒ�ɱ�"
            },
            product_cost_rate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "�ɱ�ռ��"
            },
            first_ship_unit_price: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "ͷ�̵���"
            },
            first_ship_fees: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "ͷ�̷���"
            },
            first_ship_fees_rate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "ͷ��ռ��"
            },
            last_ship_fees: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "β�̷���"
            },
            last_ship_fees_rate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "β��ռ��"
            },
            withdrawal_service_fee: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "���������"
            },
            withdrawal_service_fee_rate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "������ռ��"
            },
            rejects_quantify: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "����Ʒ����"
            },
            rejects_cost: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "����Ʒ�ɱ�"
            },
            rejects_cost_rate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "����Ʒռ��"
            },
            other_cost: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "�����ɱ�"
            },
            gross_profit: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "ë����"
            },
            gross_profit_rate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "ë����"
            },
            data_load_date: {
                type: DataTypes.STRING(19),
                allowNull: false,
                defaultValue: "",
                comment: "���ݼ�������"
            }
        },

        // options
        {
            tableName: 'gpr_sku_cost_rate',
            timestamps: true,
            getterMethods: {
            },
            setterMethods: {
            }
        }
    );
};
