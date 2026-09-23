const bcrypt = require("bcryptjs");
const express = require("express");
const db = require("../database");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const uploadResume = require("../middleware/upload");

const { JWT_SECRET } = require("../config");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* ================================
   PASSWORD RESET TABLE
================================ */

db.prepare(`
    CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        email TEXT NOT NULL,
        otp_hash TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL
    )
`).run();

/* ================================
   EMAIL TRANSPORTER
================================ */

const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

/* ================================
   STUDENT REGISTER
================================ */

router.post("/student/register", async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            college,
            course,
            branch,
            cgpa,
            skills
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
    return res.status(400).json({
        success: false,
        message: "Invalid email format"
    });
}

if (password.length < 6) {
    return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
    });
}

if (cgpa !== undefined && cgpa !== null && cgpa !== "") {
    const cgpaValue = Number(cgpa);

    if (isNaN(cgpaValue) || cgpaValue < 0 || cgpaValue > 10) {
        return res.status(400).json({
            success: false,
            message: "CGPA must be between 0 and 10"
        });
    }
}
        const stmt = db.prepare(`
            INSERT INTO students
            (name, email, password, phone, college, course, branch, cgpa, skills)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            name,
            email,
            await bcrypt.hash(password, 10),
            phone || null,
            college || null,
            course || null,
            branch || null,
            cgpa || null,
            skills || null
        );

        res.status(201).json({
            success: true,
            message: "Student registered successfully",
            student_id: result.lastInsertRowid
        });

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Student registration failed"
        });
    }
});


/* ================================
   COMPANY REGISTER
================================ */

router.post("/company/register", async (req, res) => {
    try {
        const {
            company_name,
            email,
            password,
            phone,
            website,
            description,
            location
        } = req.body;

        if (!company_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Company name, email and password are required"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
    return res.status(400).json({
        success: false,
        message: "Invalid email format"
    });
}

if (password.length < 6) {
    return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
    });
}

        const stmt = db.prepare(`
            INSERT INTO companies
            (company_name, email, password, phone, website, description, location)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            company_name,
            email,
            await bcrypt.hash(password, 10),
            phone || null,
            website || null,
            description || null,
            location || null
        );

        res.status(201).json({
            success: true,
            message: "Company registered successfully",
            company_id: result.lastInsertRowid
        });

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Company registration failed"
        });
    }
});

// Login API 
/* ================================
   STUDENT LOGIN
================================ */

