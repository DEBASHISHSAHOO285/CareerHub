import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminApplications.css";

function AdminApplications() {
    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedApplication, setSelectedApplication] =
        useState(null);

    // =========================
    // LOAD APPLICATIONS
    // =========================
    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("adminToken");

            if (!token) {
                navigate("/admin/login");
                return;
            }

            const response = await api.get(
                "/admin/applications",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setApplications(
                    response.data.applications || []
                );
            } else {
                setError(
                    response.data.message ||
                    "Failed to load applications."
                );
            }
        } catch (err) {
            console.error(
                "Failed to load applications:",
                err
            );

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
                "Failed to load applications."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // GET STATUS CLASS
    // =========================
    const getStatusClass = (status) => {
        switch (
            String(status || "")
                .toLowerCase()
                .trim()
        ) {
            case "shortlisted":
                return "application-status shortlisted";

            case "rejected":
                return "application-status rejected";

            case "pending":
                return "application-status pending";

            case "interview scheduled":
                return "application-status interview";

            default:
                return "application-status default";
        }
    };

    // =========================
    // FILTER APPLICATIONS
    // =========================
    const filteredApplications =
        applications.filter((application) => {
            const searchText = search
                .trim()
                .toLowerCase();

            const matchesSearch =
                !searchText ||
                application.student_name
                    ?.toLowerCase()
                    .includes(searchText) ||
                application.student_email
                    ?.toLowerCase()
                    .includes(searchText) ||
                application.job_title
                    ?.toLowerCase()
                    .includes(searchText) ||
                application.company_name
                    ?.toLowerCase()
                    .includes(searchText);

            const matchesStatus =
                statusFilter === "All" ||
                String(application.status || "")
                    .toLowerCase() ===
                    statusFilter.toLowerCase();

            return (
                matchesSearch &&
                matchesStatus
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

    // =========================
    // STATUS COUNTS
    // =========================
    const pendingCount = applications.filter(
        (item) =>
            String(item.status || "").toLowerCase() ===
            "pending"
    ).length;

    const shortlistedCount = applications.filter(
        (item) =>
            String(item.status || "").toLowerCase() ===
            "shortlisted"
    ).length;

    const rejectedCount = applications.filter(
        (item) =>
            String(item.status || "").toLowerCase() ===
            "rejected"
    ).length;

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
                        className="admin-nav-item active"
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
                        <h1>Applications</h1>

                        <p>
                            Review all student applications.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="refresh-btn"
                        onClick={loadApplications}
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
                            Application Management Error
                        </strong>

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={loadApplications}
                        >
                            Try Again
                        </button>

                    </div>
                )}

                {/* =========================
                    APPLICATION SUMMARY
                ========================= */}

                <section className="application-summary">

                    <div className="application-summary-card">
                        <span>Total Applications</span>
                        <strong>
                            {applications.length}
                        </strong>
                    </div>

                    <div className="application-summary-card pending-card">
                        <span>Pending</span>
                        <strong>
                            {pendingCount}
                        </strong>
                    </div>

                    <div className="application-summary-card shortlisted-card">
                        <span>Shortlisted</span>
                        <strong>
                            {shortlistedCount}
                        </strong>
                    </div>

                    <div className="application-summary-card rejected-card">
                        <span>Rejected</span>
                        <strong>
                            {rejectedCount}
                        </strong>
                    </div>

                </section>

                {/* =========================
                    APPLICATION SECTION
                ========================= */}

                <section className="admin-applications-section">

                    {/* TOOLBAR */}
                    <div className="applications-toolbar">

                        <div>
                            <h2>
                                All Applications
                            </h2>

                            <p>
                                {filteredApplications.length}{" "}
                                application
                                {filteredApplications.length !==
                                1
                                    ? "s"
                                    : ""}{" "}
                                shown
                            </p>
                        </div>

                        <div className="applications-filters">

                            {/* SEARCH */}
                            <div className="application-search-box">

                                <span>🔎</span>

                                <input
                                    type="text"
                                    placeholder="Search student, job or company..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                            {/* STATUS */}
                            <select
                                className="application-status-filter"
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="All">
                                    All Status
                                </option>

                                <option value="Pending">
                                    Pending
                                </option>

                                <option value="Shortlisted">
                                    Shortlisted
                                </option>

                                <option value="Rejected">
                                    Rejected
                                </option>

                                <option value="Interview Scheduled">
                                    Interview Scheduled
                                </option>
                            </select>

                        </div>

                    </div>

                    {/* CONTENT */}
                    {loading ? (
                        <div className="applications-state">

                            <div className="applications-spinner"></div>

                            <p>
                                Loading applications...
                            </p>

                        </div>
                    ) : filteredApplications.length ===
                      0 ? (
                        <div className="applications-state">

                            <div className="applications-empty-icon">
                                📋
                            </div>

                            <h3>
                                {search ||
                                statusFilter !== "All"
                                    ? "No applications found"
                                    : "No applications yet"}
                            </h3>

                            <p>
                                {search ||
                                statusFilter !== "All"
                                    ? "Try changing your search or filter."
                                    : "Student applications will appear here."}
                            </p>

                        </div>
                    ) : (
                        <div className="applications-table-wrapper">

                            <table className="applications-table">

                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Job</th>
                                        <th>Company</th>
                                        <th>Status</th>
                                        <th>Applied On</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {filteredApplications.map(
                                        (application) => (
                                            <tr
                                                key={
                                                    application.id
                                                }
                                            >

                                                {/* STUDENT */}
                                                <td>
                                                    <div className="application-student-cell">

                                                        <div className="application-avatar">
                                                            {application.student_name
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                ?.toUpperCase() ||
                                                                "S"}
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {application.student_name ||
                                                                    "Unknown Student"}
                                                            </strong>

                                                            <small>
                                                                {application.student_email ||
                                                                    "—"}
                                                            </small>
                                                        </div>

                                                    </div>
                                                </td>

                                                {/* JOB */}
                                                <td>
                                                    <strong className="application-job-title">
                                                        {application.job_title ||
                                                            "Unknown Job"}
                                                    </strong>
                                                </td>

                                                {/* COMPANY */}
                                                <td>
                                                    {application.company_name ||
                                                        "—"}
                                                </td>

                                                {/* STATUS */}
                                                <td>
                                                    <span
                                                        className={getStatusClass(
                                                            application.status
                                                        )}
                                                    >
                                                        {application.status ||
                                                            "Unknown"}
                                                    </span>
                                                </td>

                                                {/* DATE */}
                                                <td>
                                                    {application.applied_at
                                                        ? new Date(
                                                              application.applied_at
                                                          ).toLocaleDateString()
                                                        : "—"}
                                                </td>

                                                {/* ACTION */}
                                                <td>

                                                    <button
                                                        type="button"
                                                        className="view-application-btn"
                                                        onClick={() =>
                                                            setSelectedApplication(
                                                                application
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

            {/* =========================
                APPLICATION DETAILS MODAL
            ========================= */}

            {selectedApplication && (
                <div
                    className="application-modal-overlay"
                    onClick={() =>
                        setSelectedApplication(null)
                    }
                >
                    <div
                        className="application-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="application-modal-header">

                            <div>
                                <span>
                                    APPLICATION DETAILS
                                </span>

                                <h2>
                                    Application #
                                    {selectedApplication.id}
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="application-modal-close"
                                onClick={() =>
                                    setSelectedApplication(
                                        null
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>

                        <div className="application-modal-body">

                            <div className="application-detail-grid">

                                <div className="application-detail-item">
                                    <span>
                                        Student
                                    </span>

                                    <strong>
                                        {selectedApplication.student_name ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="application-detail-item">
                                    <span>
                                        Student Email
                                    </span>

                                    <strong>
                                        {selectedApplication.student_email ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="application-detail-item">
                                    <span>
                                        Job
                                    </span>

                                    <strong>
                                        {selectedApplication.job_title ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="application-detail-item">
                                    <span>
                                        Company
                                    </span>

                                    <strong>
                                        {selectedApplication.company_name ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="application-detail-item">
                                    <span>
                                        Status
                                    </span>

                                    <strong>
                                        <span
                                            className={getStatusClass(
                                                selectedApplication.status
                                            )}
                                        >
                                            {selectedApplication.status ||
                                                "Unknown"}
                                        </span>
                                    </strong>
                                </div>

                                <div className="application-detail-item">
                                    <span>
                                        Applied On
                                    </span>

                                    <strong>
                                        {selectedApplication.applied_at
                                            ? new Date(
                                                  selectedApplication.applied_at
                                              ).toLocaleString()
                                            : "—"}
                                    </strong>
                                </div>

                            </div>

                        </div>

                        <div className="application-modal-footer">

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedApplication(
                                        null
                                    )
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

export default AdminApplications;