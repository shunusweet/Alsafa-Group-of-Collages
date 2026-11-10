
const { Op } = require("sequelize");
const StaffAttendance = require("../models/StaffAttendance");
const Staff = require("../models/Staff");

const getStaffId = (req) =>
  Number(req.user?.staffId || req.user?.id || 0);

const todayInPakistan = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.ATTENDANCE_TIMEZONE || "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const isAdmin = (req) => {
  const role = String(
    req.user?.role || req.user?.userType || req.user?.type || ""
  ).toLowerCase();

  return ["admin", "superadmin", "super_admin", "user"].includes(role);
};

const getMyAttendance = async (req, res) => {
  try {
    const staffId = getStaffId(req);

    if (!staffId) {
      return res.status(401).json({
        success: false,
        message: "Staff authentication required.",
      });
    }

    const where = { staffId };

    if (req.query.from || req.query.to) {
      where.attendanceDate = {};

      if (req.query.from) where.attendanceDate[Op.gte] = req.query.from;
      if (req.query.to) where.attendanceDate[Op.lte] = req.query.to;
    }

    const records = await StaffAttendance.findAll({
      where,
      order: [["attendanceDate", "DESC"]],
    });

    return res.json({ success: true, records });
  } catch (error) {
    console.error("getMyAttendance:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load attendance.",
    });
  }
};

const markMyAttendance = async (req, res) => {
  try {
    const staffId = getStaffId(req);

    if (!staffId) {
      return res.status(401).json({
        success: false,
        message: "Staff authentication required.",
      });
    }

    const staff = await Staff.findByPk(staffId);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff profile not found.",
      });
    }

    const attendanceDate = todayInPakistan();

    let record = await StaffAttendance.findOne({
      where: { staffId, attendanceDate },
    });

    if (!record) {
      record = await StaffAttendance.create({
        staffId,
        attendanceDate,
        checkIn: new Date(),
        status: "Present",
        source: "Staff Portal",
      });

      return res.status(201).json({
        success: true,
        message: "Check-in recorded successfully.",
        record,
      });
    }

    if (!record.checkIn) {
      await record.update({
        checkIn: new Date(),
        source: "Staff Portal",
      });

      return res.json({
        success: true,
        message: "Check-in recorded successfully.",
        record,
      });
    }

    if (record.checkOut) {
      return res.status(409).json({
        success: false,
        message: "Attendance is already completed for today.",
        record,
      });
    }

    const checkOut = new Date();
    const elapsed = Math.max(
      0,
      Math.floor((checkOut - new Date(record.checkIn)) / 60000)
    );

    await record.update({
      checkOut,
      workingMinutes: elapsed,
    });

    return res.json({
      success: true,
      message: "Check-out recorded successfully.",
      record,
    });
  } catch (error) {
    console.error("markMyAttendance:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to mark attendance.",
    });
  }
};

const adminGetAttendance = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    const records = await StaffAttendance.findAll({
      include: [{
        model: Staff,
        as: "staff",
        attributes: ["id", "staffName", "designation", "cnicNo"],
      }],
      order: [["attendanceDate", "DESC"]],
    });

    return res.json({ success: true, records });
  } catch (error) {
    console.error("adminGetAttendance:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load staff attendance.",
    });
  }
};

const adminCreateAttendance = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    const {
      staffId,
      attendanceDate,
      checkIn,
      checkOut,
      status,
      remarks,
    } = req.body;

    if (!staffId || !attendanceDate) {
      return res.status(400).json({
        success: false,
        message: "Staff ID and attendance date are required.",
      });
    }

    const staff = await Staff.findByPk(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found.",
      });
    }

    const allowedStatuses = ["Present", "Late", "Absent"];
    const finalStatus = status || "Present";

    if (!allowedStatuses.includes(finalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status.",
      });
    }

    const existing = await StaffAttendance.findOne({
      where: { staffId, attendanceDate },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Attendance already exists for this staff member and date.",
      });
    }

    const start = checkIn ? new Date(checkIn) : null;
    const end = checkOut ? new Date(checkOut) : null;

    if (start && Number.isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid check-in time.",
      });
    }

    if (end && Number.isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid check-out time.",
      });
    }

    if (start && end && end < start) {
      return res.status(400).json({
        success: false,
        message: "Check-out cannot be before check-in.",
      });
    }

    const workingMinutes =
      start && end ? Math.floor((end - start) / 60000) : 0;

    const record = await StaffAttendance.create({
      staffId,
      attendanceDate,
      checkIn: start,
      checkOut: end,
      status: finalStatus,
      workingMinutes,
      source: "Admin",
      remarks: remarks || null,
    });

    return res.status(201).json({
      success: true,
      message: "Attendance added successfully.",
      record,
    });
  } catch (error) {
    console.error("adminCreateAttendance:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to add attendance.",
    });
  }
};

const adminUpdateAttendance = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    const record = await StaffAttendance.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found.",
      });
    }

    const allowedStatuses = ["Present", "Late", "Absent"];
    const updates = {};
    const fields = [
      "attendanceDate",
      "checkIn",
      "checkOut",
      "status",
      "remarks",
    ];

    for (const field of fields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field] === "" ? null : req.body[field];
      }
    }

    if (updates.status && !allowedStatuses.includes(updates.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status.",
      });
    }

    const startValue =
      updates.checkIn !== undefined ? updates.checkIn : record.checkIn;
    const endValue =
      updates.checkOut !== undefined ? updates.checkOut : record.checkOut;

    const start = startValue ? new Date(startValue) : null;
    const end = endValue ? new Date(endValue) : null;

    if (
      (start && Number.isNaN(start.getTime())) ||
      (end && Number.isNaN(end.getTime()))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid check-in or check-out time.",
      });
    }

    if (start && end && end < start) {
      return res.status(400).json({
        success: false,
        message: "Check-out cannot be before check-in.",
      });
    }

    updates.workingMinutes =
      start && end ? Math.floor((end - start) / 60000) : 0;

    await record.update(updates);

    return res.json({
      success: true,
      message: "Attendance updated successfully.",
      record,
    });
  } catch (error) {
    console.error("adminUpdateAttendance:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update attendance.",
    });
  }
};

const adminDeleteAttendance = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    const record = await StaffAttendance.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found.",
      });
    }

    await record.destroy();

    return res.json({
      success: true,
      message: "Attendance deleted successfully.",
    });
  } catch (error) {
    console.error("adminDeleteAttendance:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete attendance.",
    });
  }
};

module.exports = {
  getMyAttendance,
  markMyAttendance,
  adminGetAttendance,
  adminCreateAttendance,
  adminUpdateAttendance,
  adminDeleteAttendance,
};
