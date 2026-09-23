import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./CompanyDashboard.css";

function CompanyDashboard() {
    const navigate = useNavigate();

    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [dashboardStats, setDashboardStats] = useState({
    total_jobs: 0,
    total_applications: 0,
    shortlisted: 0,
});

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const storedCompany =
                localStorage.getItem("companyUser");

            const token =
                localStorage.getItem("companyToken");

            if (!storedCompany || !token) {
                navigate("/company/login");
                return;
            }

            let companyUser;

            try {
                companyUser = JSON.parse(storedCompany);
            } catch (parseError) {
                localStorage.removeItem("companyToken");
                localStorage.removeItem("companyUser");
                navigate("/company/login");
                return;
            }

            setCompany(companyUser);

            const dashboardResponse = await api.get(
    `/dashboard/company/${companyUser.id}`,
    {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
);

if (dashboardResponse.data.success) {
    setDashboardStats(
        dashboardResponse.data.dashboard.statistics
    );
}

            const response = await api.get("/jobs");

            if (response.data.success) {
                const allJobs = response.data.jobs || [];

                const companyJobs = allJobs.filter(
                    (job) =>
                        Number(job.company_id) ===
                        Number(companyUser.id)
                );

                setJobs(companyJobs);
            } else {
                setError(
                    response.data.message ||
                    "Unable to load jobs."
                );
            }
        } catch (err) {
            console.error("Company dashboard error:", err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                localStorage.removeItem("companyToken");
                localStorage.removeItem("companyUser");

                navigate("/company/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Unable to load dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("companyToken");
        localStorage.removeItem("companyUser");

        navigate("/");
    };

    const handleViewJob = (job) => {
    navigate(`/company/jobs/${job.id}`, {
        state: {
            job,
        },
    });
};

    const totalJobs = dashboardStats.total_jobs;
    const totalApplications = dashboardStats.total_applications;
    const totalShortlisted = dashboardStats.shortlisted;

    if (loading) {
        return (
            <div className="company-dashboard-loading">
                <div className="company-spinner"></div>
                <p>Loading Company Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="company-dashboard">

            {/* =========================
                SIDEBAR
            ========================== */}

            <aside className="company-sidebar">

                <div className="company-sidebar-brand">

                    <div className="company-brand-logo">
                        C
                    </div>

                    <div>
                        <h2>
                            Career<span>Hub</span>
                        </h2>

                        <p>Company Portal</p>
                    </div>

                </div>

                <nav className="company-nav">

                    <button
                        className="company-nav-item active"
                        onClick={() =>
                            navigate("/company/dashboard")
                        }
                    >
                        <span>⌂</span>
                        Dashboard
                    </button>

                    <button
                        className="company-nav-item"
                        onClick={() =>
                            navigate("/company/jobs")
                        }
                    >
                        <span>💼</span>
                        My Jobs
                    </button>

                    <button
                        className="company-nav-item"
                        onClick={() =>
                            navigate("/company/post-job")
                        }
                    >
                        <span>＋</span>
                        Post New Job
                    </button>

                    <button
    className="company-nav-item"
    onClick={() => {
        if (jobs.length > 0) {
            navigate(
                `/company/jobs/${jobs[0].id}/applicants`
            );
        } else {
            navigate("/company/jobs");
        }
    }}
>
    <span>👥</span>
    Applicants
</button>

                    <button
                        className="company-nav-item"
                        onClick={() =>
                            navigate("/company/profile")
                        }
                    >
                        <span>🏢</span>
                        Company Profile
                    </button>

                    <button
    className="company-nav-item"
    onClick={() =>
        navigate("/company/interviews")
    }
>
    <span>🎤</span>
    Interviews
</button>

                </nav>

                <div className="company-sidebar-bottom">

                    <button
                        className="company-logout"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </div>

            </aside>


            {/* =========================
                MAIN
            ========================== */}

            <main className="company-main">

                {/* TOPBAR */}

                <header className="company-topbar">

                    <div>

                        <p className="company-page-label">
                            COMPANY DASHBOARD
                        </p>

                        <h1>
                            Dashboard
                        </h1>

                    </div>

                    <div className="company-user-area">

                        <div className="company-user-info">

                            <strong>
                                {company?.company_name ||
                                    "Company"}
                            </strong>

                            <span>
                                {company?.email || ""}
                            </span>

                        </div>

                        <div className="company-user-avatar">
                            {company?.company_name
                                ?.charAt(0)
                                ?.toUpperCase() || "C"}
                        </div>

                    </div>

                </header>


                {/* CONTENT */}

                <div className="company-content">

                    {/* =========================
                        WELCOME
                    ========================== */}

                    <section className="company-welcome">

                        <div>

                            <span className="company-welcome-badge">
                                CAREERHUB COMPANY PORTAL
                            </span>

                            <h2>
                                Welcome back,
                                <span>
                                    {" "}
                                    {company?.company_name ||
                                        "Company"}
                                </span>{" "}
                                👋
                            </h2>

                            <p>
                                Manage your job postings and
                                connect with talented students.
                            </p>

                        </div>

                        <button
                            className="company-post-btn"
                            onClick={() =>
                                navigate("/company/post-job")
                            }
                        >
                            + Post New Job
                        </button>

                    </section>


                    {/* =========================
                        ERROR
                    ========================== */}

                    {error && (
                        <div className="company-error">

                            <span>⚠️</span>

                            <p>{error}</p>

                            <button
                                onClick={loadDashboard}
                            >
                                Retry
                            </button>

                        </div>
                    )}


                    {/* =========================
                        STATISTICS
                    ========================== */}

                    <section className="company-stats">

                        <div className="company-stat-card">

                            <div className="company-stat-icon jobs-icon">
                                💼
                            </div>

                            <div>
                                <span>
                                    Total Jobs
                                </span>

                                <strong>
                                    {totalJobs}
                                </strong>
                            </div>

                        </div>


                        <div className="company-stat-card">

                            <div className="company-stat-icon applications-icon">
                                📄
                            </div>

                            <div>
                                <span>
                                    Applications
                                </span>

                                <strong>
                                    {totalApplications}
                                </strong>
                            </div>

                        </div>


                        <div className="company-stat-card">

                            <div className="company-stat-icon shortlisted-icon">
                                ⭐
                            </div>

                            <div>
                                <span>
                                    Shortlisted
                                </span>

                                <strong>
                                    {totalShortlisted}
                                </strong>
                            </div>

                        </div>

                    </section>


                    {/* =========================
                        RECENT JOBS
                    ========================== */}

                    <section className="company-jobs-section">

                        <div className="company-section-header">

                            <div>
                                <p>
                                    YOUR JOB POSTINGS
                                </p>

                                <h2>
                                    Recent Jobs
                                </h2>
                            </div>

                            <button
                                className="company-view-all"
                                onClick={() =>
                                    navigate("/company/jobs")
                                }
                            >
                                View All →
                            </button>

                        </div>


                        {jobs.length === 0 ? (

                            <div className="company-empty-jobs">

                                <div className="empty-job-icon">
                                    💼
                                </div>

                                <h3>
                                    No jobs posted yet
                                </h3>

                                <p>
                                    Start hiring talented students
                                    by posting your first job.
                                </p>

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/company/post-job"
                                        )
                                    }
                                >
                                    + Post Your First Job
                                </button>

                            </div>

                        ) : (

                            <div className="company-jobs-list">

                                {jobs
                                    .slice(0, 5)
                                    .map((job) => (

                                        <div
                                            className="company-job-row"
                                            key={job.id}
                                        >

                                            <div className="company-job-main">

                                                <div className="company-job-logo">
                                                    {job.company_name
                                                        ?.charAt(0)
                                                        ?.toUpperCase() ||
                                                        "C"}
                                                </div>

                                                <div>

                                                    <h3>
                                                        {job.title}
                                                    </h3>

                                                    <p>
                                                        {job.company_name ||
                                                            company?.company_name ||
                                                            "Company"}
                                                    </p>

                                                </div>

                                            </div>


                                            <div className="company-job-location">

                                                <span>
                                                    📍
                                                </span>

                                                {job.location ||
                                                    "Remote"}

                                            </div>


                                            <div className="company-job-type">

                                                <span className="company-type-badge">
                                                    {job.job_type ||
                                                        "Full Time"}
                                                </span>

                                            </div>


                                            <div className="company-job-deadline">

                                                <small>
                                                    Deadline
                                                </small>

                                                <strong>
                                                    {job.deadline ||
                                                        "Not specified"}
                                                </strong>

                                            </div>


                                            <button
                                                className="company-view-btn"
                                                onClick={() =>
                                                    handleViewJob(
                                                        job
                                                    )
                                                }
                                            >
                                                View →
                                            </button>

                                        </div>

                                    ))}

                            </div>

                        )}

                    </section>


                    {/* =========================
                        QUICK ACTIONS
                    ========================== */}

                    <section className="company-quick-section">

                        <div className="company-section-header">

                            <div>
                                <p>
                                    QUICK ACTIONS
                                </p>

                                <h2>
                                    Manage Your Company
                                </h2>
                            </div>

                        </div>


                        <div className="company-quick-grid">

                            <button
                                className="company-quick-card"
                                onClick={() =>
                                    navigate(
                                        "/company/post-job"
                                    )
                                }
                            >
                                <div>
                                    📝
                                </div>

                                <h3>
                                    Post a Job
                                </h3>

                                <p>
                                    Create a new job opportunity
                                    for students.
                                </p>

                                <span>
                                    Get Started →
                                </span>
                            </button>


                            <button
                                className="company-quick-card"
                                onClick={() =>
                                    navigate(
                                        "/company/jobs"
                                    )
                                }
                            >
                                <div>
                                    💼
                                </div>

                                <h3>
                                    Manage Jobs
                                </h3>

                                <p>
                                    View and manage your existing
                                    job postings.
                                </p>

                                <span>
                                    Manage Jobs →
                                </span>
                            </button>


                            <button 
    className="company-quick-card" 
    onClick={() => {
        if (jobs.length > 0) {
            navigate(
                `/company/jobs/${jobs[0].id}/applicants`
            );
        } else {
            navigate("/company/jobs");
        }
    }} 
>
                                <div>
                                    👥
                                </div>

                                <h3>
                                    View Applicants
                                </h3>

                                <p>
                                    Review students who applied
                                    to your jobs.
                                </p>

                                <span>
                                    View Applicants →
                                </span>
                            </button>


                            <button
                                className="company-quick-card"
                                onClick={() =>
                                    navigate(
                                        "/company/profile"
                                    )
                                }
                            >
                                <div>
                                    🏢
                                </div>

                                <h3>
                                    Company Profile
                                </h3>

                                <p>
                                    Update your company information
                                    and details.
                                </p>

                                <span>
                                    Edit Profile →
                                </span>
                            </button>

                        </div>

                    </section>

                </div>

            </main>

        </div>
    );
}

export default CompanyDashboard;