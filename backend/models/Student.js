const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Student = sequelize.define(
    "Student",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        fatherName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: "father_name"
        },
        cnic: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        qualification: {
            type: DataTypes.STRING(150),
            allowNull: true
        },
        domicile: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        // Only the bcrypt hash is stored. The original password is never saved.
        passwordHash: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: "password_hash"
        },
        phone: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        parentPhone: {
            type: DataTypes.STRING(30),
            allowNull: true,
            field: "parent_phone"
        },
        gender: {
            type: DataTypes.ENUM("Male", "Female", "Other"),
            allowNull: false
        },
        course: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM("Active", "De-Active"),
            allowNull: false,
            defaultValue: "Active"
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    },
    {
        tableName: "students",
        timestamps: true,
        underscored: true
    }
);

module.exports = Student;
