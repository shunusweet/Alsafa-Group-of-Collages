const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const Staff = require("../models/Staff");

const cleanStaff = (staff) => {
  if (!staff) return null;
  const result = staff.toJSON ? staff.toJSON() : { ...staff };
  delete result.passwordHash;
  delete result.password_hash;
  return result;
};

const fileUrl = (file) => (file ? `/uploads/staff/${file.filename}` : undefined);

const addStaff = async (req, res) => {
  try {
    const { staffName, fatherName, designation, cnicNo, mobileNo, address, salary, email, password } = req.body;

    if (![staffName, fatherName, designation, cnicNo, mobileNo, address, email, password].every((v) => String(v || "").trim())) {
      return res.status(400).json({ success: false, message: "Please fill all required fields, including email and password." });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    }
    if (salary === "" || salary === undefined || !Number.isFinite(Number(salary)) || Number(salary) < 0) {
      return res.status(400).json({ success: false, message: "Enter a valid non-negative salary." });
    }
    if (!req.files?.image?.[0] || !req.files?.cnicImageFront?.[0] || !req.files?.cnicImageBack?.[0]) {
      return res.status(400).json({ success: false, message: "Staff image, CNIC front and CNIC back images are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await Staff.findOne({
      where: { [require("sequelize").Op.or]: [{ cnicNo: String(cnicNo).trim() }, { email: normalizedEmail }] },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: existing.cnicNo === String(cnicNo).trim() ? "This CNIC number already exists." : "This email already exists." });
    }

    const staff = await Staff.create({
      staffName: staffName.trim(),
      fatherName: fatherName.trim(),
      designation: designation.trim(),
      cnicNo: cnicNo.trim(),
      mobileNo: mobileNo.trim(),
      address: address.trim(),
      salary: Number(salary),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(String(password), 12),
      image: fileUrl(req.files.image[0]),
      cnicImageFront: fileUrl(req.files.cnicImageFront[0]),
      cnicImageBack: fileUrl(req.files.cnicImageBack[0]),
    });
    return res.status(201).json({ success: true, message: "Staff added successfully.", staff: cleanStaff(staff) });
  } catch (error) {
    console.error("addStaff:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ success: false, message: "CNIC or email already exists." });
    }
    return res.status(500).json({ success: false, message: "Failed to add staff." });
  }
};

const getStaff = async (req, res) => {
  try {
    const staff = await Staff.findAll({ order: [["createdAt", "DESC"]] });
    return res.json({ success: true, staff: staff.map(cleanStaff) });
  } catch (error) {
    console.error("getStaff:", error);
    return res.status(500).json({ success: false, message: "Failed to load staff." });
  }
};

const getSingleStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: "Staff record not found." });
    return res.json({ success: true, staff: cleanStaff(staff) });
  } catch (error) {
    console.error("getSingleStaff:", error);
    return res.status(500).json({ success: false, message: "Failed to load staff record." });
  }
};

const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: "Staff record not found." });

    const { staffName, fatherName, designation, cnicNo, mobileNo, address, salary, email, password } = req.body;
    if (![staffName, fatherName, designation, cnicNo, mobileNo, address, email].every((v) => String(v || "").trim())) {
      return res.status(400).json({ success: false, message: "Please fill all required fields." });
    }
    if (salary === "" || salary === undefined || !Number.isFinite(Number(salary)) || Number(salary) < 0) {
      return res.status(400).json({ success: false, message: "Enter a valid non-negative salary." });
    }
    if (password && String(password).length < 8) {
      return res.status(400).json({ success: false, message: "New password must be at least 8 characters." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const { Op } = require("sequelize");
    const duplicate = await Staff.findOne({
      where: { id: { [Op.ne]: staff.id }, [Op.or]: [{ cnicNo: cnicNo.trim() }, { email: normalizedEmail }] },
    });
    if (duplicate) return res.status(409).json({ success: false, message: "Another staff member already uses this CNIC or email." });

    const updateData = {
      staffName: staffName.trim(),
      fatherName: fatherName.trim(),
      designation: designation.trim(),
      cnicNo: cnicNo.trim(),
      mobileNo: mobileNo.trim(),
      address: address.trim(),
      salary: Number(salary),
      email: normalizedEmail,
    };
    if (password && password.trim()) updateData.passwordHash = await bcrypt.hash(String(password), 12);

    const fields = [
      ["image", "image"],
      ["cnicImageFront", "cnicImageFront"],
      ["cnicImageBack", "cnicImageBack"],
    ];
    for (const [field, column] of fields) {
      const uploaded = req.files?.[field]?.[0];
      if (uploaded) {
        removeOldUpload(staff[column]);
        updateData[column] = fileUrl(uploaded);
      }
    }

    await staff.update(updateData);
    return res.json({ success: true, message: "Staff updated successfully.", staff: cleanStaff(staff) });
  } catch (error) {
    console.error("updateStaff:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ success: false, message: "CNIC or email already exists." });
    }
    return res.status(500).json({ success: false, message: "Failed to update staff." });
  }
};

const removeOldUpload = (url) => {
  if (!url || !url.startsWith("/uploads/staff/")) return;
  const absolutePath = path.join(process.cwd(), url.replace(/^\//, ""));
  fs.unlink(absolutePath, (err) => {
    if (err && err.code !== "ENOENT") console.error("Could not delete old staff image:", err.message);
  });
};

const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: "Staff record not found." });
    [staff.image, staff.cnicImageFront, staff.cnicImageBack].forEach(removeOldUpload);
    await staff.destroy();
    return res.json({ success: true, message: "Staff deleted successfully." });
  } catch (error) {
    console.error("deleteStaff:", error);
    return res.status(500).json({ success: false, message: "Failed to delete staff." });
  }
};

module.exports = { addStaff, getStaff, getSingleStaff, updateStaff, deleteStaff };
