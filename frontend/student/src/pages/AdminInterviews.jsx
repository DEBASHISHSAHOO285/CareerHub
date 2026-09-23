import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminInterviews.css";

const AdminInterviews = () => {
    const navigate = useNavigate();

    const [interviews, setInterviews] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedInterview, setSelectedInterview] = useState(null);

    const fetchInterviews = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("adminToken");

            if (!token) {
                navigate("/admin/login");
                return;
            }

            const response = await api.get("/admin/interviews", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setInterviews(response.data.interviews || []);
            } else {
                setError(
                    response.data.message ||
                    "Failed to load interviews."
                );
            }
        } catch (err) {
            console.error("Interview fetch error:", err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminUser");
                navigate("/admin/login");
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

    useEffect(() => {
        fetchInterviews();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");

        navigate("/admin/login");
    };

    let adminUser = {};

    try {
        adminUser = JSON.parse(
            localStorage.getItem("adminUser") || "{}"
        );
    } catch {
        adminUser = {};
    }

    const formatDate = (date) => {
        if (!date) return "—";

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return date;
        }

        return parsed.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const filteredInterviews = useMemo(() => {
        return interviews.filter((interview) => {
            const text = `
                ${interview.student_name || ""}
                ${interview.student_email || ""}
                ${interview.job_title || ""}
                ${interview.company_name || ""}
                ${interview.mode || ""}
                ${interview.status || ""}
            `.toLowerCase();

            const matchesSearch =
                text.includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "All" ||
                interview.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [interviews, search, statusFilter]);

    const scheduledCount = interviews.filter(
        (item) => item.status === "Scheduled"
    ).length;

    const completedCount = interviews.filter(
        (item) => item.status === "Completed"
    ).length;

    const cancelledCount = interviews.filter(
        (item) => item.status === "Cancelled"
    ).length;

    return (
        <div className="admin-layout">

            {/* SIDEBAR */}
            <aside className="admin-sidebar">

                <div className="admin-brand">
                    <div className="admin-brand-logo">
                        C
                    </div>

                    <div>
                        <h2>
                            Career<span>Hub</span>
                        </h2>
                        <p>Admin Panel</p>
                    </div>
                </div>

                <nav className="admin-nav">

                    <button
                        type="button"
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin/dashboard")
                        }
                    >
                        <span>📊</span>
                        <span>Dashboard</span>
                    </button>

                    <button
                        type="button"
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin/students")
                        }
                    >
                        <span>👨‍🎓</span>
                        <span>Students</span>
                    </button>

                    <button
                        type="button"
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin/companies")
                        }
                    >
                        <span>🏢</span>
                        <span>Companies</span>
                    </button>

                    <button
                        type="button"
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin/jobs")
                        }
                    >
                        <span>💼</span>
                        <span>Jobs</span>
                    </button>

                    <button
                        type="button"
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin/applications")
                        }
                    >
                        <span>📄</span>
                        <span>Applications</span>
                    </button>

                    <button
                        type="button"
                        className="admin-nav-item active"
                        onClick={() =>
                            navigate("/admin/interviews")
                        }
                    >
                        <span>🎤</span>
                        <span>Interviews</span>
                    </button>

                </nav>

                <div className="admin-sidebar-bottom">

                    <div className="admin-profile">

                        <div className="admin-avatar">
                            {adminUser.name
                                ? adminUser.name
                                      .charAt(0)
                                      .toUpperCase()
                                : "A"}
                        </div>

                        <div>
                            <strong>
                                {adminUser.name ||
                                    "CareerHub Admin"}
                            </strong>

                            <small>
                                Administrator
                            </small>
                        </div>

                    </div>

                    <button
                        className="admin-logout"
                        onClick={handleLogout}
                    >
                        🚪 Logout
                    </button>

                </div>

            </aside>

            {/* MAIN */}
            <main className="admin-main">

                <header className="admin-header">

                    <div>
                        <h1>Interviews</h1>

                        <p>
                            Manage and monitor student interviews
                        </p>
                    </div>

                    <button
                        className="refresh-btn"
                        onClick={fetchInterviews}
                    >
                        🔄 Refresh
                    </button>

                </header>

                {/* STAT CARDS */}
                <section className="interview-stats">

                    <div className="interview-stat-card">
                        <div className="stat-icon">🎤</div>
                        <div>
                            <span>Total Interviews</span>
                            <strong>{interviews.length}</strong>
                        </div>
                    </div>

                    <div className="interview-stat-card">
                        <div className="stat-icon">📅</div>
                        <div>
                            <span>Scheduled</span>
                            <strong>{scheduledCount}</strong>
                        </div>
                    </div>

                    <div className="interview-stat-card">
                        <div className="stat-icon">✅</div>
                        <div>
                            <span>Completed</span>
                            <strong>{completedCount}</strong>
                        </div>
                    </div>

                    <div className="interview-stat-card">
                        <div className="stat-icon">❌</div>
                        <div>
                            <span>Cancelled</span>
                            <strong>{cancelledCount}</strong>
                        </div>
                    </div>

                </section>

                {/* FILTER BAR */}
                <section className="interview-toolbar">

                    <div className="interview-search">
                        <span>🔍</span>

                        <input
                            type="text"
                            placeholder="Search student, job, company..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }
                    >
                        <option value="All">All Status</option>
                        <option value="Scheduled">
                            Scheduled
                        </option>
                        <option value="Completed">
                            Completed
                        </option>
                        <option value="Cancelled">
                            Cancelled
                        </option>
                    </select>

                </section>

                {/* CONTENT */}
                <section className="admin-card">

                    {loading ? (
                        <div className="admin-state">
                            <div className="admin-spinner"></div>
                            <p>Loading interviews...</p>
                        </div>
                    ) : error ? (
                        <div className="admin-state error-state">
                            <div className="state-icon">
                                ⚠️
                            </div>
                            <h3>Something went wrong</h3>
                            <p>{error}</p>

                            <button
                                className="retry-btn"
                                onClick={fetchInterviews}
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredInterviews.length === 0 ? (
                        <div className="admin-state">
                            <div className="state-icon">
                                🎤
                            </div>

                            <h3>
                                No interviews found
                            </h3>

                            <p>
                                There are no interviews matching
                                your search or filter.
                            </p>
                        </div>
                    ) : (
                        <div className="table-wrapper">

                            <table className="admin-table">

                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Job</th>
                                        <th>Company</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Mode</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {filteredInterviews.map(
                                        (interview) => (
                                            <tr
                                                key={
                                                    interview.id
                                                }
                                            >

                                                <td>
                                                    <div className="student-cell">

                                                        <div className="student-avatar">
                                                            {(
                                                                interview.student_name ||
                                                                "S"
                                                            )
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {interview.student_name ||
                                                                    "Unknown Student"}
                                                            </strong>

                                                            <small>
                                                                {interview.student_email ||
                                                                    "—"}
                                                            </small>
                                                        </div>

                                                    </div>
                                                </td>

                                                <td>
                                                    {interview.job_title ||
                                                        "—"}
                                                </td>

                                                <td>
                                                    {interview.company_name ||
                                                        "—"}
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        interview.interview_date
                                                    )}
                                                </td>

                                                <td>
                                                    {interview.interview_time ||
                                                        "—"}
                                                </td>

                                                <td>
                                                    <span className="mode-badge">
                                                        {interview.mode ||
                                                            "—"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`status-badge status-${(
                                                            interview.status ||
                                                            "unknown"
                                                        )
                                                            .toLowerCase()
                                                            .replace(
                                                                /\s+/g,
                                                                "-"
                                                            )}`}
                                                    >
                                                        {interview.status ||
                                                            "Unknown"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <button
                                                        className="view-btn"
                                                        onClick={() =>
                                                            setSelectedInterview(
                                                                interview
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>
                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </section>

            </main>

            {/* MODAL */}
            {selectedInterview && (
                <div
                    className="modal-overlay"
                    onClick={() =>
                        setSelectedInterview(null)
                    }
                >
                    <div
                        className="interview-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="modal-header">

                            <div>
                                <h2>
                                    Interview Details
                                </h2>

                                <p>
                                    Complete interview information
                                </p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={() =>
                                    setSelectedInterview(null)
                                }
                            >
                                ×
                            </button>

                        </div>

                        <div className="modal-body">

                            <div className="detail-grid">

                                <div className="detail-item">
                                    <span>Student</span>
                                    <strong>
                                        {selectedInterview.student_name ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="detail-item">
                                    <span>Email</span>
                                    <strong>
                                        {selectedInterview.student_email ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="detail-item">
                                    <span>Job</span>
                                    <strong>
                                        {selectedInterview.job_title ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="detail-item">
                                    <span>Company</span>
                                    <strong>
                                        {selectedInterview.company_name ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="detail-item">
                                    <span>Date</span>
                                    <strong>
                                        {formatDate(
                                            selectedInterview.interview_date
                                        )}
                                    </strong>
                                </div>

                                <div className="detail-item">
                                    <span>Time</span>
                                    <strong>
                                        {selectedInterview.interview_time ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="detail-item">
                                    <span>Mode</span>
                                    <strong>
                                        {selectedInterview.mode ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="detail-item">
                                    <span>Status</span>
                                    <strong>
                                        {selectedInterview.status ||
                                            "—"}
                                    </strong>
                                </div>

                            </div>

                            {selectedInterview.meeting_link && (
                                <div className="meeting-link-box">
                                    <span>
                                        Meeting Link
                                    </span>

                                    <a
                                        href={
                                            selectedInterview.meeting_link
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Join / Open Meeting →
                                    </a>
                                </div>
                            )}

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminInterviews;