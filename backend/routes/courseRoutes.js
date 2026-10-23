
const express = require("express");
const router = express.Router();

const {
  addCourse,
  getCourses,
  getSingleCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");

const authMiddleware = require("../middleware/authMiddleware");
const courseUpload = require("../config/courseUpload");

// ADD COURSE
router.post(
  "/",
  authMiddleware,
  courseUpload.single("courseImage"),
  addCourse
);

// GET ALL COURSES
router.get("/", getCourses);

// GET SINGLE COURSE
router.get("/:id", authMiddleware, getSingleCourse);

// UPDATE COURSE
router.put(
  "/:id",
  authMiddleware,
  courseUpload.single("courseImage"),
  updateCourse
);

// DELETE COURSE
router.delete("/:id", authMiddleware, deleteCourse);

module.exports = router;
