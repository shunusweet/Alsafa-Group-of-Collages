
const express = require("express");
const router = express.Router();

const {
  addStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../config/upload");

router.post("/", authMiddleware, upload.single("image"), addStudent);

router.get("/", getStudents);

router.get("/:id", authMiddleware, getStudent);

router.put("/:id", authMiddleware, upload.single("image"), updateStudent);

router.delete("/:id", authMiddleware, deleteStudent);

module.exports = router;
