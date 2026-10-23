
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff");

const staffLogin = async (req, res) => {
  try {
    const { staffName, email, password } = req.body;

    if (
      !String(staffName || "").trim() ||
      !String(email || "").trim() ||
      !String(password || "")
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter staff name, email and password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from backend .env");

      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured.",
      });
    }

    const normalizedName = String(staffName).trim();
    const normalizedEmail = String(email).trim().toLowerCase();

    // Bypass the model's defaultScope so passwordHash is available.
    const staff = await Staff.unscoped().findOne({
      where: {
        staffName: normalizedName,
        email: normalizedEmail,
      },
    });

    if (!staff || !staff.passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid staff name, email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      String(password),
      staff.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid staff name, email or password.",
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
        email: staff.email,
        mobileNo: staff.mobileNo,
        designation: staff.designation,
        image: staff.image,
      },
    });
  } catch (error) {
    console.error("staffLogin:", error);

    return res.status(500).json({
      success: false,
      message: "Staff login failed. Please try again.",
    });
  }
};

module.exports = { staffLogin };
