const express = require("express");
const db = require("../database");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* ================================
   SAVE JOB
================================ */

// ================================
// SAVE JOB
// ================================

router.post("/", authMiddleware, (req, res) => {
    try {

        const { student_id, job_id } = req.body;

        // Validate required fields
        if (!student_id || !job_id) {
            return res.status(400).json({
                success: false,
                message: "Student ID and Job ID are required"
            });
        }

        // Ownership check
        if (
            req.user.type !== "student" ||
            req.user.id !== Number(student_id)
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only save jobs for yourself"
            });
        }

        // Check student exists
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

        // Check job exists
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

        // Check if already saved
        const existing = db.prepare(`
            SELECT id
            FROM saved_jobs
            WHERE student_id = ? AND job_id = ?
        `).get(student_id, job_id);

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Job already saved"
            });
        }

        // Save job
        const result = db.prepare(`
            INSERT INTO saved_jobs
            (student_id, job_id)
            VALUES (?, ?)
        `).run(student_id, job_id);

        res.status(201).json({
            success: true,
            message: "Job saved successfully",
            saved_job_id: result.lastInsertRowid
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to save job"
        });
    }
});


/* ================================
   GET SAVED JOBS
================================ */

router.get("/student/:student_id", authMiddleware, (req, res) => {
    try {
        if (req.user.type !== "student" || req.user.id !== Number(req.params.student_id)) {
    return res.status(403).json({
        success: false,
        message: "You can only access your own saved jobs"
    });
}
        const jobs = db.prepare(`
            SELECT
                saved_jobs.id AS saved_job_id,
                saved_jobs.saved_at,
                jobs.id AS job_id,
                jobs.title,
                jobs.description,
                jobs.location,
                jobs.salary,
                jobs.job_type,
                jobs.skills,
                jobs.deadline,
                companies.company_name
            FROM saved_jobs
            INNER JOIN jobs
                ON saved_jobs.job_id = jobs.id
            INNER JOIN companies
                ON jobs.company_id = companies.id
            WHERE saved_jobs.student_id = ?
            ORDER BY saved_jobs.saved_at DESC
        `).all(req.params.student_id);

        res.json({
            success: true,
            count: jobs.length,
            jobs: jobs
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch saved jobs"
        });
    }
});


/* ================================
   UNSAVE JOB
================================ */

// ================================
// UNSAVE JOB
// ================================

router.delete("/:student_id/:job_id", authMiddleware, (req, res) => {
    try {

        const { student_id, job_id } = req.params;

        // Ownership check
        if (
            req.user.type !== "student" ||
            req.user.id !== Number(student_id)
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own saved jobs"
            });
        }

        const result = db.prepare(`
            DELETE FROM saved_jobs
            WHERE student_id = ? AND job_id = ?
        `).run(
            student_id,
            job_id
        );

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Saved job not found"
            });
        }

        res.json({
            success: true,
            message: "Job removed from saved jobs"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to remove saved job"
        });
    }
});


module.exports = router;