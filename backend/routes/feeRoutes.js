const express = require("express");
const router = express.Router();

const {
  getFees,
  addFeePayment,
  clearFees,
} = require("../controllers/feeController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getFees);

router.post("/", authMiddleware, addFeePayment);

router.post("/:id/clear", authMiddleware, clearFees);

module.exports = router;