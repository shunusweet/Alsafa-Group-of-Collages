
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

// =====================================================
// USER HELPERS
// =====================================================
const pk = (user) =>
  user?.id ??
  user?.studentId ??
  user?.student_id ??
  user?.userId;

const role = (user) =>
  String(user?.role || user?.userType || user?.type || "")
    .toLowerCase()
    .trim();

// Existing admin accounts use role="user".
// Student login generates role="student".
const isAdmin = (user) =>
  ["admin", "superadmin", "super_admin", "user"].includes(
    role(user)
  );

const isStudent = (user) =>
  role(user) === "student" && Boolean(pk(user));

// =====================================================
// DATE AND IP HELPERS
// =====================================================
const localDate = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.APP_TIME_ZONE || "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const getClientIp = (req) =>
  String(
    req.ip ||
      req.socket?.remoteAddress ||
      ""
  )
    .replace(/^::ffff:/i, "")
    .split("%")[0]
    .slice(0, 64);

// =====================================================
// PHOTO VALIDATION
// =====================================================
const cleanPhoto = (value) => {
  if (!value) return null;

  if (
    typeof value !== "string" ||
    value.length > 2500000 ||
    !/^data:image\/(jpeg|png|webp);base64,/i.test(value)
  ) {
    const error = new Error(
      "Photo must be a JPG, PNG, or WEBP image smaller than about 1.8MB."
    );
    error.status = 400;
    throw error;
  }

  return value;
};

// =====================================================
// STUDENT VALIDATION
// =====================================================
const studentExists = async (id) => {
  const student = await Student.findByPk(id);

  if (!student) {
    const error = new Error("Student account was not found.");
    error.status = 404;
    throw error;
  }

  if (
    student.status &&
    String(student.status).toLowerCase() !== "active"
  ) {
    const error = new Error(
      "This student account is not active."
    );
    error.status = 403;
    throw error;
  }

  return student;
};

// =====================================================
// GET STUDENT ATTENDANCE / CHECK-IN / CHECK-OUT
// =====================================================
exports.markMyAttendance = async (req, res) => {
  try {
    // Reject admin accounts from student attendance.
    if (!isStudent(req.user)) {
      return res.status(401).json({
        success: false,
        message: "Please sign in using a student account.",
      });
    }

    const studentId = pk(req.user);

    await studentExists(studentId);

    const date = localDate();
    const photo = cleanPhoto(req.body?.photo);

    let record = await Attendance.findOne({
      where: {
        studentId,
        attendanceDate: date,
      },
    });

    // First check-in of the day.
    if (!record) {
      record = await Attendance.create({
        studentId,
        attendanceDate: date,
        checkIn: new Date(),
        checkInIp: getClientIp(req),
        checkInPhoto: photo,
        status: "Present",
        source:
          req.body?.source === "QR"
            ? "QR"
            : "Student Panel",
      });

      return res.status(201).json({
        success: true,
        action: "check-in",
        message: "Check-in recorded successfully.",
        attendance: record,
      });
    }

    if (record.status === "Absent") {
      return res.status(409).json({
        success: false,
        message:
          "Your attendance has been marked Absent by the administration. Please contact the institute if this is incorrect.",
        attendance: record,
      });
    }

    // Restore a missing check-in, if applicable.
    if (!record.checkIn) {
      await record.update({
        checkIn: new Date(),
        checkInIp: getClientIp(req),
        checkInPhoto: photo,
        status:
          record.status === "Late" ? "Late" : "Present",
        source:
          req.body?.source === "QR"
            ? "QR"
            : "Student Panel",
      });

      return res.json({
        success: true,
        action: "check-in",
        message: "Check-in recorded successfully.",
        attendance: record,
      });
    }

    // Second action: check-out.
    if (!record.checkOut) {
      await record.update({
        checkOut: new Date(),
        checkOutIp: getClientIp(req),
        checkOutPhoto: photo,
      });

      return res.json({
        success: true,
        action: "check-out",
        message: "Check-out recorded successfully.",
        attendance: record,
      });
    }

    return res.status(409).json({
      success: false,
      message:
        "Your check-in and check-out are already recorded for today.",
      attendance: record,
    });
  } catch (error) {
    console.error("Mark Attendance Error:", error);

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.message || "Could not record attendance.",
    });
  }
};

