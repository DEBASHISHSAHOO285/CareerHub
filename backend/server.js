const dashboardRoutes = require("./routes/dashboard");
const interviewRoutes = require("./routes/interviews");
const savedJobRoutes = require("./routes/savedJobs");
const applicationRoutes = require("./routes/applications");
const notificationRoutes = require("./routes/notifications");
const adminRoutes = require("./routes/admin");
const messageRoutes = require("./routes/messages");

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const db = require("./database");
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");
const path = require("path");


const app = express();

const PORT = 5000;

/* ================================
   MIDDLEWARE
================================ */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/saved-jobs", savedJobRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);


/* ================================
   TEST ROUTE
================================ */

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "CareerHub Backend API is running",
        database: "SQLite connected"
    });
});


/* ================================
   SERVER
================================ */

app.listen(PORT, () => {
    console.log(
        `CareerHub server running at http://localhost:${PORT}`
    );
});