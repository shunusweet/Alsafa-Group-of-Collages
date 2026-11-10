const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const staffOnly = require("../middleware/staffOnly");
const attendanceNetwork = require("../middleware/attendanceNetwork");

const {
  getMyAttendance,
  markMyAttendance,
  adminGetAttendance,
  adminCreateAttendance,
  adminUpdateAttendance,
  adminDeleteAttendance,
} = require("../controllers/staffAttendanceController");

// Staff: own attendance history
router.get(
  "/mine",
  authMiddleware,
  staffOnly,
  getMyAttendance
);

// Staff: check-in / check-out restricted to institute network
router.post(
  "/mark",
  authMiddleware,
  staffOnly,
  attendanceNetwork,
  markMyAttendance
);

// Admin routes: authentication + admin-role authorization
router.get("/", authMiddleware, adminGetAttendance);
router.post("/", authMiddleware, adminCreateAttendance);
router.put("/:id", authMiddleware, adminUpdateAttendance);
router.delete("/:id", authMiddleware, adminDeleteAttendance);

module.exports = router;