router.post("/student/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const student = db.prepare(`
            SELECT id, name, email, password, college, course, branch, cgpa, skills
            FROM students
            WHERE email = ?
        `).get(email);

        if (!student) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            student.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        delete student.password;

const token = jwt.sign(
    {
        id: student.id,
        type: "student"
    },
    JWT_SECRET,
    {
        expiresIn: "7d"
    }
);

res.json({
    success: true,
    message: "Student login successful",
    token,
    user: student
});

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Student login failed"
        });
    }
});


/* ================================
   COMPANY LOGIN
================================ */

router.post("/company/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const company = db.prepare(`
            SELECT id, company_name, email, password, phone, website, description, location
            FROM companies
            WHERE email = ?
        `).get(email);

        if (!company) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            company.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        delete company.password;

const token = jwt.sign(
    {
        id: company.id,
        type: "company"
    },
    JWT_SECRET,
    {
        expiresIn: "7d"
    }
);

res.json({
    success: true,
    message: "Company login successful",
    token,
    user: company
});

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Company login failed"
        });
    }
});

/* ================================
   GET STUDENT PROFILE
================================ */

router.get("/student/:id", authMiddleware, async (req, res) => {
    try {

        if (req.user.type !== "student" || req.user.id !== Number(req.params.id)) {
    return res.status(403).json({
        success: false,
        message: "You can only access your own profile"
    });
}
        const student = db.prepare(`
            SELECT
                id,
                name,
                email,
                phone,
                college,
                course,
                branch,
                cgpa,
                skills,
                resume,
                created_at
            FROM students
            WHERE id = ?
        `).get(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        res.json({
            success: true,
            student: student
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch student profile"
        });
    }
});


/* ================================
   UPLOAD STUDENT RESUME
================================ */

router.post(
    "/student/:id/resume",
    authMiddleware,
    uploadResume.single("resume"),
    async (req, res) => {
        try {
            if (
                req.user.type !== "student" ||
                req.user.id !== Number(req.params.id)
            ) {
                return res.status(403).json({
                    success: false,
                    message: "You can only upload your own resume"
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Resume file is required"
                });
            }

            const resumeUrl =
                `/uploads/resumes/${req.file.filename}`;

            db.prepare(`
                UPDATE students
                SET resume = ?
                WHERE id = ?
            `).run(
                resumeUrl,
                req.params.id
            );

            res.json({
                success: true,
                message: "Resume uploaded successfully",
                resume: resumeUrl,
                file_name: req.file.originalname
            });

        } catch (error) {
            console.error("Resume upload error:", error);

            res.status(500).json({
                success: false,
                message: error.message ||
                    "Failed to upload resume"
            });
        }
    }
);

/* ================================
   UPDATE STUDENT PROFILE
================================ */

router.put("/student/:id", authMiddleware, async (req, res) => {
    try {
        const {
            name,
            phone,
            college,
            course,
            branch,
            cgpa,
            skills,
            resume
        } = req.body;

        if (req.user.type !== "student" || req.user.id !== Number(req.params.id)) {
    return res.status(403).json({
        success: false,
        message: "You can only update your own profile"
    });
}

        const student = db.prepare(`
            SELECT id
            FROM students
            WHERE id = ?
        `).get(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        db.prepare(`
            UPDATE students
            SET
                name = ?,
                phone = ?,
                college = ?,
                course = ?,
                branch = ?,
                cgpa = ?,
                skills = ?,
                resume = ?
            WHERE id = ?
        `).run(
            name || null,
            phone || null,
            college || null,
            course || null,
            branch || null,
            cgpa || null,
            skills || null,
            resume || null,
            req.params.id
        );

        res.json({
            success: true,
            message: "Student profile updated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update student profile"
        });
    }
});

/* ================================
   GET COMPANY PROFILE
================================ */

router.get("/company/:id", authMiddleware, async (req, res) => {
    try {

        if (req.user.type !== "company" || req.user.id !== Number(req.params.id)) {
    return res.status(403).json({
        success: false,
        message: "You can only access your own profile"
    });
}
        const company = db.prepare(`
            SELECT
                id,
                company_name,
                email,
                phone,
                website,
                description,
                location,
                logo,
                created_at
            FROM companies
            WHERE id = ?
        `).get(req.params.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        res.json({
            success: true,
            company: company
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch company profile"
        });
    }
});

/* ================================
   UPDATE COMPANY PROFILE
================================ */

router.put("/company/:id", authMiddleware, async (req, res) => {
    try {
        const {
            company_name,
            phone,
            website,
            description,
            location,
            logo
        } = req.body;

        if (req.user.type !== "company" || req.user.id !== Number(req.params.id)) {
    return res.status(403).json({
        success: false,
        message: "You can only update your own profile"
    });
}

        const company = db.prepare(`
            SELECT id
            FROM companies
            WHERE id = ?
        `).get(req.params.id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        db.prepare(`
            UPDATE companies
            SET
                company_name = ?,
                phone = ?,
                website = ?,
                description = ?,
                location = ?,
                logo = ?
            WHERE id = ?
        `).run(
            company_name || null,
            phone || null,
            website || null,
            description || null,
            location || null,
            logo || null,
            req.params.id
        );

        res.json({
            success: true,
            message: "Company profile updated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update company profile"
        });
    }
});

// ===============================
// ADMIN LOGIN
// ===============================
router.post("/admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const admin = db.prepare(`
            SELECT id, name, email, password
            FROM admins
            WHERE email = ?
        `).get(email);

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Compare entered password with bcrypt hash
        const passwordMatch = await bcrypt.compare(
            password,
            admin.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const token = jwt.sign(
            {
                id: admin.id,
                email: admin.email,
                type: "admin",
            },
            JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        delete admin.password;

        return res.json({
            success: true,
            message: "Admin login successful",
            token,
            user: admin,
        });

    } catch (error) {
        console.error("Admin login error:", error);

        return res.status(500).json({
            success: false,
            message: "Admin login failed",
        });
    }
});

/* ================================
   FORGOT PASSWORD - SEND OTP
================================ */

router.post("/forgot-password", async (req, res) => {
    try {
        const { email, role } = req.body;

        if (!email || !role) {
            return res.status(400).json({
                success: false,
                message: "Email and role are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const allowedRoles = ["student", "company", "admin"];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        let user;

        if (role === "student") {
            user = db.prepare(`
                SELECT id, name, email
                FROM students
                WHERE LOWER(email) = ?
            `).get(normalizedEmail);
        }

        if (role === "company") {
            user = db.prepare(`
                SELECT id, company_name, email
                FROM companies
                WHERE LOWER(email) = ?
            `).get(normalizedEmail);
        }

        if (role === "admin") {
            user = db.prepare(`
                SELECT id, name, email
                FROM admins
                WHERE LOWER(email) = ?
            `).get(normalizedEmail);
        }

        /*
         * Same response whether account exists or not.
         */
        if (!user) {
            return res.json({
                success: true,
                message: "If this email is registered, an OTP has been sent."
            });
        }

        // Remove old OTPs
        db.prepare(`
            DELETE FROM password_resets
            WHERE role = ?
            AND email = ?
        `).run(role, normalizedEmail);

        // Generate 6 digit OTP
        const otp = crypto.randomInt(100000, 1000000).toString();

        // Hash OTP
        const otpHash = await bcrypt.hash(otp, 10);

        // OTP valid for 10 minutes
        const expiresAt = Date.now() + 10 * 60 * 1000;

        db.prepare(`
            INSERT INTO password_resets
            (
                role,
                user_id,
                email,
                otp_hash,
                expires_at,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            role,
            user.id,
            normalizedEmail,
            otpHash,
            expiresAt,
            Date.now()
        );

        const displayName =
            role === "company"
                ? user.company_name
                : user.name;

        const mailSubject = "CareerHub Password Reset OTP";

        const mailHtml = `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: auto;
                padding: 30px;
                background: #f8fafc;
            ">

                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                ">

                    <h2 style="
                        margin-top: 0;
                        color: #4f46e5;
                    ">
                        CareerHub
                    </h2>

                    <p>
                        Hello ${displayName || "User"},
                    </p>

                    <p>
                        We received a request to reset your CareerHub
                        password.
                    </p>

                    <div style="
                        margin: 25px 0;
                        padding: 20px;
                        background: #eef2ff;
                        border-radius: 12px;
                        text-align: center;
                    ">

                        <p style="
                            margin: 0 0 8px;
                            color: #64748b;
                        ">
                            Your OTP
                        </p>

                        <strong style="
                            font-size: 32px;
                            letter-spacing: 8px;
                            color: #312e81;
                        ">
                            ${otp}
                        </strong>

                    </div>

                    <p>
                        This OTP will expire in
                        <strong>10 minutes</strong>.
                    </p>

                    <p style="
                        color: #64748b;
                        font-size: 13px;
                    ">
                        If you did not request this password reset,
                        you can safely ignore this email.
                    </p>

                    <hr style="
                        border: none;
                        border-top: 1px solid #e2e8f0;
                        margin: 25px 0;
                    ">

                    <p style="
                        font-size: 12px;
                        color: #94a3b8;
                    ">
                        © 2026 CareerHub
                    </p>

                </div>

            </div>
        `;

        await mailTransporter.sendMail({
            from: `"CareerHub" <${process.env.MAIL_USER}>`,
            to: normalizedEmail,
            subject: mailSubject,
            html: mailHtml
        });

        res.json({
            success: true,
            message: "OTP sent successfully to your email."
        });

    } catch (error) {
        console.error("Forgot password error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to send OTP"
        });
    }
});


