const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

const adminAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check authorization header
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Admin authorization token required",
            });
        }

        // Check Bearer format
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format",
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Admin token missing",
            });
        }

        // Verify JWT
        const decoded = jwt.verify(
            token,
            JWT_SECRET
        );

        // Admin-only access
        if (decoded.type !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access required",
            });
        }

        // Attach decoded admin user
        req.user = decoded;

        next();
    } catch (error) {
        console.error("Admin auth error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired admin token",
        });
    }
};

module.exports = adminAuth;