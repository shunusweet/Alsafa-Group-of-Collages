// Attendance model relationships are initialized from server.js after models load.
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");

if (!Student.associations.attendanceRecords) {
  Student.hasMany(Attendance, { foreignKey: "studentId", as: "attendanceRecords" });
}
if (!Attendance.associations.student) {
  Attendance.belongsTo(Student, { foreignKey: "studentId", as: "student" });
}

module.exports = { Student, Attendance };
