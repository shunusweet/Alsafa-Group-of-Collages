const express = require("express");
const router = express.Router();

const controller = require("../controllers/attendanceController");
const authMiddleware = require("../middleware/authMiddleware");
const attendanceNetwork = require("../middleware/attendanceNetwork");

router.use(authMiddleware);

// Student endpoints
router.post(
  "/mark",
  attendanceNetwork,
  controller.markMyAttendance
);

router.get("/mine", controller.getMyAttendance);

// Admin endpoints
router.get("/students", controller.listStudentsForAttendance);
router.get("/", controller.listAttendance);
router.post("/manual", controller.adminAddAttendance);
router.put("/:id", controller.adminUpdateAttendance);
router.delete("/:id", controller.adminDeleteAttendance);

module.exports = router;