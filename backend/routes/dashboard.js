const express = require("express");
const db = require("../database");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* ================================
   STUDENT DASHBOARD
================================ */

router.get("/student/:student_id", authMiddleware, (req, res) => {
    try {
        if (
    req.user.type !== "student" ||
    req.user.id !== Number(req.params.student_id)
) {
    return res.status(403).json({
        success: false,
        message: "You can only access your own dashboard"
    });
}
        const studentId = req.params.student_id;

        const student = db.prepare(`
            SELECT
                id,
                name,
                email,
                college,
                course,
                branch,
                cgpa,
                skills,
                resume
            FROM students
            WHERE id = ?
        `).get(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        const applicationStats = db.prepare(`
            SELECT
                COUNT(*) AS total_applications,
                SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN status = 'Shortlisted' THEN 1 ELSE 0 END) AS shortlisted,
                SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected,
                SUM(CASE WHEN status = 'Interview Scheduled' THEN 1 ELSE 0 END) AS interviews
            FROM applications
            WHERE student_id = ?
        `).get(studentId);

        const savedJobsCount = db.prepare(`
            SELECT COUNT(*) AS total_saved_jobs
            FROM saved_jobs
            WHERE student_id = ?
        `).get(studentId);

        const recentApplications = db.prepare(`
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
            LIMIT 5
        `).all(studentId);

        const upcomingInterviews = db.prepare(`
            SELECT
                interviews.id AS interview_id,
                interviews.interview_date,
                interviews.interview_time,
                interviews.mode,
                interviews.meeting_link,
                interviews.status,
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
              AND interviews.status = 'Scheduled'
            ORDER BY interviews.interview_date ASC,
                     interviews.interview_time ASC
            LIMIT 5
        `).all(studentId);

        res.json({
            success: true,
            dashboard: {
                student: student,
                statistics: {
                    total_applications: applicationStats.total_applications || 0,
                    pending: applicationStats.pending || 0,
                    shortlisted: applicationStats.shortlisted || 0,
                    rejected: applicationStats.rejected || 0,
                    interviews: applicationStats.interviews || 0,
                    saved_jobs: savedJobsCount.total_saved_jobs || 0
                },
                recent_applications: recentApplications,
                upcoming_interviews: upcomingInterviews
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch student dashboard"
        });
    }
});

/* ================================
   COMPANY DASHBOARD
================================ */

// =========================================
// COMPANY INTERVIEW MANAGEMENT
// =========================================

// GET COMPANY INTERVIEWS
router.get(
    "/company/:company_id/interviews",
    authMiddleware,
    (req, res) => {
        try {
            if (
                req.user.type !== "company" ||
                req.user.id !== Number(req.params.company_id)
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You can only access interviews of your own company",
                });
            }

            const companyId = Number(req.params.company_id);

            const interviews = db.prepare(`
                SELECT
                    interviews.id,
                    interviews.application_id,
                    interviews.interview_date,
                    interviews.interview_time,
                    interviews.mode,
                    interviews.meeting_link,
                    interviews.status,

                    applications.student_id,
                    applications.job_id,
                    applications.status AS application_status,

                    students.name AS student_name,
                    students.email AS student_email,

                    jobs.title AS job_title

                FROM interviews

                INNER JOIN applications
                    ON interviews.application_id = applications.id

                INNER JOIN students
                    ON applications.student_id = students.id

                INNER JOIN jobs
                    ON applications.job_id = jobs.id

                WHERE jobs.company_id = ?

                ORDER BY
                    interviews.interview_date ASC,
                    interviews.interview_time ASC
            `).all(companyId);

            res.json({
                success: true,
                count: interviews.length,
                interviews,
            });

        } catch (error) {
            console.error(
                "Get company interviews error:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Failed to fetch company interviews",
            });
        }
    }
);


