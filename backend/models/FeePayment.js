const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const FeePayment = sequelize.define(
    "FeePayment",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        feeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "fee_id"
        },

        month: {
            type: DataTypes.STRING(7),
            allowNull: false,
            validate: {
                is: /^\d{4}-(0[1-9]|1[0-2])$/
            }
        },

        amountPaid: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: "amount_paid",
            validate: {
                min: 0.01
            }
        },

        remarks: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        tableName: "fee_payments",
        timestamps: true,
        underscored: true
    }
);

module.exports = FeePayment;