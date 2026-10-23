
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const {
  connectDB,
  sequelize,
} = require("./config/database");

// ==========================================
// MODELS
// ==========================================

const User = require("./models/User");
const Student = require("./models/Student");
const Course = require("./models/Course");
const Staff = require("./models/Staff");
const Fee = require("./models/Fee");
const FeePayment = require("./models/FeePayment");
const Attendance = require("./models/Attendance");
const staffAuthRoutes = require("./routes/staffAuthRoutes");
const staffPortalRoutes = require("./routes/staffPortalRoutes");

// ==========================================
// ROUTES
// ==========================================

const authRoutes = require("./routes/authRoutes");
const studentAuthRoutes = require("./routes/studentAuthRoutes");
const studentRoutes = require("./routes/studentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const staffRoutes = require("./routes/staffRoutes");
const feeRoutes = require("./routes/feeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

// ==========================================
// DATABASE RELATIONSHIPS
// Define associations BEFORE sequelize.sync()
// ==========================================

// One student has one fee account.
if (!Student.associations.feeAccount) {
  Student.hasOne(Fee, {
    foreignKey: "studentId",
    as: "feeAccount",
  });
}

if (!Fee.associations.student) {
  Fee.belongsTo(Student, {
    foreignKey: "studentId",
    as: "student",
  });
}

// One fee account has many payments.
if (!Fee.associations.payments) {
  Fee.hasMany(FeePayment, {
    foreignKey: "feeId",
    as: "payments",
    onDelete: "CASCADE",
  });
}

if (!FeePayment.associations.fee) {
  FeePayment.belongsTo(Fee, {
    foreignKey: "feeId",
    as: "fee",
  });
}

// One student has many attendance records.
if (!Student.associations.attendanceRecords) {
  Student.hasMany(Attendance, {
    foreignKey: "studentId",
    as: "attendanceRecords",
    onDelete: "CASCADE",
  });
}

// Each attendance record belongs to one student.
// The alias "student" is used by the attendance controller.
if (!Attendance.associations.student) {
  Attendance.belongsTo(Student, {
    foreignKey: "studentId",
    as: "student",
  });
}

// ==========================================
// EXPRESS APP
// ==========================================

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ==========================================
// STATIC UPLOADS
// ==========================================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ==========================================
// HOME API
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Student Management System API is Running Successfully!",
  });
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/student-auth", studentAuthRoutes);

// ==========================================
// STUDENT MANAGEMENT
// ==========================================

app.use("/api/students", studentRoutes);

// ==========================================
// COURSE MANAGEMENT
// ==========================================

app.use("/api/courses", courseRoutes);

// ==========================================
// STAFF MANAGEMENT
// ==========================================

app.use("/api/staff", staffRoutes);

// ==========================================
// FEES MANAGEMENT
// ==========================================

app.use("/api/fees", feeRoutes);

// ==========================================
// ATTENDANCE MANAGEMENT
// ==========================================

app.use("/api/attendance", attendanceRoutes);


app.use("/api/staff-auth", staffAuthRoutes);
app.use("/api/staff-portal", staffPortalRoutes);


// ==========================================
// 404 NOT FOUND
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
    path: req.originalUrl,
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((error, req, res, next) => {
  console.error("Server Error:", error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
});

// ==========================================
// PORT
// ==========================================

const PORT = process.env.PORT || 5000;

// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {
  try {
    // 1. Connect to MySQL.
    await connectDB();

    // 2. Register and synchronize all imported models.
    // Creates missing tables; does not force-drop existing tables.
    await sequelize.sync();

    console.log("Database Tables Ready!");

    // 3. Start the API server.
    app.listen(PORT, () => {
      console.log("----------------------------------");
      console.log("Student Management System");
      console.log("----------------------------------");
      console.log(`Server running on port ${PORT}`);
      console.log(`API: http://localhost:${PORT}`);
      console.log(`Uploads: http://localhost:${PORT}/uploads`);
      console.log(`Admin Auth: http://localhost:${PORT}/api/auth`);
      console.log(`Student Auth: http://localhost:${PORT}/api/student-auth`);
      console.log(`Students API: http://localhost:${PORT}/api/students`);
      console.log(`Courses API: http://localhost:${PORT}/api/courses`);
      console.log(`Staff API: http://localhost:${PORT}/api/staff`);
      console.log(`Fees API: http://localhost:${PORT}/api/fees`);
      console.log(`Attendance API: http://localhost:${PORT}/api/attendance`);
      console.log("----------------------------------");
    });
  } catch (error) {
    console.error("----------------------------------");
    console.error("Server failed to start.");
    console.error("----------------------------------");
    console.error(error);

    process.exitCode = 1;
  }
};

// ==========================================
// START APPLICATION
// ==========================================

startServer();
