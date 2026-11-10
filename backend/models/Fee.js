
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Fee = sequelize.define(
  "Fee",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: "student_id",
    },

    totalFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: "total_fee",
    },

    monthlyFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: "monthly_fee",
    },
  },
  {
    tableName: "fees",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Fee;