// CREATE / SCHEDULE INTERVIEW
router.post(
    "/company/:company_id/interviews",
    authMiddleware,
    (req, res) => {
        try {
            if (
                req.user.type !== "company" ||
                req.user.id !== Number(req.params.company_id)
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You can only schedule interviews for your own company",
                });
            }

            const companyId = Number(req.params.company_id);

            const {
                application_id,
                interview_date,
                interview_time,
                mode,
                meeting_link,
            } = req.body;

            if (
                !application_id ||
                !interview_date ||
                !interview_time ||
                !mode
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Application, date, time and mode are required",
                });
            }

            // Check application belongs to this company
            const application = db.prepare(`
                SELECT
                    applications.id,
                    applications.status,
                    jobs.company_id
                FROM applications

                INNER JOIN jobs
                    ON applications.job_id = jobs.id

                WHERE
                    applications.id = ?
                    AND jobs.company_id = ?
            `).get(application_id, companyId);

            if (!application) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Application not found or access denied",
                });
            }

            // Prevent duplicate active scheduled interview
            const existingInterview = db.prepare(`
                SELECT id
                FROM interviews
                WHERE
                    application_id = ?
                    AND status = 'Scheduled'
            `).get(application_id);

            if (existingInterview) {
                return res.status(409).json({
                    success: false,
                    message:
                        "An interview is already scheduled for this application",
                });
            }

            const result = db.prepare(`
                INSERT INTO interviews
                (
                    application_id,
                    interview_date,
                    interview_time,
                    mode,
                    meeting_link,
                    status
                )
                VALUES (?, ?, ?, ?, ?, 'Scheduled')
            `).run(
                application_id,
                interview_date,
                interview_time,
                mode,
                meeting_link || null
            );

            // Update application status
            db.prepare(`
                UPDATE applications
                SET status = 'Interview Scheduled'
                WHERE id = ?
            `).run(application_id);

            res.status(201).json({
                success: true,
                message: "Interview scheduled successfully",
                interview_id: result.lastInsertRowid,
            });

        } catch (error) {
            console.error(
                "Schedule interview error:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Failed to schedule interview",
            });
        }
    }
);


// UPDATE INTERVIEW
router.put(
    "/company/:company_id/interviews/:id",
    authMiddleware,
    (req, res) => {
        try {
            if (
                req.user.type !== "company" ||
                req.user.id !== Number(req.params.company_id)
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You can only update your company's interviews",
                });
            }

            const companyId = Number(req.params.company_id);
            const interviewId = Number(req.params.id);

            const {
                interview_date,
                interview_time,
                mode,
                meeting_link,
                status,
            } = req.body;

            const interview = db.prepare(`
                SELECT
                    interviews.id,
                    interviews.application_id
                FROM interviews

                INNER JOIN applications
                    ON interviews.application_id = applications.id

                INNER JOIN jobs
                    ON applications.job_id = jobs.id

                WHERE
                    interviews.id = ?
                    AND jobs.company_id = ?
            `).get(interviewId, companyId);

            if (!interview) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Interview not found or access denied",
                });
            }

            db.prepare(`
                UPDATE interviews
                SET
                    interview_date = ?,
                    interview_time = ?,
                    mode = ?,
                    meeting_link = ?,
                    status = ?
                WHERE id = ?
            `).run(
                interview_date,
                interview_time,
                mode,
                meeting_link || null,
                status || "Scheduled",
                interviewId
            );

            // Keep application status synchronized
            if (status === "Cancelled") {
                db.prepare(`
                    UPDATE applications
                    SET status = 'Shortlisted'
                    WHERE id = ?
                `).run(interview.application_id);
            } else if (status === "Scheduled") {
                db.prepare(`
                    UPDATE applications
                    SET status = 'Interview Scheduled'
                    WHERE id = ?
                `).run(interview.application_id);
            }

            res.json({
                success: true,
                message: "Interview updated successfully",
            });

        } catch (error) {
            console.error(
                "Update interview error:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Failed to update interview",
            });
        }
    }
);


// DELETE / CANCEL INTERVIEW
router.delete(
    "/company/:company_id/interviews/:id",
    authMiddleware,
    (req, res) => {
        try {
            if (
                req.user.type !== "company" ||
                req.user.id !== Number(req.params.company_id)
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You can only cancel your company's interviews",
                });
            }

            const companyId = Number(req.params.company_id);
            const interviewId = Number(req.params.id);

            const interview = db.prepare(`
                SELECT
                    interviews.id,
                    interviews.application_id
                FROM interviews

                INNER JOIN applications
                    ON interviews.application_id = applications.id

                INNER JOIN jobs
                    ON applications.job_id = jobs.id

                WHERE
                    interviews.id = ?
                    AND jobs.company_id = ?
            `).get(interviewId, companyId);

            if (!interview) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Interview not found or access denied",
                });
            }

            db.prepare(`
                UPDATE interviews
                SET status = 'Cancelled'
                WHERE id = ?
            `).run(interviewId);

            db.prepare(`
                UPDATE applications
                SET status = 'Shortlisted'
                WHERE id = ?
            `).run(interview.application_id);

            res.json({
                success: true,
                message: "Interview cancelled successfully",
            });

        } catch (error) {
            console.error(
                "Cancel interview error:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Failed to cancel interview",
            });
        }
    }
);

