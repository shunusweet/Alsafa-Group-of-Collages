
const fs = require("fs");
const path = require("path");
const Course = require("../models/Course");

// Delete a stored course image safely
const removeCourseImage = (imageUrl) => {
    if (!imageUrl) return;

    const filename = path.basename(imageUrl);
    const imagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "courses",
        filename
    );

    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }
};

// ADD COURSE
exports.addCourse = async (req, res) => {
    try {
        const {
            courseName,
            courseDuration,
            courseSession,
            courseDescription,
        } = req.body;

        if (!courseName?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Course name is required.",
            });
        }

        if (!courseDuration?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Course duration is required.",
            });
        }

        if (!courseSession?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Course session is required.",
            });
        }

        const courseImage = req.file
            ? `/uploads/courses/${req.file.filename}`
            : null;

        const course = await Course.create({
            courseName: courseName.trim(),
            courseDuration: courseDuration.trim(),
            courseSession: courseSession.trim(),
            courseImage,
            courseDescription: courseDescription?.trim() || null,
        });

        return res.status(201).json({
            success: true,
            message: "Course added successfully.",
            course,
        });
    } catch (error) {
        console.error("Add Course Error:", error);

        if (req.file) {
            removeCourseImage(`/uploads/courses/${req.file.filename}`);
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to add course.",
        });
    }
};

// GET ALL COURSES
exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.findAll({
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            courses,
        });
    } catch (error) {
        console.error("Get Courses Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch courses.",
        });
    }
};

// GET SINGLE COURSE
exports.getSingleCourse = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found.",
            });
        }

        return res.status(200).json({
            success: true,
            course,
        });
    } catch (error) {
        console.error("Get Single Course Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch course.",
        });
    }
};

// UPDATE COURSE
exports.updateCourse = async (req, res) => {
    let uploadedImagePath = null;

    try {
        const course = await Course.findByPk(req.params.id);

        if (!course) {
            if (req.file) {
                removeCourseImage(`/uploads/courses/${req.file.filename}`);
            }

            return res.status(404).json({
                success: false,
                message: "Course not found.",
            });
        }

        const {
            courseName,
            courseDuration,
            courseSession,
            courseDescription,
        } = req.body;

        if (!courseName?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Course name is required.",
            });
        }

        if (!courseDuration?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Course duration is required.",
            });
        }

        if (!courseSession?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Course session is required.",
            });
        }

        const oldImage = course.courseImage;

        const newImage = req.file
            ? `/uploads/courses/${req.file.filename}`
            : oldImage;

        if (req.file) {
            uploadedImagePath = newImage;
        }

        await course.update({
            courseName: courseName.trim(),
            courseDuration: courseDuration.trim(),
            courseSession: courseSession.trim(),
            courseDescription: courseDescription?.trim() || null,
            courseImage: newImage,
        });

        if (req.file && oldImage) {
            removeCourseImage(oldImage);
        }

        return res.status(200).json({
            success: true,
            message: "Course updated successfully.",
            course,
        });
    } catch (error) {
        console.error("Update Course Error:", error);

        if (uploadedImagePath) {
            removeCourseImage(uploadedImagePath);
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update course.",
        });
    }
};

// DELETE COURSE
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found.",
            });
        }

        const oldImage = course.courseImage;

        await course.destroy();

        if (oldImage) {
            removeCourseImage(oldImage);
        }

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully.",
        });
    } catch (error) {
        console.error("Delete Course Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete course.",
        });
    }
};
