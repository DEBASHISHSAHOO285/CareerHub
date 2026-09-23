const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const db = require("../database");

// Create notification
router.post("/", authMiddleware, (req, res) => {
    try {

        if (
    (req.body.user_type === "student" && req.user.type !== "student") ||
    (req.body.user_type === "company" && req.user.type !== "company") ||
    req.user.id !== Number(req.body.user_id)
) {
    return res.status(403).json({
        success: false,
        message: "You can only create notifications for yourself"
    });
}
        const {
            user_type,
            user_id,
            title,
            message
        } = req.body;

        if (!user_type || !user_id || !title || !message) {
            return res.status(400).json({
                success: false,
                message: "user_type, user_id, title and message are required"
            });
        }

        if (!["student", "company"].includes(user_type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user type"
            });
        }

        const userTable = user_type === "student"
            ? "students"
            : "companies";

        const user = db.prepare(`
            SELECT id
            FROM ${userTable}
            WHERE id = ?
        `).get(user_id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const result = db.prepare(`
            INSERT INTO notifications
            (user_type, user_id, title, message)
            VALUES (?, ?, ?, ?)
        `).run(
            user_type,
            user_id,
            title,
            message
        );

        const notification = db.prepare(`
            SELECT *
            FROM notifications
            WHERE id = ?
        `).get(result.lastInsertRowid);

        res.status(201).json({
            success: true,
            message: "Notification created successfully",
            notification
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create notification"
        });
    }
});


// Get notifications for a user
router.get("/:user_type/:user_id", authMiddleware, (req, res) => {
    try {
        if (
    req.user.type !== req.params.user_type ||
    req.user.id !== Number(req.params.user_id)
) {
    return res.status(403).json({
        success: false,
        message: "You can only access your own notifications"
    });
}
        const {
            user_type,
            user_id
        } = req.params;

        const notifications = db.prepare(`
            SELECT *
            FROM notifications
            WHERE user_type = ?
            AND user_id = ?
            ORDER BY created_at DESC
        `).all(
            user_type,
            user_id
        );

        res.json({
            success: true,
            count: notifications.length,
            notifications
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// Mark notification as read
router.put("/:id/read", authMiddleware, (req, res) => {
    try {
        const { id } = req.params;

        const notification = db.prepare(`
            SELECT *
            FROM notifications
            WHERE id = ?
        `).get(id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        if (
            req.user.type !== notification.user_type ||
            req.user.id !== Number(notification.user_id)
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own notifications"
            });
        }

        const result = db.prepare(`
            UPDATE notifications
            SET is_read = 1
            WHERE id = ?
        `).run(id);

        const updatedNotification = db.prepare(`
            SELECT *
            FROM notifications
            WHERE id = ?
        `).get(id);

        res.json({
            success: true,
            message: "Notification marked as read",
            notification: updatedNotification
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// Mark all notifications as read
router.put("/read-all/:user_type/:user_id", authMiddleware, (req, res) => {
    try {
        if (
    req.user.type !== req.params.user_type ||
    req.user.id !== Number(req.params.user_id)
) {
    return res.status(403).json({
        success: false,
        message: "You can only update your own notifications"
    });
}
        const {
            user_type,
            user_id
        } = req.params;

        const result = db.prepare(`
            UPDATE notifications
            SET is_read = 1
            WHERE user_type = ?
            AND user_id = ?
        `).run(
            user_type,
            user_id
        );

        res.json({
            success: true,
            message: "All notifications marked as read",
            updated_count: result.changes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// Delete notification
router.delete("/:id", authMiddleware, (req, res) => {
    try {
        const { id } = req.params;

        const notification = db.prepare(`
            SELECT *
            FROM notifications
            WHERE id = ?
        `).get(id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        if (
            req.user.type !== notification.user_type ||
            req.user.id !== Number(notification.user_id)
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own notifications"
            });
        }

        const result = db.prepare(`
            DELETE FROM notifications
            WHERE id = ?
        `).run(id);

        res.json({
            success: true,
            message: "Notification deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


module.exports = router;