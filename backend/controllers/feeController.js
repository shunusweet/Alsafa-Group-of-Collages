const { sequelize } = require("../config/database");

const Student = require("../models/Student");
const Fee = require("../models/Fee");
const FeePayment = require("../models/FeePayment");

// ==========================================
// HELPER: GET FEE ACCOUNT WITH RELATIONS
// ==========================================

const getFeeIncludes = () => [
    {
        model: Student,
        as: "student",
        attributes: [
            "id",
            "name",
            "fatherName",
            "course"
        ]
    },
    {
        model: FeePayment,
        as: "payments"
    }
];

// ==========================================
// GET ALL FEE ACCOUNTS
// ==========================================

const getFees = async (req, res) => {
    try {
        const fees = await Fee.findAll({
            include: getFeeIncludes(),
            order: [
                ["createdAt", "DESC"]
            ]
        });

        return res.status(200).json({
            success: true,
            count: fees.length,
            fees
        });
    } catch (error) {
        console.error("Get Fees Error:", error);

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to fetch fees."
        });
    }
};

// ==========================================
// ADD A MONTHLY PAYMENT
// ==========================================

const addFeePayment = async (req, res) => {
    let transaction;

    try {
        const {
            studentId,
            totalFee,
            month,
            amountPaid,
            remarks
        } = req.body;

        const studentID = Number(studentId);
        const paymentAmount = Number(amountPaid);

        // Validate required fields
        if (
            !Number.isInteger(studentID) ||
            studentID <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid student."
            });
        }

        if (
            !month ||
            !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid payment month."
            });
        }

        if (
            !Number.isFinite(paymentAmount) ||
            paymentAmount <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment amount must be greater than zero."
            });
        }

        transaction = await sequelize.transaction();

        // Check student
        const student = await Student.findByPk(
            studentID,
            { transaction }
        );

        if (!student) {
            const error = new Error("Student not found.");
            error.statusCode = 404;
            throw error;
        }

        // Find or create the student's fee account
        let fee = await Fee.findOne({
            where: {
                studentId: studentID
            },
            transaction
        });

        if (!fee) {
            const firstTotalFee = Number(totalFee);

            if (
                !Number.isFinite(firstTotalFee) ||
                firstTotalFee <= 0
            ) {
                const error = new Error(
                    "Please enter the student's total fee."
                );

                error.statusCode = 400;
                throw error;
            }

            fee = await Fee.create(
                {
                    studentId: studentID,
                    totalFee: firstTotalFee
                },
                { transaction }
            );
        }

        // Calculate payments already received
        const previousPayments =
            await FeePayment.sum("amountPaid", {
                where: {
                    feeId: fee.id
                },
                transaction
            });

        const totalPaid = Number(
            previousPayments || 0
        );

        const savedTotalFee = Number(
            fee.totalFee
        );

        const remainingBalance = Math.max(
            0,
            savedTotalFee - totalPaid
        );

        if (remainingBalance <= 0) {
            const error = new Error(
                "This student's fees are already cleared."
            );

            error.statusCode = 400;
            throw error;
        }

        // Prevent overpayment
        if (
            paymentAmount >
            remainingBalance + 0.001
        ) {
            const error = new Error(
                `Payment exceeds the remaining balance of ${remainingBalance.toFixed(2)}.`
            );

            error.statusCode = 400;
            throw error;
        }

        // Save this month's payment
        await FeePayment.create(
            {
                feeId: fee.id,
                month,
                amountPaid: paymentAmount,
                remarks: remarks
                    ? String(remarks).trim()
                    : null
            },
            { transaction }
        );

        await transaction.commit();

        const updatedFee = await Fee.findByPk(
            fee.id,
            {
                include: getFeeIncludes()
            }
        );

        return res.status(201).json({
            success: true,
            message: "Fee payment saved successfully.",
            fee: updatedFee
        });
    } catch (error) {
        if (
            transaction &&
            !transaction.finished
        ) {
            await transaction.rollback();
        }

        console.error("Add Fee Payment Error:", error);

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Failed to save fee payment."
        });
    }
};

// ==========================================
// CLEAR REMAINING FEES
// ==========================================

const clearFees = async (req, res) => {
    let transaction;

    try {
        const { id } = req.params;

        const month =
            req.body.month ||
            (() => {
                const now = new Date();

                return (
                    now.getFullYear() +
                    "-" +
                    String(
                        now.getMonth() + 1
                    ).padStart(2, "0")
                );
            })();

        if (
            !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment month."
            });
        }

        transaction = await sequelize.transaction();

        const fee = await Fee.findByPk(id, {
            transaction
        });

        if (!fee) {
            const error = new Error(
                "Fee account not found."
            );

            error.statusCode = 404;
            throw error;
        }

        const previousPayments =
            await FeePayment.sum("amountPaid", {
                where: {
                    feeId: fee.id
                },
                transaction
            });

        const totalPaid = Number(
            previousPayments || 0
        );

        const remainingBalance = Math.max(
            0,
            Number(fee.totalFee) - totalPaid
        );

        if (remainingBalance <= 0) {
            const error = new Error(
                "These fees are already cleared."
            );

            error.statusCode = 400;
            throw error;
        }

        // Record the final payment instead of
        // simply changing a status flag.
        await FeePayment.create(
            {
                feeId: fee.id,
                month,
                amountPaid: remainingBalance,
                remarks: "Remaining fees cleared"
            },
            { transaction }
        );

        await transaction.commit();

        const updatedFee = await Fee.findByPk(
            fee.id,
            {
                include: getFeeIncludes()
            }
        );

        return res.status(200).json({
            success: true,
            message: "All remaining fees have been cleared.",
            fee: updatedFee
        });
    } catch (error) {
        if (
            transaction &&
            !transaction.finished
        ) {
            await transaction.rollback();
        }

        console.error("Clear Fees Error:", error);

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Failed to clear fees."
        });
    }
};

module.exports = {
    getFees,
    addFeePayment,
    clearFees
};