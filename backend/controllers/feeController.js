const { Op } = require("sequelize");

const Fee = require("../models/Fee");
const FeePayment = require("../models/FeePayment");
const Student = require("../models/Student");

// ==========================================
// GET ALL FEES
// ==========================================
exports.getFees = async (req, res) => {
  try {
    const fees = await Fee.findAll({
      order: [["createdAt", "DESC"]],
    });

    const result = await Promise.all(
      fees.map(async (fee) => {
        const student = await Student.findByPk(fee.studentId);

        const payments = await FeePayment.findAll({
          where: { feeId: fee.id },
          order: [["month", "ASC"]],
        });

        return {
          ...fee.toJSON(),
          student,
          payments,
        };
      })
    );

    return res.status(200).json({
      success: true,
      fees: result,
    });
  } catch (error) {
    console.error("Get Fees Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load fee records.",
    });
  }
};

// ==========================================
// ADD FEE / RECORD PAYMENT
// ==========================================
exports.addFeePayment = async (req, res) => {
  const transaction = await Fee.sequelize.transaction();

  try {
    const {
      studentId,
      totalFee,
      monthlyFee,
      month,
      amountPaid,
      remarks,
    } = req.body;

    if (!studentId || !month || !amountPaid) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Student, month and payment amount are required.",
      });
    }

    const total = Number(totalFee);
    const monthly = Number(monthlyFee);
    const paidAmount = Number(amountPaid);

    if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than zero.",
      });
    }

    if (!/^\d{4}-\d{2}$/.test(month)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid payment month.",
      });
    }

    if (monthlyFee !== undefined && (!Number.isFinite(monthly) || monthly < 0)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Monthly fee must be a valid non-negative amount.",
      });
    }

    const student = await Student.findByPk(studentId, { transaction });

    if (!student) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    let fee = await Fee.findOne({
      where: { studentId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!fee) {
      if (!Number.isFinite(total) || total <= 0) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: "Please enter a valid total fee.",
        });
      }

      fee = await Fee.create(
        {
          studentId,
          totalFee: total,
          monthlyFee: monthly || 0,
        },
        { transaction }
      );
    } else {
      if (monthlyFee !== undefined) {
        await fee.update(
          { monthlyFee: monthly },
          { transaction }
        );
      }
    }

    const payments = await FeePayment.findAll({
      where: { feeId: fee.id },
      transaction,
    });

    const alreadyPaid = payments.reduce(
      (sum, payment) => sum + Number(payment.amountPaid || 0),
      0
    );

    const remaining = Math.max(
      0,
      Number(fee.totalFee) - alreadyPaid
    );

    if (paidAmount > remaining + 0.001) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: `Payment cannot exceed remaining balance of Rs ${remaining.toFixed(2)}.`,
      });
    }

    await FeePayment.create(
      {
        feeId: fee.id,
        month,
        amountPaid: paidAmount,
        remarks: remarks || "",
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Fee payment saved successfully.",
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Add Fee Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save fee payment.",
    });
  }
};

// ==========================================
// CLEAR REMAINING FEES
// ==========================================
exports.clearFees = async (req, res) => {
  const transaction = await Fee.sequelize.transaction();

  try {
    const { id } = req.params;
    const { month } = req.body;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Please provide a valid payment month.",
      });
    }

    const fee = await Fee.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!fee) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Fee account not found.",
      });
    }

    const payments = await FeePayment.findAll({
      where: { feeId: fee.id },
      transaction,
    });

    const paid = payments.reduce(
      (sum, payment) => sum + Number(payment.amountPaid || 0),
      0
    );

    const balance = Math.max(
      0,
      Number(fee.totalFee) - paid
    );

    if (balance <= 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "This fee account is already cleared.",
      });
    }

    await FeePayment.create(
      {
        feeId: fee.id,
        month,
        amountPaid: balance,
        remarks: "Remaining fee cleared.",
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Remaining fees cleared successfully.",
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Clear Fees Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to clear fees.",
    });
  }
};