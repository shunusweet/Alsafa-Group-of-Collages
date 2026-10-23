
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const staffOnly = require("../middleware/staffOnly");
const {
  getMyStaffProfile,
} = require("../controllers/staffPortalController");

router.get("/me", authMiddleware, staffOnly, getMyStaffProfile);

module.exports = router;
