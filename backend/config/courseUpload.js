const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==========================================
// COURSE UPLOAD FOLDER
// ==========================================
const uploadFolder = path.join(
    __dirname,
    "../uploads/courses"
);

// ==========================================
// CREATE FOLDER IF NOT EXISTS
// ==========================================
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, {
        recursive: true
    });
}

// ==========================================
// STORAGE
// ==========================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(
            file.originalname
        );

        const fileName =
            "course-" +
            Date.now() +
            "-" +
            Math.round(
                Math.random() * 100000
            ) +
            extension;

        cb(null, fileName);
    }
});

// ==========================================
// FILE FILTER
// ==========================================
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (
        allowedTypes.includes(
            file.mimetype
        )
    ) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPG, JPEG, PNG and WEBP images are allowed"
            ),
            false
        );
    }
};

// ==========================================
// MULTER
// ==========================================
const courseUpload = multer({
    storage,
    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = courseUpload;