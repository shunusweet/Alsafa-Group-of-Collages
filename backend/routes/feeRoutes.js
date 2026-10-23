const express = require("express");

const router = express.Router();

const {
    getFees,
    addFeePayment,
    clearFees
} = require("../controllers/feeController");

const authMiddleware =
    require("../middleware/authMiddleware");

// Get all fee accounts and payment history
router.get(
    "/",
    authMiddleware,
    getFees
);

// Create a fee account on the first payment,
// or add another monthly payment
router.post(
    "/",
    authMiddleware,
    addFeePayment
);

// Add the remaining balance as a final payment
router.post(
    "/:id/clear",
    authMiddleware,
    clearFees
);

module.exports = router;