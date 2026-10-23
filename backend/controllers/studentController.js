
const Student = require("../models/Student");
const fs = require("fs");
const path = require("path");

// ==========================================
// HELPER: DELETE OLD STUDENT IMAGE
// ==========================================
const deleteStudentImage = (imageName) => {
  if (!imageName) return;

  // Only delete files inside the uploads directory.
  const fileName = path.basename(imageName);
  const imagePath = path.join(__dirname, "..", "uploads", fileName);

  if (fs.existsSync(imagePath)) {
    fs.unlink(imagePath, (error) => {
      if (error) {
        console.error("Student image delete error:", error.message);
      }
    });
  }
};

// ==========================================
// HELPER: CLEAN STUDENT RESPONSE
// ==========================================
const sanitizeStudent = (student) => {
  const data = student.toJSON();

  delete data.passwordHash;
  delete data.password_hash;
  delete data.password;

  return data;
};

// ==========================================
// ADD STUDENT
// POST /api/students
// ==========================================
const addStudent = async (req, res) => {
  try {
    const studentData = { ...req.body };

    // Never accept an uploaded image path directly from request body.
    delete studentData.id;
    delete studentData.passwordHash;
    delete studentData.password_hash;

    if (req.file) {
      studentData.image = req.file.filename;
    }

    const student = await Student.create(studentData);

    return res.status(201).json({
      success: true,
      message: "Student added successfully.",
      student: sanitizeStudent(student),
    });
  } catch (error) {
    if (req.file) {
      deleteStudentImage(req.file.filename);
    }

    console.error("Add Student Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add student.",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL STUDENTS
// GET /api/students
// ==========================================
const getStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: students.length,
      students: students.map(sanitizeStudent),
    });
  } catch (error) {
    console.error("Get Students Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch students.",
      error: error.message,
    });
  }
};

// ==========================================
// GET ONE STUDENT
// GET /api/students/:id
// ==========================================
const getStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    return res.status(200).json({
      success: true,
      student: sanitizeStudent(student),
    });
  } catch (error) {
    console.error("Get Student Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student.",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE STUDENT
// PUT /api/students/:id
// ==========================================
const updateStudent = async (req, res) => {
  let uploadedImage = null;

  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      if (req.file) deleteStudentImage(req.file.filename);

      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const updateData = { ...req.body };

    // Do not allow primary key or password changes through this endpoint.
    delete updateData.id;
    delete updateData.passwordHash;
    delete updateData.password_hash;
    delete updateData.password;

    // Preserve existing image if no new image is uploaded.
    if (req.file) {
      uploadedImage = req.file.filename;
      updateData.image = uploadedImage;
    }

    const oldImage = student.image;

    await student.update(updateData);

    // Delete old image only after successful database update.
    if (uploadedImage && oldImage && oldImage !== uploadedImage) {
      deleteStudentImage(oldImage);
    }

    return res.status(200).json({
      success: true,
      message: "Student updated successfully.",
      student: sanitizeStudent(student),
    });
  } catch (error) {
    if (uploadedImage) {
      deleteStudentImage(uploadedImage);
    }

    console.error("Update Student Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update student.",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE STUDENT
// DELETE /api/students/:id
// ==========================================
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const oldImage = student.image;

    await student.destroy();

    if (oldImage) {
      deleteStudentImage(oldImage);
    }

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Student Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete student.",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORT ALL STUDENT CONTROLLERS
// ==========================================
module.exports = {
  addStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
};
