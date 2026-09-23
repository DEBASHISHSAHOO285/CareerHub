import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
    const navigate = useNavigate();

    // =========================
    // DASHBOARD STATS
    // =========================
    const [stats, setStats] = useState({
        total_students: 0,
        total_companies: 0,
        total_jobs: 0,
        total_applications: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================
    // LOAD DASHBOARD
    // =========================
    useEffect(() => {
        const token = localStorage.getItem("adminToken");

        if (!token) {
            navigate("/admin/login");
            return;
        }

        fetchStats();
    }, [navigate]);

    // =========================
    // FETCH ADMIN STATS
    // =========================
    const fetchStats = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("adminToken");

            if (!token) {
                navigate("/admin/login");
                return;
            }

            const response = await api.get("/admin/dashboard", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                const data = response.data.stats || {};

                setStats({
                    total_students: Number(data.total_students) || 0,
                    total_companies: Number(data.total_companies) || 0,
                    total_jobs: Number(data.total_jobs) || 0,
                    total_applications:
                        Number(data.total_applications) || 0,
                });
            } else {
                setError(
                    response.data.message ||
                    "Failed to load dashboard data."
                );
            }
        } catch (error) {
            console.error(
                "Failed to load admin dashboard:",
                error
            );

            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminUser");

                navigate("/admin/login");
                return;
            }

            setError(
                error.response?.data?.message ||
                "Failed to load dashboard data."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // LOGOUT
    // =========================
    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");

        navigate("/");
    };

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
    // UI
    // =========================
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

                    {/* DASHBOARD */}
                    <button
                        type="button"
                        className="admin-nav-item active"
                        onClick={() =>
                            navigate("/admin/dashboard")
                        }
                    >
                        <span>📊</span>
                        <span>Dashboard</span>
                    </button>

                    {/* STUDENTS */}
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

                    {/* COMPANIES */}
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

                    {/* JOBS */}
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

                    {/* APPLICATIONS */}
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

                    {/* ADMIN USER */}
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

                    {/* LOGOUT */}
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
                        <h1>Dashboard</h1>

                        <p>
                            Welcome back,{" "}
                            {adminUser.name ||
                                "CareerHub Admin"}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="refresh-btn"
                        onClick={fetchStats}
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
                            Dashboard Error
                        </strong>

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={fetchStats}
                        >
                            Try Again
                        </button>

                    </div>
                )}

                {/* =========================
                    STAT CARDS
                ========================= */}

                <section className="admin-stats">

                    {/* STUDENTS */}
                    <div className="stat-card">

                        <div className="stat-icon">
                            👨‍🎓
                        </div>

                        <div>
                            <p>Total Students</p>

                            <h2>
                                {loading
                                    ? "—"
                                    : stats.total_students}
                            </h2>
                        </div>

                    </div>

                    {/* COMPANIES */}
                    <div className="stat-card">

                        <div className="stat-icon">
                            🏢
                        </div>

                        <div>
                            <p>Total Companies</p>

                            <h2>
                                {loading
                                    ? "—"
                                    : stats.total_companies}
                            </h2>
                        </div>

                    </div>

                    {/* JOBS */}
                    <div className="stat-card">

                        <div className="stat-icon">
                            💼
                        </div>

                        <div>
                            <p>Total Jobs</p>

                            <h2>
                                {loading
                                    ? "—"
                                    : stats.total_jobs}
                            </h2>
                        </div>

                    </div>

                    {/* APPLICATIONS */}
                    <div className="stat-card">

                        <div className="stat-icon">
                            📋
                        </div>

                        <div>
                            <p>Total Applications</p>

                            <h2>
                                {loading
                                    ? "—"
                                    : stats.total_applications}
                            </h2>
                        </div>

                    </div>

                </section>

                {/* =========================
                    QUICK MANAGEMENT
                ========================= */}

                <section className="admin-section">

                    <div className="section-heading">

                        <div>
                            <h2>
                                Quick Management
                            </h2>

                            <p>
                                Manage CareerHub from one place.
                            </p>
                        </div>

                    </div>

                    <div className="quick-grid">

                        {/* STUDENTS */}
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/admin/students")
                            }
                        >
                            <span>👨‍🎓</span>

                            <div>
                                <strong>
                                    Manage Students
                                </strong>

                                <small>
                                    View and manage registered
                                    students
                                </small>
                            </div>
                        </button>

                        {/* COMPANIES */}
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/admin/companies")
                            }
                        >
                            <span>🏢</span>

                            <div>
                                <strong>
                                    Manage Companies
                                </strong>

                                <small>
                                    View registered companies
                                </small>
                            </div>
                        </button>

                        {/* JOBS */}
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/admin/jobs")
                            }
                        >
                            <span>💼</span>

                            <div>
                                <strong>
                                    Manage Jobs
                                </strong>

                                <small>
                                    Review posted jobs
                                </small>
                            </div>
                        </button>

                        {/* APPLICATIONS */}
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/admin/applications"
                                )
                            }
                        >
                            <span>📋</span>

                            <div>
                                <strong>
                                    Manage Applications
                                </strong>

                                <small>
                                    Review student applications
                                </small>
                            </div>
                        </button>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default AdminDashboard;