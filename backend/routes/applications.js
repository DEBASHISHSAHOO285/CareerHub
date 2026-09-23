const express = require("express");
const db = require("../database");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* ================================
   STUDENT APPLY FOR JOB
================================ */

router.post("/", authMiddleware, (req, res) => {
    try {
        const {
            student_id,
            job_id
        } = req.body;

        if (!student_id || !job_id) {
            return res.status(400).json({
                success: false,
                message: "Student ID and Job ID are required"
            });
        }

        if (req.user.type !== "student" || req.user.id !== Number(student_id)) {
    return res.status(403).json({
        success: false,
        message: "You can only apply for yourself"
    });
}

        const student = db.prepare(`
            SELECT id
            FROM students
            WHERE id = ?
        `).get(student_id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const job = db.prepare(`
            SELECT id
            FROM jobs
            WHERE id = ?
        `).get(job_id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        const existingApplication = db.prepare(`
            SELECT id
            FROM applications
            WHERE student_id = ? AND job_id = ?
        `).get(student_id, job_id);

        if (existingApplication) {
            return res.status(409).json({
                success: false,
                message: "Already applied for this job"
            });
        }

        const stmt = db.prepare(`
            INSERT INTO applications
            (student_id, job_id)
            VALUES (?, ?)
        `);

        const result = stmt.run(
            student_id,
            job_id
        );

        res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            application_id: result.lastInsertRowid
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to submit application"
        });
    }
});

/* ================================
   GET STUDENT APPLICATIONS
================================ */

router.get("/student/:student_id", authMiddleware, (req, res) => {
    try {
        if (req.user.type !== "student" || req.user.id !== Number(req.params.student_id)) {
    return res.status(403).json({
        success: false,
        message: "You can only access your own applications"
    });
}
        const applications = db.prepare(`
            SELECT
                applications.id AS application_id,
                applications.status,
                applications.applied_at,
                jobs.id AS job_id,
                jobs.title,
                jobs.location,
                jobs.salary,
                jobs.job_type,
                companies.company_name
            FROM applications
            INNER JOIN jobs
                ON applications.job_id = jobs.id
            INNER JOIN companies
                ON jobs.company_id = companies.id
            WHERE applications.student_id = ?
            ORDER BY applications.applied_at DESC
        `).all(req.params.student_id);

        res.json({
            success: true,
            count: applications.length,
            applications: applications
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch applications"
        });
    }
});

/* ================================
   GET JOB APPLICANTS
================================ */

router.get("/job/:job_id/applicants", authMiddleware, (req, res) => {
    try {
        if (req.user.type !== "company") {
    return res.status(403).json({
        success: false,
        message: "Only companies can view applicants"
    });
}

const job = db.prepare(`
    SELECT id, company_id
    FROM jobs
    WHERE id = ?
`).get(req.params.job_id);

if (!job) {
    return res.status(404).json({
        success: false,
        message: "Job not found"
    });
}

if (req.user.id !== Number(job.company_id)) {
    return res.status(403).json({
        success: false,
        message: "You can only view applicants for your own jobs"
    });
}
        const applicants = db.prepare(`
            SELECT
                applications.id AS application_id,
                applications.status,
                applications.applied_at,

                students.id AS student_id,
                students.name,
                students.email,
                students.phone,
                students.college,
                students.course,
                students.branch,
                students.cgpa,
                students.skills,
                students.resume

            FROM applications

            INNER JOIN students
                ON applications.student_id = students.id

            WHERE applications.job_id = ?

            ORDER BY applications.applied_at DESC
        `).all(req.params.job_id);

        res.json({
            success: true,
            count: applicants.length,
            applicants: applicants
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch applicants"
        });
    }
});

/* ================================
   UPDATE APPLICATION STATUS
================================ */

router.put("/:application_id/status", authMiddleware, (req, res) => {
    try {
        if (req.user.type !== "company") {
    return res.status(403).json({
        success: false,
        message: "Only companies can update application status"
    });
}
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "Shortlisted",
            "Rejected"
        ];

        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application status"
            });
        }

        const application = db.prepare(`
    SELECT
        applications.id,
        jobs.company_id
    FROM applications
    INNER JOIN jobs
        ON applications.job_id = jobs.id
    WHERE applications.id = ?
`).get(req.params.application_id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }

        if (req.user.id !== Number(application.company_id)) {
    return res.status(403).json({
        success: false,
        message: "You can only update applications for your own jobs"
    });
}

        db.prepare(`
            UPDATE applications
            SET status = ?
            WHERE id = ?
        `).run(
            status,
            req.params.application_id
        );

        res.json({
            success: true,
            message: "Application status updated successfully",
            status: status
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update application status"
        });
    }
});

module.exports = router;