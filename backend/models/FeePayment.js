
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const FeePayment = sequelize.define(
  "FeePayment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    feeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "fee_id",
    },

    month: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },

    amountPaid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: "amount_paid",
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "fee_payments",
    timestamps: true,
    underscored: true,
  }
);

module.exports = FeePayment;
