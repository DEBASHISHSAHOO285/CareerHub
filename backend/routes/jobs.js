const express = require("express");
const db = require("../database");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* ================================
   POST NEW JOB
================================ */

router.post("/", authMiddleware, (req, res) => {
    try {
        const {
            company_id,
            title,
            description,
            location,
            salary,
            job_type,
            skills,
            deadline
        } = req.body;

        if (!company_id || !title || !description) {
            return res.status(400).json({
                success: false,
                message: "Company ID, title and description are required"
            });
        }

        if (req.user.type !== "company" || req.user.id !== Number(company_id)) {
    return res.status(403).json({
        success: false,
        message: "You can only post jobs for your own company"
    });
}

        // Check company exists
        const company = db.prepare(`
            SELECT id FROM companies WHERE id = ?
        `).get(company_id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        const stmt = db.prepare(`
            INSERT INTO jobs
            (
                company_id,
                title,
                description,
                location,
                salary,
                job_type,
                skills,
                deadline
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            company_id,
            title,
            description,
            location || null,
            salary || null,
            job_type || null,
            skills || null,
            deadline || null
        );

        res.status(201).json({
            success: true,
            message: "Job posted successfully",
            job_id: result.lastInsertRowid
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to post job"
        });
    }
});


/* ================================
   GET ALL JOBS
================================ */

router.get("/", (req, res) => {
    try {
        const jobs = db.prepare(`
            SELECT
                jobs.id,
                jobs.company_id,
                jobs.title,
                jobs.description,
                jobs.location,
                jobs.salary,
                jobs.job_type,
                jobs.skills,
                jobs.deadline,
                jobs.created_at,
                companies.company_name
            FROM jobs
            INNER JOIN companies
                ON jobs.company_id = companies.id
            ORDER BY jobs.created_at DESC
        `).all();

        res.json({
            success: true,
            count: jobs.length,
            jobs: jobs
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch jobs"
        });
    }
});

/* ================================
   SEARCH AND FILTER JOBS
================================ */

router.get("/search", (req, res) => {
    try {
        const {
            keyword,
            location,
            job_type
        } = req.query;

        let query = `
            SELECT
                jobs.id,
                jobs.company_id,
                jobs.title,
                jobs.description,
                jobs.location,
                jobs.salary,
                jobs.job_type,
                jobs.skills,
                jobs.deadline,
                jobs.created_at,
                companies.company_name
            FROM jobs
            INNER JOIN companies
                ON jobs.company_id = companies.id
            WHERE 1 = 1
        `;

        const params = [];

        if (keyword) {
            query += `
                AND (
                    jobs.title LIKE ?
                    OR jobs.description LIKE ?
                    OR jobs.skills LIKE ?
                    OR companies.company_name LIKE ?
                )
            `;

            const searchTerm = `%${keyword}%`;

            params.push(
                searchTerm,
                searchTerm,
                searchTerm,
                searchTerm
            );
        }

        if (location) {
            query += `
                AND jobs.location LIKE ?
            `;

            params.push(`%${location}%`);
        }

        if (job_type) {
            query += `
                AND jobs.job_type = ?
            `;

            params.push(job_type);
        }

        query += `
            ORDER BY jobs.created_at DESC
        `;

        const jobs = db.prepare(query).all(...params);

        res.json({
            success: true,
            count: jobs.length,
            jobs: jobs
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to search jobs"
        });
    }
});

/* ================================
   GET SINGLE JOB
================================ */

router.get("/:id", (req, res) => {
    try {
        const job = db.prepare(`
            SELECT
                jobs.id,
                jobs.company_id,
                jobs.title,
                jobs.description,
                jobs.location,
                jobs.salary,
                jobs.job_type,
                jobs.skills,
                jobs.deadline,
                jobs.created_at,
                companies.company_name
            FROM jobs
            INNER JOIN companies
                ON jobs.company_id = companies.id
            WHERE jobs.id = ?
        `).get(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        res.json({
            success: true,
            job: job
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch job"
        });
    }
});

/* ================================
   GET COMPANY JOBS
================================ */

router.get("/company/:company_id", (req, res) => {
    try {
        const jobs = db.prepare(`
            SELECT
                id,
                company_id,
                title,
                description,
                location,
                salary,
                job_type,
                skills,
                deadline,
                created_at
            FROM jobs
            WHERE company_id = ?
            ORDER BY created_at DESC
        `).all(req.params.company_id);

        res.json({
            success: true,
            count: jobs.length,
            jobs: jobs
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch company jobs"
        });
    }
});

/* ================================
   UPDATE JOB
================================ */

router.put("/:id", authMiddleware, (req, res) => {
    try {
        const {
            company_id,
            title,
            description,
            location,
            salary,
            job_type,
            skills,
            deadline
        } = req.body;

        if (req.user.type !== "company" || req.user.id !== Number(company_id)) {
    return res.status(403).json({
        success: false,
        message: "You can only update jobs from your own company"
    });
}

        if (!company_id || !title || !description) {
            return res.status(400).json({
                success: false,
                message: "Company ID, title and description are required"
            });
        }

        const job = db.prepare(`
            SELECT id
            FROM jobs
            WHERE id = ? AND company_id = ?
        `).get(req.params.id, company_id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found or access denied"
            });
        }

        db.prepare(`
            UPDATE jobs
            SET
                title = ?,
                description = ?,
                location = ?,
                salary = ?,
                job_type = ?,
                skills = ?,
                deadline = ?
            WHERE id = ? AND company_id = ?
        `).run(
            title,
            description,
            location || null,
            salary || null,
            job_type || null,
            skills || null,
            deadline || null,
            req.params.id,
            company_id
        );

        res.json({
            success: true,
            message: "Job updated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update job"
        });
    }
});

/* ================================
   DELETE JOB
================================ */

router.delete("/:id", authMiddleware, (req, res) => {
    try {
        const { company_id } = req.body;

        if (req.user.type !== "company" || req.user.id !== Number(company_id)) {
    return res.status(403).json({
        success: false,
        message: "You can only delete jobs from your own company"
    });
}

        if (!company_id) {
            return res.status(400).json({
                success: false,
                message: "Company ID is required"
            });
        }

        const job = db.prepare(`
            SELECT id
            FROM jobs
            WHERE id = ? AND company_id = ?
        `).get(req.params.id, company_id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found or access denied"
            });
        }

        db.prepare(`
            DELETE FROM saved_jobs
            WHERE job_id = ?
        `).run(req.params.id);

        db.prepare(`
            DELETE FROM applications
            WHERE job_id = ?
        `).run(req.params.id);

        db.prepare(`
            DELETE FROM jobs
            WHERE id = ? AND company_id = ?
        `).run(req.params.id, company_id);

        res.json({
            success: true,
            message: "Job deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete job"
        });
    }
});



module.exports = router;