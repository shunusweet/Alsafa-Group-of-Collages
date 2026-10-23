const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Fee = sequelize.define(
    "Fee",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        studentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            field: "student_id"
        },

        totalFee: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: "total_fee",
            validate: {
                min: 0.01
            }
        }
    },
    {
        tableName: "fees",
        timestamps: true,
        underscored: true
    }
);

module.exports = Fee;