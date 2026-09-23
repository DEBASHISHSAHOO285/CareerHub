import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Applications.css";

const Applications = () => {
    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const studentUser = localStorage.getItem("studentUser");
            const token = localStorage.getItem("studentToken");

if (!studentUser || !token) {
    navigate("/login");
    return;
}

const user = JSON.parse(studentUser);

            if (!user || !token) {
                navigate("/login");
                return;
            }

            

            const response = await api.get(
                `/applications/student/${user.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setApplications(response.data.applications || []);
        } catch (err) {
            console.error("Failed to fetch applications:", err);

            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem("studentToken");
localStorage.removeItem("studentUser");
                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load applications."
            );
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Shortlisted":
                return "status-shortlisted";
            case "Rejected":
                return "status-rejected";
            case "Pending":
            default:
                return "status-pending";
        }
    };

    const formatDate = (date) => {
        if (!date) return "N/A";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="applications-page">
                <div className="applications-loading">
                    Loading applications...
                </div>
            </div>
        );
    }

    return (
        <div className="applications-page">
            <div className="applications-container">

                <div className="applications-header">
                    <div>
                        <h1>My Applications</h1>
                        <p>
                            Track all the jobs you have applied for.
                        </p>
                    </div>

                    <button
                        className="browse-jobs-btn"
                        onClick={() => navigate("/jobs")}
                    >
                        Browse Jobs
                    </button>
                </div>

                {error && (
                    <div className="applications-error">
                        {error}
                    </div>
                )}

                {!error && applications.length === 0 && (
                    <div className="no-applications">
                        <div className="empty-icon">📄</div>
                        <h2>No Applications Yet</h2>
                        <p>
                            You have not applied for any jobs yet.
                        </p>

                        <button
                            className="browse-jobs-btn"
                            onClick={() => navigate("/jobs")}
                        >
                            Find Jobs
                        </button>
                    </div>
                )}

                {!error && applications.length > 0 && (
                    <div className="applications-list">
                        {applications.map((application) => (
                            <div
                                className="application-card"
                                key={application.id}
                            >
                                <div className="application-main">

                                    <div className="application-info">
                                        <h2>{application.title}</h2>

                                        <h3>
                                            {application.company_name}
                                        </h3>

                                        <p>
                                            📍 {application.location || "Not specified"}
                                        </p>

                                        <div className="job-meta">
                                            <span>
                                                💼 {application.job_type || "Not specified"}
                                            </span>

                                            <span>
                                                💰 {application.salary || "Not specified"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="application-status">
                                        <span
                                            className={`status-badge ${getStatusClass(
                                                application.status
                                            )}`}
                                        >
                                            {application.status}
                                        </span>

                                        <p>
                                            Applied on:{" "}
                                            <strong>
                                                {formatDate(application.applied_at)}
                                            </strong>
                                        </p>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default Applications;