
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const Student = require("../models/Student");

const studentLogin = async (req, res) => {
  try {
    const identifier = String(req.body.identifier || "").trim();
    const password = String(req.body.password || "");

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your student name/CNIC and password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from backend .env");

      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured.",
      });
    }

    const student = await Student.unscoped().findOne({
      where: {
        [Op.or]: [
          { name: identifier },
          { cnic: identifier },
        ],
      },
    });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid student credentials.",
      });
    }

    const storedHash =
      student.passwordHash || student.password_hash;

    if (!storedHash) {
      return res.status(401).json({
        success: false,
        message: "Student password is not configured.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      storedHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid student credentials.",
      });
    }

    const token = jwt.sign(
      {
        id: student.id,
        studentId: student.id,
        role: "student",
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    const studentData = student.toJSON();
    delete studentData.passwordHash;
    delete studentData.password_hash;
    delete studentData.password;

    return res.status(200).json({
      success: true,
      message: "Student login successful.",
      token,
      student: studentData,
    });
  } catch (error) {
    console.error("studentLogin error:", error);

    return res.status(500).json({
      success: false,
      message: "Student login failed. Please check the server logs.",
    });
  }
};

module.exports = { studentLogin };
