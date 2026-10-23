const express = require("express");
const router = express.Router();

const { addStaff, getStaff, getSingleStaff, updateStaff, deleteStaff } = require("../controllers/staffController");
const authMiddleware = require("../middleware/authMiddleware");
const staffUpload = require("../config/staffUpload");

// This middleware must be a multer instance (staffUpload.fields(...)), not an already-created .fields() middleware.
const uploadFields = staffUpload.fields([
  { name: "image", maxCount: 1 },
  { name: "cnicImageFront", maxCount: 1 },
  { name: "cnicImageBack", maxCount: 1 },
]);

router.get("/", getStaff);
router.get("/:id", authMiddleware, getSingleStaff);
router.post("/", authMiddleware, uploadFields, addStaff);
router.put("/:id", authMiddleware, uploadFields, updateStaff);
router.delete("/:id", authMiddleware, deleteStaff);

module.exports = router;
