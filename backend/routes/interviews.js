const express = require("express");
const db = require("../database");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* ================================
   SCHEDULE INTERVIEW
================================ */

router.post("/", authMiddleware, (req, res) => {
    try {
        if (req.user.type !== "company") {
    return res.status(403).json({
        success: false,
        message: "Only companies can schedule interviews"
    });
}
        const {
            application_id,
            interview_date,
            interview_time,
            mode,
            meeting_link
        } = req.body;

        if (!application_id || !interview_date || !interview_time) {
            return res.status(400).json({
                success: false,
                message: "Application ID, interview date and time are required"
            });
        }

        const application = db.prepare(`
    SELECT
        applications.id,
        applications.status,
        jobs.company_id
    FROM applications
    INNER JOIN jobs
        ON applications.job_id = jobs.id
    WHERE applications.id = ?
`).get(application_id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }
        if (req.user.id !== Number(application.company_id)) {
    return res.status(403).json({
        success: false,
        message: "You can only schedule interviews for your own jobs"
    });
}

        const existingInterview = db.prepare(`
            SELECT id
            FROM interviews
            WHERE application_id = ?
              AND status = 'Scheduled'
        `).get(application_id);

        if (existingInterview) {
            return res.status(409).json({
                success: false,
                message: "Interview already scheduled for this application"
            });
        }

        const result = db.prepare(`
            INSERT INTO interviews
            (
                application_id,
                interview_date,
                interview_time,
                mode,
                meeting_link
            )
            VALUES (?, ?, ?, ?, ?)
        `).run(
            application_id,
            interview_date,
            interview_time,
            mode || null,
            meeting_link || null
        );

        db.prepare(`
            UPDATE applications
            SET status = 'Interview Scheduled'
            WHERE id = ?
        `).run(application_id);

        res.status(201).json({
            success: true,
            message: "Interview scheduled successfully",
            interview_id: result.lastInsertRowid
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to schedule interview"
        });
    }
});


/* ================================
   GET STUDENT INTERVIEWS
================================ */

router.get("/student/:student_id", authMiddleware, (req, res) => {
    try {
        if (req.user.type !== "student" || req.user.id !== Number(req.params.student_id)) {
    return res.status(403).json({
        success: false,
        message: "You can only access your own interviews"
    });
}   
        const interviews = db.prepare(`
            SELECT
                interviews.id AS interview_id,
                interviews.interview_date,
                interviews.interview_time,
                interviews.mode,
                interviews.meeting_link,
                interviews.status,

                jobs.id AS job_id,
                jobs.title,

                companies.company_name

            FROM interviews

            INNER JOIN applications
                ON interviews.application_id = applications.id

            INNER JOIN jobs
                ON applications.job_id = jobs.id

            INNER JOIN companies
                ON jobs.company_id = companies.id

            WHERE applications.student_id = ?

            ORDER BY interviews.interview_date ASC,
                     interviews.interview_time ASC
        `).all(req.params.student_id);

        res.json({
            success: true,
            count: interviews.length,
            interviews: interviews
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch student interviews"
        });
    }
});


/* ================================
   GET COMPANY INTERVIEWS
================================ */

router.get("/company/:company_id", authMiddleware, (req, res) => {
    try {
        if (req.user.type !== "company" || req.user.id !== Number(req.params.company_id)) {
    return res.status(403).json({
        success: false,
        message: "You can only access your own company interviews"
    });
}
        const interviews = db.prepare(`
            SELECT
                interviews.id AS interview_id,
                interviews.interview_date,
                interviews.interview_time,
                interviews.mode,
                interviews.meeting_link,
                interviews.status,

                students.id AS student_id,
                students.name,
                students.email,

                jobs.id AS job_id,
                jobs.title

            FROM interviews

            INNER JOIN applications
                ON interviews.application_id = applications.id

            INNER JOIN students
                ON applications.student_id = students.id

            INNER JOIN jobs
                ON applications.job_id = jobs.id

            WHERE jobs.company_id = ?

            ORDER BY interviews.interview_date ASC,
                     interviews.interview_time ASC
        `).all(req.params.company_id);

        res.json({
            success: true,
            count: interviews.length,
            interviews: interviews
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch company interviews"
        });
    }
});


module.exports = router;