router.get("/company/:company_id", authMiddleware, (req, res) => {
    try {
        if (
    req.user.type !== "company" ||
    req.user.id !== Number(req.params.company_id)
) {
    return res.status(403).json({
        success: false,
        message: "You can only access your own company dashboard"
    });
}
        const companyId = req.params.company_id;

        const company = db.prepare(`
            SELECT
                id,
                company_name,
                email,
                phone,
                website,
                description,
                location,
                logo
            FROM companies
            WHERE id = ?
        `).get(companyId);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        const jobStats = db.prepare(`
            SELECT COUNT(*) AS total_jobs
            FROM jobs
            WHERE company_id = ?
        `).get(companyId);

        const applicationStats = db.prepare(`
            SELECT
                COUNT(applications.id) AS total_applications,

                SUM(
                    CASE
                        WHEN applications.status = 'Pending'
                        THEN 1 ELSE 0
                    END
                ) AS pending,

                SUM(
                    CASE
                        WHEN applications.status = 'Shortlisted'
                        THEN 1 ELSE 0
                    END
                ) AS shortlisted,

                SUM(
                    CASE
                        WHEN applications.status = 'Rejected'
                        THEN 1 ELSE 0
                    END
                ) AS rejected,

                SUM(
                    CASE
                        WHEN applications.status = 'Interview Scheduled'
                        THEN 1 ELSE 0
                    END
                ) AS interviews

            FROM applications

            INNER JOIN jobs
                ON applications.job_id = jobs.id

            WHERE jobs.company_id = ?
        `).get(companyId);

        const recentApplications = db.prepare(`
            SELECT
                applications.id AS application_id,
                applications.status,
                applications.applied_at,

                students.id AS student_id,
                students.name,
                students.email,
                students.cgpa,

                jobs.id AS job_id,
                jobs.title

            FROM applications

            INNER JOIN students
                ON applications.student_id = students.id

            INNER JOIN jobs
                ON applications.job_id = jobs.id

            WHERE jobs.company_id = ?

            ORDER BY applications.applied_at DESC

            LIMIT 5
        `).all(companyId);

        const upcomingInterviews = db.prepare(`
            SELECT
                interviews.id AS interview_id,
                interviews.interview_date,
                interviews.interview_time,
                interviews.mode,
                interviews.meeting_link,
                interviews.status,

                students.name,
                students.email,

                jobs.title

            FROM interviews

            INNER JOIN applications
                ON interviews.application_id = applications.id

            INNER JOIN students
                ON applications.student_id = students.id

            INNER JOIN jobs
                ON applications.job_id = jobs.id

            WHERE jobs.company_id = ?
              AND interviews.status = 'Scheduled'

            ORDER BY interviews.interview_date ASC,
                     interviews.interview_time ASC

            LIMIT 5
        `).all(companyId);

        res.json({
            success: true,

            dashboard: {
                company: company,

                statistics: {
                    total_jobs: jobStats.total_jobs || 0,
                    total_applications: applicationStats.total_applications || 0,
                    pending: applicationStats.pending || 0,
                    shortlisted: applicationStats.shortlisted || 0,
                    rejected: applicationStats.rejected || 0,
                    interviews: applicationStats.interviews || 0
                },

                recent_applications: recentApplications,

                upcoming_interviews: upcomingInterviews
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch company dashboard"
        });
    }
});

/* ================================
   COMPANY INTERVIEWS
================================ */

router.get(
    "/company/:company_id/interviews",
    authMiddleware,
    (req, res) => {
        try {
            const companyId = Number(
                req.params.company_id
            );

            /* Company can access only its own interviews */
            if (
                req.user.type !== "company" ||
                req.user.id !== companyId
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You can only access your own company interviews"
                });
            }

            const interviews = db.prepare(`
                SELECT
                    interviews.id,
                    interviews.application_id,
                    interviews.interview_date,
                    interviews.interview_time,
                    interviews.mode,
                    interviews.meeting_link,
                    interviews.status,

                    applications.student_id,
                    applications.job_id,
                    applications.status AS application_status,

                    students.name AS student_name,
                    students.email AS student_email,

                    jobs.id AS job_id,
                    jobs.title AS job_title

                FROM interviews

                INNER JOIN applications
                    ON interviews.application_id =
                       applications.id

                INNER JOIN students
                    ON applications.student_id =
                       students.id

                INNER JOIN jobs
                    ON applications.job_id =
                       jobs.id

                WHERE jobs.company_id = ?

                ORDER BY
                    interviews.interview_date ASC,
                    interviews.interview_time ASC
            `).all(companyId);

            res.json({
                success: true,
                count: interviews.length,
                interviews
            });

        } catch (error) {
            console.error(
                "Company interviews error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to fetch company interviews"
            });
        }
    }
);

module.exports = router;