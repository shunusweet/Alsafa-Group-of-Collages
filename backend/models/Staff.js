const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // Adjust this import if your project exports sequelize differently.
const bcrypt = require("bcryptjs");

const Staff = sequelize.define(
  "Staff",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    staffName: { type: DataTypes.STRING(150), allowNull: false, field: "staff_name" },
    fatherName: { type: DataTypes.STRING(150), allowNull: false, field: "father_name" },
    designation: { type: DataTypes.STRING(150), allowNull: false },
    cnicNo: { type: DataTypes.STRING(20), allowNull: false, unique: true, field: "cnic_no" },
    mobileNo: { type: DataTypes.STRING(30), allowNull: false, field: "mobile_no" },
    address: { type: DataTypes.TEXT, allowNull: false },
    salary: { type: DataTypes.DECIMAL(10, 2), allowNull: true, validate: { min: 0 } },
    email: { type: DataTypes.STRING(255), allowNull: true, unique: true, validate: { isEmail: true } },
    passwordHash: { type: DataTypes.STRING(255), allowNull: true, field: "password_hash" },
    image: { type: DataTypes.STRING(500), allowNull: true },
    cnicImageFront: { type: DataTypes.STRING(500), allowNull: true, field: "cnic_image_front" },
    cnicImageBack: { type: DataTypes.STRING(500), allowNull: true, field: "cnic_image_back" },
  },
  {
    tableName: "staff",
    timestamps: true,
    underscored: true,
    defaultScope: { attributes: { exclude: ["passwordHash"] } },
    scopes: { withPasswordHash: { attributes: {} } },
  }
);

module.exports = Staff;
