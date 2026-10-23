
const Staff = require("../models/Staff");

const getMyStaffProfile = async (req, res) => {
  try {
    const staffId = req.user?.staffId || req.user?.id;

    if (!staffId) {
      return res.status(401).json({
        success: false,
        message: "Staff authentication required.",
      });
    }

    const staff = await Staff.findByPk(staffId, {
      attributes: [
        "id",
        "staffName",
        "fatherName",
        "email",
        "mobileNo",
        "designation",
        "address",
        "salary",
        "image",
        "createdAt",
      ],
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      staff,
    });
  } catch (error) {
    console.error("getMyStaffProfile:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load staff profile.",
    });
  }
};

module.exports = {
  getMyStaffProfile,
};
