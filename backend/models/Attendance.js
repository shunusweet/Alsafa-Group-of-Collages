
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Attendance = sequelize.define(
  "Attendance",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "student_id"
    },

    attendanceDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "attendance_date"
    },

    checkIn: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "check_in"
    },

    checkOut: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "check_out"
    },

    status: {
      type: DataTypes.ENUM("Present", "Late", "Absent"),
      allowNull: false,
      defaultValue: "Present"
    },

    source: {
      type: DataTypes.ENUM(
        "Student Panel",
        "Admin Manual",
        "QR"
      ),
      allowNull: false,
      defaultValue: "Student Panel"
    },

    checkInIp: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: "check_in_ip"
    },

    checkOutIp: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: "check_out_ip"
    },

    checkInPhoto: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
      field: "check_in_photo"
    },

    checkOutPhoto: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
      field: "check_out_photo"
    },

    notes: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  },
  {
    tableName: "student_attendance",
    timestamps: true,
    underscored: true,

    indexes: [
      {
        unique: true,
        fields: ["student_id", "attendance_date"]
      }
    ]
  }
);

module.exports = Attendance;
