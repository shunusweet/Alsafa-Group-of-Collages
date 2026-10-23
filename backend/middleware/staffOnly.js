
const staffOnly = (req, res, next) => {
  if (
    !req.user ||
    String(req.user.role || "").toLowerCase() !== "staff"
  ) {
    return res.status(403).json({
      success: false,
      message: "Staff account access required.",
    });
  }

  next();
};

module.exports = staffOnly;
