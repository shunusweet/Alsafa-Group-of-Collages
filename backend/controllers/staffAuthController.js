
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff");

const staffLogin = async (req, res) => {
  try {
    const identifier = String(req.body.identifier || "").trim();
    const password = String(req.body.password || "");

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email/CNIC and password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured.",
      });
    }

    const isEmail = identifier.includes("@");

    const staff = await Staff.unscoped().findOne({
      where: isEmail
        ? { email: identifier.toLowerCase() }
        : { cnicNo: identifier },
    });

    if (!staff || !staff.passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/CNIC or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      staff.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/CNIC or password.",
      });
    }

    const token = jwt.sign(
      {
        id: staff.id,
        staffId: staff.id,
        role: "staff",
        staffName: staff.staffName,
        email: staff.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.status(200).json({
      success: true,
      message: "Staff login successful.",
      token,
      staff: {
        id: staff.id,
        staffName: staff.staffName,
        fatherName: staff.fatherName,
        cnicNo: staff.cnicNo,
        email: staff.email,
        mobileNo: staff.mobileNo,
        designation: staff.designation,
        address: staff.address,
        salary: staff.salary,
        image: staff.image,
      },
    });
  } catch (error) {
    console.error("staffLogin error:", error);

    return res.status(500).json({
      success: false,
      message: "Staff login failed. Check backend terminal.",
    });
  }
};

module.exports = { staffLogin };
