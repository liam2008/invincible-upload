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
                comment: "统计日期"
            },
            group_name: {
                type: DataTypes.STRING(64),
                allowNull: false,
                defaultValue: "",
                comment: "小组"
            },
            store_name: {
                type: DataTypes.STRING(64),
                allowNull: false,
                defaultValue: "",
                comment: "店铺"
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
                comment: "销量"
            },
            sales_volume: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "销售额"
            },
            refund_quantify: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "退款数量"
            },
            refund_volume: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "退款金额"
            },
            actual_sales_volume: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "实际销售额"
            },
            selling_fees: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "佣金"
            },
            selling_fees_rate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "佣金占比"
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
                comment: "物流配送占比"
            },
            merge_inventory_fees: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "合仓费"
            },
            merge_inventory_fees_rate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "合仓占比"
            },
            fba_inventory_fees: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "FBA仓储费"
            },
            ad_fee: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "广告费"
            },
            ad_fee_rate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "广告占比"
            },
            promotion_fees: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "刷单费"
            },
            promotion_fees_rate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "刷单占比"
            },
            product_unit_price: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "产品单价"
            },
            product_cost: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "产品成本"
            },
            product_cost_rate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "成本占比"
            },
            first_ship_unit_price: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "头程单价"
            },
            first_ship_fees: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "头程费用"
            },
            first_ship_fees_rate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "头程占比"
            },
            last_ship_fees: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "尾程费用"
            },
            last_ship_fees_rate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "尾程占比"
            },
            withdrawal_service_fee: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "提款手续费"
            },
            withdrawal_service_fee_rate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "手续费占比"
            },
            rejects_quantify: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "不良品数量"
            },
            rejects_cost: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "不良品成本"
            },
            rejects_cost_rate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "不良品占比"
            },
            other_cost: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "其他成本"
            },
            gross_profit: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "毛利润"
            },
            gross_profit_rate: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "毛利率"
            },
            data_load_date: {
                type: DataTypes.STRING(19),
                allowNull: false,
                defaultValue: "",
                comment: "数据加载日期"
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