// =====================================================
// GET MY ATTENDANCE
// =====================================================
exports.getMyAttendance = async (req, res) => {
  try {
    if (!isStudent(req.user)) {
      return res.status(401).json({
        success: false,
        message: "Please sign in using a student account.",
      });
    }

    const studentId = pk(req.user);

    const attendance = await Attendance.findAll({
      where: { studentId },
      order: [
        ["attendanceDate", "DESC"],
        ["id", "DESC"],
      ],
      limit: 100,
    });

    return res.json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("Get My Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// ADMIN: LIST ATTENDANCE
// =====================================================
exports.listAttendance = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    const where = {};

    if (req.query.date) {
      where.attendanceDate = req.query.date;
    }

    if (req.query.status && req.query.status !== "All") {
      where.status = req.query.status;
    }

    if (req.query.studentId) {
      where.studentId = req.query.studentId;
    }

    const attendance = await Attendance.findAll({
      where,
      include: [
        {
          model: Student,
          as: "student",
          attributes: [
            "id",
            "name",
            "fatherName",
            "email",
            "phone",
            "course",
          ],
        },
      ],
      order: [
        ["attendanceDate", "DESC"],
        ["checkIn", "DESC"],
      ],
      limit: 1000,
    });

    return res.json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("List Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// ADMIN: ADD ATTENDANCE MANUALLY
// =====================================================
exports.adminAddAttendance = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    const {
      studentId,
      date,
      checkIn,
      checkOut,
      status,
      notes,
    } = req.body || {};

    if (!studentId || !date) {
      return res.status(400).json({
        success: false,
        message:
          "Student and attendance date are required.",
      });
    }

    await studentExists(studentId);

    const [record, created] = await Attendance.findOrCreate({
      where: {
        studentId,
        attendanceDate: date,
      },
      defaults: {
        studentId,
        attendanceDate: date,
        checkIn: checkIn || null,
        checkOut: checkOut || null,
        status: ["Present", "Late", "Absent"].includes(status)
          ? status
          : "Present",
        source: "Admin Manual",
        notes: notes || null,
      },
    });

    if (!created) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance already exists for this student on that date. Edit the existing record instead.",
        attendance: record,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Attendance added manually.",
      attendance: record,
    });
  } catch (error) {
    console.error("Admin Add Attendance Error:", error);

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.message || "Could not add attendance.",
    });
  }
};

// =====================================================
// ADMIN: UPDATE ATTENDANCE
// =====================================================
exports.adminUpdateAttendance = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    const record = await Attendance.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found.",
      });
    }

    const allowed = [
      "attendanceDate",
      "checkIn",
      "checkOut",
      "status",
      "notes",
    ];

    const values = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        values[key] =
          req.body[key] === "" ? null : req.body[key];
      }
    }

    if (
      values.status &&
      !["Present", "Late", "Absent"].includes(values.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status.",
      });
    }

    await record.update(values);

    return res.json({
      success: true,
      message: "Attendance updated.",
      attendance: record,
    });
  } catch (error) {
    console.error("Admin Update Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// ADMIN: DELETE ATTENDANCE
// =====================================================
exports.adminDeleteAttendance = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    const record = await Attendance.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found.",
      });
    }

    await record.destroy();

    return res.json({
      success: true,
      message: "Attendance record deleted.",
    });
  } catch (error) {
    console.error("Admin Delete Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// ADMIN: GET STUDENTS FOR ATTENDANCE
// =====================================================
exports.listStudentsForAttendance = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    const students = await Student.findAll({
      attributes: [
        "id",
        "name",
        "fatherName",
        "email",
        "course",
        "status",
      ],
      order: [["name", "ASC"]],
      limit: 2000,
    });

    return res.json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("List Attendance Students Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
