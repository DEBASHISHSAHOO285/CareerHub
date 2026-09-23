const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(
    __dirname,
    "..",
    "uploads",
    "resumes"
);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true
    });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);

        const fileName =
            `student_${req.params.id}_${Date.now()}${extension}`;

        cb(null, fileName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = [
        ".pdf",
        ".doc",
        ".docx"
    ];

    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
        return cb(
            new Error(
                "Only PDF, DOC and DOCX files are allowed"
            )
        );
    }

    cb(null, true);
};

const uploadResume = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024
    }
});

module.exports = uploadResume;