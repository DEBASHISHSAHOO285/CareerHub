import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const user = JSON.parse(
                    localStorage.getItem("studentUser")
                );

                if (!user) {
                    navigate("/");
                    return;
                }

                const response = await api.get(
                    `/dashboard/student/${user.id}`
                );

                if (response.data.success) {
                    setDashboard(response.data.dashboard);
                }
            } catch (err) {
                console.error(err);

                if (err.response?.status === 401) {
                    localStorage.removeItem("studentToken");
                    localStorage.removeItem("studentUser");
                    navigate("/");
                    return;
                }

                setError(
                    err.response?.data?.message ||
                    "Failed to load dashboard"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [navigate]);

    const closeMenu = () => {
        setMenuOpen(false);
    };

    const handleLogout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentUser");

    navigate("/");
};

    const goToPage = (path) => {
        closeMenu();
        navigate(path);
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-box">
                    <div className="loading-spinner"></div>
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <div>
                    <h2>Something went wrong</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="dashboard-error">
                <div>
                    <h2>No dashboard data</h2>
                    <p>Unable to load your dashboard.</p>
                </div>
            </div>
        );
    }

    const {
        student,
        statistics,
        recent_applications,
        upcoming_interviews,
    } = dashboard;

    const firstLetter =
        student.name?.charAt(0).toUpperCase() || "S";

    return (
        <div className="dashboard-page">

            {/* =================================
                MOBILE TOPBAR
            ================================= */}

            <header className="mobile-topbar">

                <button
                    className="hamburger-btn"
                    onClick={() => setMenuOpen(true)}
                    aria-label="Open menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <div className="mobile-brand">
                    Career<span>Hub</span>
                </div>

            </header>


            {/* =================================
                MOBILE OVERLAY
            ================================= */}

            {menuOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeMenu}
                ></div>
            )}


            {/* =================================
                SIDEBAR
            ================================= */}

            <aside
                className={`dashboard-sidebar ${
                    menuOpen ? "mobile-open" : ""
                }`}
            >

                <div className="sidebar-brand">
                    <div className="brand">
                        Career<span>Hub</span>
                    </div>

                    <button
                        className="mobile-close"
                        onClick={closeMenu}
                        aria-label="Close menu"
                    >
                        ✕
                    </button>
                </div>


                <nav className="sidebar-navigation">

                    <button
                        className="sidebar-link active"
                        onClick={closeMenu}
                    >
                        <span className="nav-icon">⌂</span>
                        <span>Dashboard</span>
                    </button>

                    <button
                        className="sidebar-link"
                        onClick={() => goToPage("/jobs")}
                    >
                        <span className="nav-icon">▣</span>
                        <span>Find Jobs</span>
                    </button>

                    <button
                        className="sidebar-link"
                        onClick={() => goToPage("/saved-jobs")}
                    >
                        <span className="nav-icon">♡</span>
                        <span>Saved Jobs</span>
                    </button>

                    <button
                        className="sidebar-link"
                        onClick={() => goToPage("/applications")}
                    >
                        <span className="nav-icon">▤</span>
                        <span>Applications</span>
                    </button>

                    <button
                        className="sidebar-link"
                        onClick={() => goToPage("/interviews")}
                    >
                        <span className="nav-icon">◷</span>
                        <span>Interviews</span>
                    </button>

                    <button
                        className="sidebar-link"
                        onClick={() => goToPage("/profile")}
                    >
                        <span className="nav-icon">◎</span>
                        <span>My Profile</span>
                    </button>

                </nav>


                <div className="sidebar-bottom">

                    <button
                        className="sidebar-link logout-link"
                        onClick={handleLogout}
                    >
                        <span className="nav-icon">↪</span>
                        <span>Logout</span>
                    </button>

                </div>

            </aside>


            {/* =================================
                MAIN CONTENT
            ================================= */}

            <main className="dashboard-main">

                {/* HEADER */}

                <header className="dashboard-header">

                    <div className="header-title">

                        <p className="welcome-small">
                            STUDENT DASHBOARD
                        </p>

                        <h1>
                            Good to see you,{" "}
                            {student.name?.split(" ")[0]} 👋
                        </h1>

                        <p className="header-description">
                            Here's what's happening with your career journey.
                        </p>

                    </div>


                    <div className="profile-mini">

                        <div className="profile-avatar">
                            {firstLetter}
                        </div>

                        <div className="profile-info">

                            <strong>
                                {student.name}
                            </strong>

                            <span>
                                {student.email}
                            </span>

                        </div>

                    </div>

                </header>


                {/* =================================
                    STATISTICS
                ================================= */}

                <section className="stats-grid">

                    <div className="stat-card">

                        <div className="stat-top">

                            <div>
                                <span className="stat-label">
                                    Applications
                                </span>

                                <h2>
                                    {statistics.total_applications}
                                </h2>
                            </div>

                            <div className="stat-icon purple">
                                ▤
                            </div>

                        </div>

                        <p>Total applications</p>

                    </div>


                    <div className="stat-card">

                        <div className="stat-top">

                            <div>
                                <span className="stat-label">
                                    Pending
                                </span>

                                <h2>
                                    {statistics.pending}
                                </h2>
                            </div>

                            <div className="stat-icon orange">
                                ◷
                            </div>

                        </div>

                        <p>Waiting for response</p>

                    </div>


                    <div className="stat-card">

                        <div className="stat-top">

                            <div>
                                <span className="stat-label">
                                    Shortlisted
                                </span>

                                <h2>
                                    {statistics.shortlisted}
                                </h2>
                            </div>

                            <div className="stat-icon green">
                                ★
                            </div>

                        </div>

                        <p>Shortlisted applications</p>

                    </div>


                    <div className="stat-card">

                        <div className="stat-top">

                            <div>
                                <span className="stat-label">
                                    Interviews
                                </span>

                                <h2>
                                    {statistics.interviews}
                                </h2>
                            </div>

                            <div className="stat-icon blue">
                                ▣
                            </div>

                        </div>

                        <p>Upcoming interviews</p>

                    </div>

                </section>


                {/* =================================
                    CONTENT
                ================================= */}

                <section className="content-grid">


                    {/* RECENT APPLICATIONS */}

                    <div className="dashboard-card">

                        <div className="card-header">

                            <div>
                                <span className="section-label">
                                    CAREER ACTIVITY
                                </span>

                                <h2>
                                    Recent Applications
                                </h2>
                            </div>

                            <button
                                className="view-all"
                                onClick={() =>
                                    navigate("/applications")
                                }
                            >
                                View all →
                            </button>

                        </div>


                        {recent_applications?.length === 0 ? (

                            <div className="empty-state">

                                <div className="empty-icon">
                                    ▤
                                </div>

                                <h3>
                                    No applications yet
                                </h3>

                                <p>
                                    Start applying for jobs to see them here.
                                </p>

                            </div>

                        ) : (

                            <div className="application-list">

                                {recent_applications.map(
                                    (application) => (

                                        <div
                                            className="application-item"
                                            key={
                                                application.application_id
                                            }
                                        >

                                            <div className="company-logo">
                                                {application.company_name
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </div>


                                            <div className="application-info">

                                                <h3>
                                                    {application.title}
                                                </h3>

                                                <p>
                                                    {
                                                        application.company_name
                                                    }
                                                    <span> • </span>
                                                    {
                                                        application.location ||
                                                        "Location not specified"
                                                    }
                                                </p>

                                            </div>


                                            <span className="status">
                                                {application.status}
                                            </span>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>


                    {/* UPCOMING INTERVIEWS */}

                    <div className="dashboard-card">

                        <div className="card-header">

                            <div>

                                <span className="section-label">
                                    YOUR SCHEDULE
                                </span>

                                <h2>
                                    Upcoming Interviews
                                </h2>

                            </div>

                            <button
                                className="view-all"
                                onClick={() =>
                                    navigate("/interviews")
                                }
                            >
                                View all →
                            </button>

                        </div>


                        {upcoming_interviews?.length === 0 ? (

                            <div className="empty-state">

                                <div className="empty-icon">
                                    ◷
                                </div>

                                <h3>
                                    No upcoming interviews
                                </h3>

                                <p>
                                    Scheduled interviews will appear here.
                                </p>

                            </div>

                        ) : (

                            <div className="interview-list">

                                {upcoming_interviews.map(
                                    (interview) => (

                                        <div
                                            className="interview-item"
                                            key={
                                                interview.interview_id
                                            }
                                        >

                                            <div className="interview-date">
                                                <span>◷</span>

                                                {
                                                    interview.interview_date
                                                }

                                                <b>•</b>

                                                {
                                                    interview.interview_time
                                                }
                                            </div>


                                            <h3>
                                                {interview.title}
                                            </h3>


                                            <p className="interview-company">
                                                {interview.company_name}
                                            </p>


                                            <div className="interview-meta">
                                                Mode:{" "}
                                                {interview.mode}
                                            </div>


                                            {interview.meeting_link && (

                                                <a
                                                    className="join-btn"
                                                    href={
                                                        interview.meeting_link
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Join Interview
                                                    <span>→</span>
                                                </a>

                                            )}

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>

                </section>


                {/* =================================
                    PROFILE OVERVIEW
                ================================= */}

                <section className="dashboard-card profile-card">

                    <div className="card-header">

                        <div>

                            <span className="section-label">
                                ACCOUNT
                            </span>

                            <h2>
                                Profile Overview
                            </h2>

                        </div>

                        <button
                            className="view-all"
                            onClick={() =>
                                navigate("/profile")
                            }
                        >
                            Edit profile →
                        </button>

                    </div>


                    <div className="profile-overview-grid">

                        <div className="profile-detail">

                            <span>Name</span>

                            <strong>
                                {student.name}
                            </strong>

                        </div>


                        <div className="profile-detail">

                            <span>Email</span>

                            <strong>
                                {student.email}
                            </strong>

                        </div>


                        <div className="profile-detail">

                            <span>College</span>

                            <strong>
                                {student.college || "Not added"}
                            </strong>

                        </div>


                        <div className="profile-detail">

                            <span>Course</span>

                            <strong>
                                {student.course || "Not added"}
                            </strong>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Dashboard;