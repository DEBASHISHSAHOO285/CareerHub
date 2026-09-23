const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

const db = require("../database");
const adminAuth = require("../middleware/adminAuth");

// Admin registration
router.post("/register", adminAuth, async (req, res) => {
    try {
        const {
            name,
            email,
            password
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
        const existingAdmin = db.prepare(`
            SELECT id
            FROM admins
            WHERE email = ?
        `).get(email);

        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: "Admin email already registered"
            });
        }

        const result = db.prepare(`
            INSERT INTO admins
            (name, email, password)
            VALUES (?, ?, ?)
        `).run(
    name,
    email,
    await bcrypt.hash(password, 10)
);

        const admin = db.prepare(`
            SELECT id, name, email, created_at
            FROM admins
            WHERE id = ?
        `).get(result.lastInsertRowid);

        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            admin
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Admin login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
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
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            admin.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        delete admin.password;

        res.json({
            success: true,
            message: "Admin login successful",
            admin
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Admin login failed"
        });
    }
});


// Get all students
router.get("/students", adminAuth, (req, res) => {
    try {
        const students = db.prepare(`
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
            ORDER BY created_at DESC
        `).all();

        res.json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// Get all companies
router.get("/companies", adminAuth, (req, res) => {
    try {
        const companies = db.prepare(`
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
            ORDER BY created_at DESC
        `).all();

        res.json({
            success: true,
            count: companies.length,
            companies
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// Get all jobs
router.get("/jobs", adminAuth,  (req, res) => {
    try {
        const jobs = db.prepare(`
            SELECT
                jobs.*,
                companies.company_name
            FROM jobs
            JOIN companies
                ON jobs.company_id = companies.id
            ORDER BY jobs.created_at DESC
        `).all();

        res.json({
            success: true,
            count: jobs.length,
            jobs
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// Get all applications
router.get("/applications", adminAuth, (req, res) => {
    try {
        const applications = db.prepare(`
            SELECT
                applications.*,
                students.name AS student_name,
                students.email AS student_email,
                jobs.title AS job_title,
                companies.company_name
            FROM applications
            JOIN students
                ON applications.student_id = students.id
            JOIN jobs
                ON applications.job_id = jobs.id
            JOIN companies
                ON jobs.company_id = companies.id
            ORDER BY applications.applied_at DESC
        `).all();

        res.json({
            success: true,
            count: applications.length,
            applications
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// Get all interviews
router.get("/interviews", adminAuth, (req, res) => {
    try {
        const interviews = db.prepare(`
            SELECT
                interviews.*,
                applications.student_id,
                applications.job_id,
                students.name AS student_name,
                students.email AS student_email,
                jobs.title AS job_title,
                companies.company_name
            FROM interviews
            JOIN applications
                ON interviews.application_id = applications.id
            JOIN students
                ON applications.student_id = students.id
            JOIN jobs
                ON applications.job_id = jobs.id
            JOIN companies
                ON jobs.company_id = companies.id
            ORDER BY interviews.interview_date ASC,
                     interviews.interview_time ASC
        `).all();

        res.json({
            success: true,
            count: interviews.length,
            interviews
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// Get admin dashboard statistics
router.get("/dashboard", adminAuth, (req, res) => {
    try {
        const totalStudents = db.prepare(`
            SELECT COUNT(*) AS count
            FROM students
        `).get().count;

        const totalCompanies = db.prepare(`
            SELECT COUNT(*) AS count
            FROM companies
        `).get().count;

        const totalJobs = db.prepare(`
            SELECT COUNT(*) AS count
            FROM jobs
        `).get().count;

        const totalApplications = db.prepare(`
            SELECT COUNT(*) AS count
            FROM applications
        `).get().count;

        const pendingApplications = db.prepare(`
            SELECT COUNT(*) AS count
            FROM applications
            WHERE status = 'Pending'
        `).get().count;

        const shortlistedApplications = db.prepare(`
            SELECT COUNT(*) AS count
            FROM applications
            WHERE status = 'Shortlisted'
        `).get().count;

        const rejectedApplications = db.prepare(`
            SELECT COUNT(*) AS count
            FROM applications
            WHERE status = 'Rejected'
        `).get().count;

        const totalInterviews = db.prepare(`
            SELECT COUNT(*) AS count
            FROM interviews
        `).get().count;

        res.json({
            success: true,
            stats: {
                total_students: totalStudents,
                total_companies: totalCompanies,
                total_jobs: totalJobs,
                total_applications: totalApplications,
                pending_applications: pendingApplications,
                shortlisted_applications: shortlistedApplications,
                rejected_applications: rejectedApplications,
                total_interviews: totalInterviews
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// Delete student
router.delete("/students/:id", adminAuth, (req, res) => {
    try {
        const { id } = req.params;

        const student = db.prepare(`
            SELECT id
            FROM students
            WHERE id = ?
        `).get(id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const deleteStudent = db.transaction(() => {
            db.prepare(`
                DELETE FROM notifications
                WHERE user_type = 'student'
                AND user_id = ?
            `).run(id);

            db.prepare(`
                DELETE FROM messages
                WHERE
                    (sender_type = 'student' AND sender_id = ?)
                    OR
                    (receiver_type = 'student' AND receiver_id = ?)
            `).run(id, id);

            db.prepare(`
                DELETE FROM saved_jobs
                WHERE student_id = ?
            `).run(id);

            const applications = db.prepare(`
                SELECT id
                FROM applications
                WHERE student_id = ?
            `).all(id);

            for (const application of applications) {
                db.prepare(`
                    DELETE FROM interviews
                    WHERE application_id = ?
                `).run(application.id);
            }

            db.prepare(`
                DELETE FROM applications
                WHERE student_id = ?
            `).run(id);

            db.prepare(`
                DELETE FROM students
                WHERE id = ?
            `).run(id);
        });

        deleteStudent();

        res.json({
            success: true,
            message: "Student deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// Delete company
router.delete("/companies/:id", adminAuth, (req, res) => {
    try {
        const { id } = req.params;

        const company = db.prepare(`
            SELECT id
            FROM companies
            WHERE id = ?
        `).get(id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        const deleteCompany = db.transaction(() => {
            const jobs = db.prepare(`
                SELECT id
                FROM jobs
                WHERE company_id = ?
            `).all(id);

            for (const job of jobs) {
                db.prepare(`
                    DELETE FROM saved_jobs
                    WHERE job_id = ?
                `).run(job.id);

                const applications = db.prepare(`
                    SELECT id
                    FROM applications
                    WHERE job_id = ?
                `).all(job.id);

                for (const application of applications) {
                    db.prepare(`
                        DELETE FROM interviews
                        WHERE application_id = ?
                    `).run(application.id);
                }

                db.prepare(`
                    DELETE FROM applications
                    WHERE job_id = ?
                `).run(job.id);
            }

            db.prepare(`
                DELETE FROM jobs
                WHERE company_id = ?
            `).run(id);

            db.prepare(`
                DELETE FROM notifications
                WHERE user_type = 'company'
                AND user_id = ?
            `).run(id);

            db.prepare(`
                DELETE FROM messages
                WHERE
                    (sender_type = 'company' AND sender_id = ?)
                    OR
                    (receiver_type = 'company' AND receiver_id = ?)
            `).run(id, id);

            db.prepare(`
                DELETE FROM companies
                WHERE id = ?
            `).run(id);
        });

        deleteCompany();

        res.json({
            success: true,
            message: "Company deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// Delete job
router.delete("/jobs/:id", adminAuth, (req, res) => {
    try {
        const { id } = req.params;

        const job = db.prepare(`
            SELECT id
            FROM jobs
            WHERE id = ?
        `).get(id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        const deleteJob = db.transaction(() => {
            db.prepare(`
                DELETE FROM saved_jobs
                WHERE job_id = ?
            `).run(id);

            const applications = db.prepare(`
                SELECT id
                FROM applications
                WHERE job_id = ?
            `).all(id);

            for (const application of applications) {
                db.prepare(`
                    DELETE FROM interviews
                    WHERE application_id = ?
                `).run(application.id);
            }

            db.prepare(`
                DELETE FROM applications
                WHERE job_id = ?
            `).run(id);

            db.prepare(`
                DELETE FROM jobs
                WHERE id = ?
            `).run(id);
        });

        deleteJob();

        res.json({
            success: true,
            message: "Job deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


module.exports = router;