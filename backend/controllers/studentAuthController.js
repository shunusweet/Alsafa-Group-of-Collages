
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const Student = require("../models/Student");

const studentLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (
      typeof identifier !== "string" ||
      typeof password !== "string" ||
      !identifier.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter your name or CNIC and password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing.");

      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured.",
      });
    }

    const loginValue = identifier.trim();

    const student = await Student.findOne({
      where: {
        [Op.or]: [
          { name: loginValue },
          { cnic: loginValue },
        ],
      },
    });

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid name/CNIC or password.",
      });
    }

    if (student.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Contact the institute.",
      });
    }

    if (!student.passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Password is not configured. Contact the institute.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      student.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid name/CNIC or password.",
      });
    }

    const token = jwt.sign(
      {
        id: student.id,
        role: "student",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const studentData = {
      id: student.id,
      name: student.name,
      fatherName: student.fatherName,
      cnic: student.cnic,
      email: student.email,
      phone: student.phone,
      gender: student.gender,
      course: student.course,
      qualification: student.qualification,
      domicile: student.domicile,
      address: student.address,
      image: student.image,
      status: student.status,
    };

    return res.status(200).json({
      success: true,
      message: "Student login successful.",
      token,
      student: studentData,
    });
  } catch (error) {
    console.error("Student Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "An internal server error occurred.",
    });
  }
};

module.exports = { studentLogin };
