const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const db = require("../database");

// Send message
router.post("/", authMiddleware, (req, res) => {
    try {
        const {
            sender_type,
            sender_id,
            receiver_type,
            receiver_id,
            message
        } = req.body;
        if (
    req.user.type !== sender_type ||
    req.user.id !== Number(sender_id)
) {
    return res.status(403).json({
        success: false,
        message: "You can only send messages as yourself"
    });
}

        if (
            !sender_type ||
            !sender_id ||
            !receiver_type ||
            !receiver_id ||
            !message
        ) {
            return res.status(400).json({
                success: false,
                message: "All message fields are required"
            });
        }

        if (!["student", "company"].includes(sender_type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sender type"
            });
        }

        if (!["student", "company"].includes(receiver_type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid receiver type"
            });
        }

        const senderTable = sender_type === "student"
            ? "students"
            : "companies";

        const receiverTable = receiver_type === "student"
            ? "students"
            : "companies";

        const sender = db.prepare(`
            SELECT id
            FROM ${senderTable}
            WHERE id = ?
        `).get(sender_id);

        if (!sender) {
            return res.status(404).json({
                success: false,
                message: "Sender not found"
            });
        }

        const receiver = db.prepare(`
            SELECT id
            FROM ${receiverTable}
            WHERE id = ?
        `).get(receiver_id);

        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "Receiver not found"
            });
        }

        const result = db.prepare(`
            INSERT INTO messages
            (
                sender_type,
                sender_id,
                receiver_type,
                receiver_id,
                message
            )
            VALUES (?, ?, ?, ?, ?)
        `).run(
            sender_type,
            sender_id,
            receiver_type,
            receiver_id,
            message
        );

        const newMessage = db.prepare(`
            SELECT *
            FROM messages
            WHERE id = ?
        `).get(result.lastInsertRowid);

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: newMessage
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to send message"
        });
    }
});


// Get conversation between two users
router.get("/conversation", authMiddleware, (req, res) => {
    try {
        const {
            user1_type,
            user1_id,
            user2_type,
            user2_id
        } = req.query;

        if (
    (req.user.type !== sender_type || req.user.id !== Number(sender_id)) &&
    (req.user.type !== receiver_type || req.user.id !== Number(receiver_id))
) {
    return res.status(403).json({
        success: false,
        message: "You can only access your own conversations"
    });
}

        if (
            !user1_type ||
            !user1_id ||
            !user2_type ||
            !user2_id
        ) {
            return res.status(400).json({
                success: false,
                message: "Both users are required"
            });
        }

        const messages = db.prepare(`
            SELECT *
            FROM messages
            WHERE
                (
                    sender_type = ?
                    AND sender_id = ?
                    AND receiver_type = ?
                    AND receiver_id = ?
                )
                OR
                (
                    sender_type = ?
                    AND sender_id = ?
                    AND receiver_type = ?
                    AND receiver_id = ?
                )
            ORDER BY created_at ASC
        `).all(
            user1_type,
            user1_id,
            user2_type,
            user2_id,
            user2_type,
            user2_id,
            user1_type,
            user1_id
        );

        res.json({
            success: true,
            count: messages.length,
            messages
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// Get all messages received by a user
router.get("/received/:receiver_type/:receiver_id", authMiddleware, (req, res) => {
    try {
        if (
    req.user.type !== req.params.receiver_type ||
    req.user.id !== Number(req.params.receiver_id)
) {
    return res.status(403).json({
        success: false,
        message: "You can only access your own received messages"
    });
}
        const {
            receiver_type,
            receiver_id
        } = req.params;

        const messages = db.prepare(`
            SELECT *
            FROM messages
            WHERE receiver_type = ?
            AND receiver_id = ?
            ORDER BY created_at DESC
        `).all(
            receiver_type,
            receiver_id
        );

        res.json({
            success: true,
            count: messages.length,
            messages
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// Mark message as read
router.put("/:id/read", authMiddleware, (req, res) => {
    try {
        const { id } = req.params;

        const message = db.prepare(`
            SELECT *
            FROM messages
            WHERE id = ?
        `).get(id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        if (
            req.user.type !== message.receiver_type ||
            req.user.id !== Number(message.receiver_id)
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only mark your own received messages as read"
            });
        }

        db.prepare(`
            UPDATE messages
            SET is_read = 1
            WHERE id = ?
        `).run(id);

        const updatedMessage = db.prepare(`
            SELECT *
            FROM messages
            WHERE id = ?
        `).get(id);

        res.json({
            success: true,
            message: "Message marked as read",
            data: updatedMessage
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete message
router.delete("/:id", authMiddleware, (req, res) => {
    try {
        const { id } = req.params;

        const message = db.prepare(`
            SELECT *
            FROM messages
            WHERE id = ?
        `).get(id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        if (
            (req.user.type !== message.sender_type ||
                req.user.id !== Number(message.sender_id)) &&
            (req.user.type !== message.receiver_type ||
                req.user.id !== Number(message.receiver_id))
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own messages"
            });
        }

        db.prepare(`
            DELETE FROM messages
            WHERE id = ?
        `).run(id);

        res.json({
            success: true,
            message: "Message deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete message"
        });
    }
});


module.exports = router;