/* ================================
   RESET PASSWORD
================================ */

router.post("/reset-password", async (req, res) => {
    try {
        const {
            email,
            role,
            otp,
            newPassword
        } = req.body;

        if (!email || !role || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const resetRequest = db.prepare(`
            SELECT *
            FROM password_resets
            WHERE role = ?
            AND email = ?
            ORDER BY id DESC
            LIMIT 1
        `).get(role, normalizedEmail);

        if (!resetRequest) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        if (Date.now() > resetRequest.expires_at) {

            db.prepare(`
                DELETE FROM password_resets
                WHERE id = ?
            `).run(resetRequest.id);

            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        const otpMatch = await bcrypt.compare(
            otp.toString(),
            resetRequest.otp_hash
        );

        if (!otpMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        const passwordHash = await bcrypt.hash(
            newPassword,
            10
        );

        if (role === "student") {

            db.prepare(`
                UPDATE students
                SET password = ?
                WHERE id = ?
            `).run(
                passwordHash,
                resetRequest.user_id
            );

        } else if (role === "company") {

            db.prepare(`
                UPDATE companies
                SET password = ?
                WHERE id = ?
            `).run(
                passwordHash,
                resetRequest.user_id
            );

        } else if (role === "admin") {

            db.prepare(`
                UPDATE admins
                SET password = ?
                WHERE id = ?
            `).run(
                passwordHash,
                resetRequest.user_id
            );

        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        // Delete used OTP
        db.prepare(`
            DELETE FROM password_resets
            WHERE id = ?
        `).run(resetRequest.id);

        res.json({
            success: true,
            message: "Password reset successfully. You can now login."
        });

    } catch (error) {
        console.error("Reset password error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to reset password"
        });
    }
});

module.exports = router;