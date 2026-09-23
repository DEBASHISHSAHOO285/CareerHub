import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminJobs.css";

function AdminJobs() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedJob, setSelectedJob] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // =========================
    // LOAD JOBS
    // =========================
    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("adminToken");

            if (!token) {
                navigate("/admin/login");
                return;
            }

            const response = await api.get("/admin/jobs", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setJobs(response.data.jobs || []);
            } else {
                setError(
                    response.data.message ||
                    "Failed to load jobs."
                );
            }
        } catch (err) {
            console.error("Failed to load jobs:", err);

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
                "Failed to load jobs."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // DELETE JOB
    // =========================
    const handleDeleteJob = async (jobId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this job?\n\nRelated saved jobs and applications may also be removed."
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(jobId);

            const token = localStorage.getItem("adminToken");

            if (!token) {
                navigate("/admin/login");
                return;
            }

            const response = await api.delete(
                `/admin/jobs/${jobId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setJobs((previousJobs) =>
                    previousJobs.filter(
                        (job) =>
                            Number(job.id) !==
                            Number(jobId)
                    )
                );

                if (
                    selectedJob &&
                    Number(selectedJob.id) === Number(jobId)
                ) {
                    setSelectedJob(null);
                }
            } else {
                setError(
                    response.data.message ||
                    "Failed to delete job."
                );
            }
        } catch (err) {
            console.error("Delete job error:", err);

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
                "Failed to delete job."
            );
        } finally {
            setDeletingId(null);
        }
    };

    // =========================
    // FILTER JOBS
    // =========================
    const filteredJobs = jobs.filter((job) => {
        const searchText = search.trim().toLowerCase();

        if (!searchText) {
            return true;
        }

        return (
            job.title
                ?.toLowerCase()
                .includes(searchText) ||
            job.company_name
                ?.toLowerCase()
                .includes(searchText) ||
            job.location
                ?.toLowerCase()
                .includes(searchText) ||
            job.job_type
                ?.toLowerCase()
                .includes(searchText) ||
            job.skills
                ?.toLowerCase()
                .includes(searchText) ||
            job.description
                ?.toLowerCase()
                .includes(searchText)
        );
    });

    // =========================
    // ADMIN USER
    // =========================
    let adminUser = {};

    try {
        adminUser = JSON.parse(
            localStorage.getItem("adminUser") || "{}"
        );
    } catch {
        adminUser = {};
    }

    // =========================
    // LOGOUT
    // =========================
    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");

        navigate("/admin/login");
    };

    return (
        <div className="admin-layout">

            {/* =========================
                SIDEBAR
            ========================= */}

            <aside className="admin-sidebar">

                {/* BRAND */}
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

                {/* NAVIGATION */}
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
                        className="admin-nav-item active"
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
                        <span>📋</span>
                        <span>Applications</span>
                    </button>

                    <button
    type="button"
    className="admin-nav-item"
    onClick={() =>
        navigate("/admin/interviews")
    }
>
    <span>🎤</span>
    <span>Interviews</span>
</button>

                </nav>

                {/* SIDEBAR BOTTOM */}
                <div className="admin-sidebar-bottom">

                    <div className="admin-user">

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
                        type="button"
                        className="admin-logout"
                        onClick={handleLogout}
                    >
                        🚪 Logout
                    </button>

                </div>

            </aside>

            {/* =========================
                MAIN CONTENT
            ========================= */}

            <main className="admin-main">

                {/* HEADER */}
                <header className="admin-header">

                    <div>
                        <h1>Jobs</h1>

                        <p>
                            Manage all jobs posted on CareerHub.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="refresh-btn"
                        onClick={loadJobs}
                        disabled={loading}
                    >
                        {loading
                            ? "Loading..."
                            : "↻ Refresh"}
                    </button>

                </header>

                {/* ERROR */}
                {error && (
                    <div className="admin-error">

                        <strong>
                            Job Management Error
                        </strong>

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={loadJobs}
                        >
                            Try Again
                        </button>

                    </div>
                )}

                {/* =========================
                    JOB SECTION
                ========================= */}

                <section className="admin-jobs-section">

                    {/* TOOLBAR */}
                    <div className="jobs-toolbar">

                        <div>
                            <h2>
                                Posted Jobs
                            </h2>

                            <p>
                                {jobs.length} job
                                {jobs.length !== 1
                                    ? "s"
                                    : ""}{" "}
                                posted
                            </p>
                        </div>

                        <div className="job-search-box">

                            <span>🔎</span>

                            <input
                                type="text"
                                placeholder="Search jobs..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    </div>

                    {/* CONTENT */}
                    {loading ? (
                        <div className="jobs-state">

                            <div className="jobs-spinner"></div>

                            <p>
                                Loading jobs...
                            </p>

                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="jobs-state">

                            <div className="jobs-empty-icon">
                                💼
                            </div>

                            <h3>
                                {search
                                    ? "No jobs found"
                                    : "No jobs posted"}
                            </h3>

                            <p>
                                {search
                                    ? "Try a different search term."
                                    : "Posted jobs will appear here."}
                            </p>

                        </div>
                    ) : (
                        <div className="jobs-table-wrapper">

                            <table className="jobs-table">

                                <thead>
                                    <tr>
                                        <th>Job</th>
                                        <th>Company</th>
                                        <th>Location</th>
                                        <th>Type</th>
                                        <th>Salary</th>
                                        <th>Deadline</th>
                                        <th>Posted</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {filteredJobs.map(
                                        (job) => (
                                            <tr key={job.id}>

                                                {/* JOB */}
                                                <td>
                                                    <div className="job-name-cell">

                                                        <div className="job-avatar">
                                                            💼
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {job.title ||
                                                                    "Untitled Job"}
                                                            </strong>

                                                            <small>
                                                                ID: #
                                                                {job.id}
                                                            </small>
                                                        </div>

                                                    </div>
                                                </td>

                                                {/* COMPANY */}
                                                <td>
                                                    <span className="company-job-name">
                                                        {job.company_name ||
                                                            "—"}
                                                    </span>
                                                </td>

                                                {/* LOCATION */}
                                                <td>
                                                    {job.location ||
                                                        "Remote"}
                                                </td>

                                                {/* TYPE */}
                                                <td>
                                                    <span className="job-type-badge">
                                                        {job.job_type ||
                                                            "—"}
                                                    </span>
                                                </td>

                                                {/* SALARY */}
                                                <td>
                                                    {job.salary
                                                        ? `₹${job.salary}`
                                                        : "—"}
                                                </td>

                                                {/* DEADLINE */}
                                                <td>
                                                    {job.deadline
                                                        ? new Date(
                                                              job.deadline
                                                          ).toLocaleDateString()
                                                        : "—"}
                                                </td>

                                                {/* CREATED */}
                                                <td>
                                                    {job.created_at
                                                        ? new Date(
                                                              job.created_at
                                                          ).toLocaleDateString()
                                                        : "—"}
                                                </td>

                                                {/* ACTIONS */}
                                                <td>

                                                    <div className="job-actions">

                                                        <button
                                                            type="button"
                                                            className="view-job-btn"
                                                            onClick={() =>
                                                                setSelectedJob(
                                                                    job
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="delete-job-btn"
                                                            disabled={
                                                                deletingId ===
                                                                job.id
                                                            }
                                                            onClick={() =>
                                                                handleDeleteJob(
                                                                    job.id
                                                                )
                                                            }
                                                        >
                                                            {deletingId ===
                                                            job.id
                                                                ? "Deleting..."
                                                                : "Delete"}
                                                        </button>

                                                    </div>

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

            {/* =========================
                JOB DETAILS MODAL
            ========================= */}

            {selectedJob && (
                <div
                    className="job-modal-overlay"
                    onClick={() =>
                        setSelectedJob(null)
                    }
                >
                    <div
                        className="job-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="job-modal-header">

                            <div className="job-modal-title">

                                <div className="job-modal-avatar">
                                    💼
                                </div>

                                <div>
                                    <span>
                                        JOB DETAILS
                                    </span>

                                    <h2>
                                        {selectedJob.title ||
                                            "Job"}
                                    </h2>
                                </div>

                            </div>

                            <button
                                type="button"
                                className="job-modal-close"
                                onClick={() =>
                                    setSelectedJob(null)
                                }
                            >
                                ×
                            </button>

                        </div>

                        <div className="job-modal-body">

                            <div className="job-detail-grid">

                                <div className="job-detail-item">
                                    <span>Job Title</span>

                                    <strong>
                                        {selectedJob.title ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="job-detail-item">
                                    <span>Company</span>

                                    <strong>
                                        {selectedJob.company_name ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="job-detail-item">
                                    <span>Location</span>

                                    <strong>
                                        {selectedJob.location ||
                                            "Remote"}
                                    </strong>
                                </div>

                                <div className="job-detail-item">
                                    <span>Job Type</span>

                                    <strong>
                                        {selectedJob.job_type ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="job-detail-item">
                                    <span>Salary</span>

                                    <strong>
                                        {selectedJob.salary
                                            ? `₹${selectedJob.salary}`
                                            : "—"}
                                    </strong>
                                </div>

                                <div className="job-detail-item">
                                    <span>Deadline</span>

                                    <strong>
                                        {selectedJob.deadline
                                            ? new Date(
                                                  selectedJob.deadline
                                              ).toLocaleDateString()
                                            : "—"}
                                    </strong>
                                </div>

                            </div>

                            <div className="job-detail-full">

                                <span>
                                    Description
                                </span>

                                <p>
                                    {selectedJob.description ||
                                        "No job description available."}
                                </p>

                            </div>

                            <div className="job-detail-full">

                                <span>
                                    Required Skills
                                </span>

                                <p>
                                    {selectedJob.skills ||
                                        "No skills specified."}
                                </p>

                            </div>

                        </div>

                        <div className="job-modal-footer">

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedJob(null)
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminJobs;