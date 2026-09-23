import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Interviews.css";

function Interviews() {
    const navigate = useNavigate();

    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            setLoading(true);
            setError("");

            const studentUser = localStorage.getItem("studentUser");
            const token = localStorage.getItem("studentToken");

            if (!studentUser || !token) {
                navigate("/login");
                return;
            }

            let user;

            try {
                user = JSON.parse(studentUser);
            } catch (parseError) {
                localStorage.removeItem("studentToken");
                localStorage.removeItem("studentUser");
                navigate("/login");
                return;
            }

            if (!user?.id) {
                navigate("/login");
                return;
            }

            const response = await api.get(
                `/interviews/student/${user.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setInterviews(response.data.interviews || []);
        } catch (err) {
            console.error("Interview fetch error:", err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                localStorage.removeItem("studentToken");
                localStorage.removeItem("studentUser");
                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load interviews."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "N/A";

        return new Date(`${date}T00:00:00`).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    const formatTime = (time) => {
        if (!time) return "N/A";

        const [hours, minutes] = time.split(":");

        const date = new Date();
        date.setHours(Number(hours), Number(minutes), 0, 0);

        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusClass = (status) => {
        if (status === "Scheduled") {
            return "interview-status-scheduled";
        }

        if (status === "Completed") {
            return "interview-status-completed";
        }

        if (status === "Cancelled") {
            return "interview-status-cancelled";
        }

        return "interview-status-default";
    };

    if (loading) {
        return (
            <div className="interviews-page">
                <div className="interviews-loading">
                    Loading interviews...
                </div>
            </div>
        );
    }

    return (
        <div className="interviews-page">
            <div className="interviews-container">

                <div className="interviews-header">
                    <div>
                        <h1>My Interviews</h1>
                        <p>
                            View and manage your scheduled interviews.
                        </p>
                    </div>

                    <button
                        className="back-dashboard-btn"
                        onClick={() => navigate("/dashboard")}
                    >
                        ← Dashboard
                    </button>
                </div>

                {error && (
                    <div className="interviews-error">
                        {error}
                    </div>
                )}

                {!error && interviews.length === 0 && (
                    <div className="no-interviews">
                        <div className="interview-empty-icon">
                            📅
                        </div>

                        <h2>No Interviews Scheduled</h2>

                        <p>
                            You don't have any interviews scheduled yet.
                        </p>

                        <button
                            className="browse-jobs-btn"
                            onClick={() => navigate("/jobs")}
                        >
                            Browse Jobs
                        </button>
                    </div>
                )}

                {!error && interviews.length > 0 && (
                    <div className="interviews-list">
                        {interviews.map((interview) => (
                            <div
                                className="interview-card"
                                key={interview.interview_id}
                            >
                                <div className="interview-top">

                                    <div className="interview-title-section">
                                        <div className="interview-icon">
                                            📅
                                        </div>

                                        <div>
                                            <h2>
                                                {interview.title}
                                            </h2>

                                            <p className="company-name">
                                                {interview.company_name}
                                            </p>
                                        </div>
                                    </div>

                                    <span
                                        className={`interview-status ${getStatusClass(
                                            interview.status
                                        )}`}
                                    >
                                        {interview.status}
                                    </span>
                                </div>

                                <div className="interview-details">

                                    <div className="detail-item">
                                        <span className="detail-icon">
                                            📆
                                        </span>

                                        <div>
                                            <small>Date</small>
                                            <strong>
                                                {formatDate(
                                                    interview.interview_date
                                                )}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="detail-item">
                                        <span className="detail-icon">
                                            🕒
                                        </span>

                                        <div>
                                            <small>Time</small>
                                            <strong>
                                                {formatTime(
                                                    interview.interview_time
                                                )}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="detail-item">
                                        <span className="detail-icon">
                                            💻
                                        </span>

                                        <div>
                                            <small>Mode</small>
                                            <strong>
                                                {interview.mode ||
                                                    "Not specified"}
                                            </strong>
                                        </div>
                                    </div>

                                </div>

                                {interview.meeting_link && (
                                    <div className="meeting-section">
                                        <a
                                            href={interview.meeting_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="join-interview-btn"
                                        >
                                            Join Interview →
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}

export default Interviews;