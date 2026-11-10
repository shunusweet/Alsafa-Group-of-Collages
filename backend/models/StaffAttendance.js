
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const StaffAttendance = sequelize.define(
  "StaffAttendance",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    staffId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "staff_id",
      references: {
        model: "staff",
        key: "id",
      },
    },

    attendanceDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "attendance_date",
    },

    checkIn: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "check_in",
    },

    checkOut: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "check_out",
    },

    status: {
      type: DataTypes.ENUM("Present", "Late", "Absent"),
      allowNull: false,
      defaultValue: "Present",
    },

    workingMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "working_minutes",
      validate: { min: 0 },
    },

    source: {
      type: DataTypes.ENUM("Staff Portal", "Admin"),
      allowNull: false,
      defaultValue: "Staff Portal",
    },

    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "staff_attendance",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["staff_id", "attendance_date"],
      },
    ],
  }
);

module.exports = StaffAttendance;
