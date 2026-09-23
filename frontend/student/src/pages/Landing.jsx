import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Landing.css";
import Logo from "../components/logo";

function Landing() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [loginPopup, setLoginPopup] = useState(false);
    const [registerPopup, setRegisterPopup] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
    if (location.state?.openLoginPopup) {
        setLoginPopup(true);

        navigate("/", {
            replace: true,
            state: {},
        });
    }
}, [location, navigate]);

    const openLoginPopup = () => {
        setLoginPopup(true);
        setMenuOpen(false);
    };

    const closeLoginPopup = () => {
        setLoginPopup(false);
    };

    const goToLogin = (path) => {
        setLoginPopup(false);
        navigate(path);
    };

    // Resister popup

    const openRegisterPopup = () => {
    setRegisterPopup(true);
    setMenuOpen(false);
};

const closeRegisterPopup = () => {
    setRegisterPopup(false);
};

const goToRegister = (path) => {
    setRegisterPopup(false);
    navigate(path);
};

    return (
        <div className="landing-page">

            {/* ================= NAVBAR ================= */}
            <header className="landing-navbar">

                <Link to="/" className="landing-logo">
                        <Logo />

                    <span>
                        Career<span>Hub</span>
                    </span>
                </Link>

                <nav
                    className={`landing-nav ${
                        menuOpen ? "mobile-open" : ""
                    }`}
                >
                    <a
                        href="#features"
                        onClick={() => setMenuOpen(false)}
                    >
                        Features
                    </a>

                    <a
                        href="#how-it-works"
                        onClick={() => setMenuOpen(false)}
                    >
                        How It Works
                    </a>

                    <a
                        href="#about"
                        onClick={() => setMenuOpen(false)}
                    >
                        About
                    </a>

                    <div className="mobile-auth">
                        <button
                            type="button"
                            className="nav-login nav-login-button"
                            onClick={openLoginPopup}
                        >
                            Login
                        </button>

                        <Link
                            to="/register"
                            className="nav-register"
                            onclick={openRegisterPopup}
                        >
                            Register
                        </Link>
                    </div>
                </nav>

                <div className="desktop-auth">
                    <button
                        type="button"
                        className="nav-login nav-login-button"
                        onClick={openLoginPopup}
                    >
                        Login
                    </button>

                    <button
    type="button"
    className="nav-register"
    onClick={openRegisterPopup}
>
    Get Started
</button>
                </div>

                <button
                    className={`menu-button ${
                        menuOpen ? "active" : ""
                    }`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </header>

            {/* ================= HERO ================= */}
            <main>

                <section className="hero-section">

                    <div className="hero-glow glow-one"></div>
                    <div className="hero-glow glow-two"></div>

                    <div className="hero-content">

                        <div className="hero-badge">
                            <span className="badge-dot"></span>
                            Your Career Journey Starts Here
                        </div>

                        <h1>
                            Find the
                            <span className="gradient-text">
                                {" "}Career{" "}
                            </span>
                            You Deserve.
                        </h1>

                        <p className="hero-description">
                            Discover meaningful opportunities, connect with
                            companies, and take the next step toward your
                            dream career with CareerHub.
                        </p>

                        <div className="hero-buttons">
                            <button
    type="button"
    className="primary-btn"
    onClick={openRegisterPopup}
>
    Get Started
    <span>→</span>
</button>

                            <a
                                href="#how-it-works"
                                className="secondary-btn"
                            >
                                Explore CareerHub
                            </a>
                        </div>

                        <div className="hero-trust">
                            <div className="avatar-stack">
                                <span>👨🏻‍💻</span>
                                <span>👩🏻‍💻</span>
                                <span>👨🏽‍🎓</span>
                                <span>👩🏻‍🎓</span>
                            </div>

                            <div>
                                <strong>
                                    Built for ambitious students
                                </strong>

                                <small>
                                    Find opportunities and grow your career
                                </small>
                            </div>
                        </div>

                    </div>

                    {/* ================= HERO VISUAL ================= */}
                    <div className="hero-visual">

                        <div className="dashboard-window">

                            <div className="window-top">
                                <div className="window-dots">
                                    <i></i>
                                    <i></i>
                                    <i></i>
                                </div>

                                <span>CareerHub</span>
                            </div>

                            <div className="mock-dashboard">

                                <div className="mock-sidebar">

                                    <Link to="/" className="landing-logo">
                        <Logo />

                    <span>
                        Career<span>Hub</span>
                    </span>
                </Link>

                                    <div className="mock-side-item active">
                                        <span>⌂</span>
                                    </div>

                                    <div className="mock-side-item">
                                        <span>▣</span>
                                    </div>

                                    <div className="mock-side-item">
                                        <span>♡</span>
                                    </div>

                                    <div className="mock-side-item">
                                        <span>⚙</span>
                                    </div>

                                </div>

                                <div className="mock-main">

                                    <div className="mock-header">
                                        <div>
                                            <small>
                                                Welcome back 👋
                                            </small>

                                            <h3>
                                                Find your next opportunity
                                            </h3>
                                        </div>

                                        <div className="mock-profile">
                                            👨🏻‍💻
                                        </div>
                                    </div>

                                    <div className="mock-search">
                                        <span>⌕</span>

                                        <span>
                                            Search jobs, skills or companies...
                                        </span>

                                        <button>
                                            Search
                                        </button>
                                    </div>

                                    <div className="mock-stats">

                                        <div>
                                            <span className="stat-icon blue">
                                                ⌁
                                            </span>

                                            <div>
                                                <strong>120+</strong>
                                                <small>Jobs</small>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="stat-icon purple">
                                                ▣
                                            </span>

                                            <div>
                                                <strong>45+</strong>
                                                <small>Companies</small>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="stat-icon green">
                                                ✓
                                            </span>

                                            <div>
                                                <strong>80+</strong>
                                                <small>Students</small>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="mock-title">
                                        <strong>
                                            Recommended Jobs
                                        </strong>

                                        <span>
                                            View all →
                                        </span>
                                    </div>

                                    <div className="mock-job">

                                        <div className="company-icon">
                                            T
                                        </div>

                                        <div className="job-info">
                                            <strong>
                                                Frontend Developer
                                            </strong>

                                            <small>
                                                Tech Solutions • Bangalore
                                            </small>
                                        </div>

                                        <div className="job-tag">
                                            Full Time
                                        </div>

                                    </div>

                                    <div className="mock-job">

                                        <div className="company-icon purple-bg">
                                            A
                                        </div>

                                        <div className="job-info">
                                            <strong>
                                                React Developer
                                            </strong>

                                            <small>
                                                Apex Technologies • Remote
                                            </small>
                                        </div>

                                        <div className="job-tag">
                                            Remote
                                        </div>

                                    </div>

                                </div>

                            </div>
                        </div>

                        <div className="floating-card floating-job">

                            <div className="floating-icon">
                                ✓
                            </div>

                            <div>
                                <strong>
                                    New opportunity
                                </strong>

                                <small>
                                    Frontend Developer
                                </small>
                            </div>

                        </div>

                        <div className="floating-card floating-success">

                            <span>🎯</span>

                            <div>
                                <strong>
                                    Career Progress
                                </strong>

                                <small>
                                    Keep moving forward!
                                </small>
                            </div>

                        </div>

                    </div>

                </section>

                {/* ================= STATS ================= */}
                <section className="stats-section">

                    <div className="stat-box">
                        <strong>120+</strong>
                        <span>Job Opportunities</span>
                    </div>

                    <div className="stat-box">
                        <strong>45+</strong>
                        <span>Hiring Companies</span>
                    </div>

                    <div className="stat-box">
                        <strong>80+</strong>
                        <span>Registered Students</span>
                    </div>

                    <div className="stat-box">
                        <strong>24/7</strong>
                        <span>Career Access</span>
                    </div>

                </section>

                {/* ================= FEATURES ================= */}
                <section
                    className="features-section"
                    id="features"
                >

                    <div className="section-heading">

                        <span className="section-label">
                            WHY CAREERHUB
                        </span>

                        <h2>
                            Everything you need to
                            <span> move forward.</span>
                        </h2>

                        <p>
                            A simple platform designed to make your journey
                            from student to professional easier.
                        </p>

                    </div>

                    <div className="features-grid">

                        <div className="feature-card">

                            <div className="feature-icon blue-icon">
                                🔎
                            </div>

                            <h3>
                                Discover Opportunities
                            </h3>

                            <p>
                                Explore relevant jobs and internships
                                based on your skills and career goals.
                            </p>

                        </div>

                        <div className="feature-card">

                            <div className="feature-icon purple-icon">
                                🚀
                            </div>

                            <h3>
                                Build Your Career
                            </h3>

                            <p>
                                Create your professional profile and
                                showcase your skills to potential employers.
                            </p>

                        </div>

                        <div className="feature-card">

                            <div className="feature-icon green-icon">
                                🤝
                            </div>

                            <h3>
                                Connect With Companies
                            </h3>

                            <p>
                                Apply directly to opportunities and
                                stay updated throughout the hiring process.
                            </p>

                        </div>

                    </div>

                </section>

                {/* ================= HOW IT WORKS ================= */}
                <section
                    className="how-section"
                    id="how-it-works"
                >

                    <div className="section-heading">

                        <span className="section-label">
                            HOW IT WORKS
                        </span>

                        <h2>
                            Your journey starts in
                            <span> three steps.</span>
                        </h2>

                    </div>

                    <div className="steps">

                        <div className="step">

                            <div className="step-number">
                                01
                            </div>

                            <div>
                                <h3>
                                    Create Your Profile
                                </h3>

                                <p>
                                    Register on CareerHub and create
                                    your professional student profile.
                                </p>
                            </div>

                        </div>

                        <div className="step-line"></div>

                        <div className="step">

                            <div className="step-number">
                                02
                            </div>

                            <div>
                                <h3>
                                    Explore & Apply
                                </h3>

                                <p>
                                    Find opportunities that match your
                                    skills and submit your applications.
                                </p>
                            </div>

                        </div>

                        <div className="step-line"></div>

                        <div className="step">

                            <div className="step-number">
                                03
                            </div>

                            <div>
                                <h3>
                                    Start Your Career
                                </h3>

                                <p>
                                    Track your applications and prepare
                                    for interviews with confidence.
                                </p>
                            </div>

                        </div>

                    </div>

                </section>

                {/* ================= CTA ================= */}
                <section
                    className="cta-section"
                    id="about"
                >

                    <div className="cta-glow"></div>

                    <div className="cta-content">

                        <span className="section-label">
                            START TODAY
                        </span>

                        <h2>
                            Your next opportunity
                            <br />
                            could be <span>one click away.</span>
                        </h2>

                        <p>
                            Join CareerHub and take the first step toward
                            building the career you want.
                        </p>

                        <button
    type="button"
    onClick={openRegisterPopup}
    className="cta-button"
>
    Create Your Free Account
    <span>→</span>
</button>

                    </div>

                </section>

            </main>

            {/* ================= FOOTER ================= */}
            <footer className="landing-footer">

                <div className="footer-brand">

                    <Link to="/" className="landing-logo">
                        <Logo />

                    <span>
                        Career<span>Hub</span>
                    </span>
                </Link>

                    <p>
                        Connecting students with opportunities
                        that shape their future.
                    </p>

                </div>

                <div className="footer-links">

                    <a href="#features">
                        Features
                    </a>

                    <a href="#how-it-works">
                        How It Works
                    </a>

                    <button
                        type="button"
                        onClick={openLoginPopup}
                        className="footer-login-button"
                    >
                        Login
                    </button>

                    <button
    type="button"
    onClick={openRegisterPopup}
    className="footer-register-button"
>
    Register
</button>

                </div>

                <div className="footer-bottom">
                    © 2026 CareerHub. All rights reserved.
                </div>

            </footer>

            {/* ================= LOGIN POPUP ================= */}
            {loginPopup && (

                <div
                    className="login-modal-overlay"
                    onClick={closeLoginPopup}
                >

                    <div
                        className="login-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <button
                            type="button"
                            className="login-modal-close"
                            onClick={closeLoginPopup}
                            aria-label="Close login popup"
                        >
                            ×
                        </button>

                        <div className="login-modal-header">

                            <Link to="/" className="landing-logo">
                        <Logo />

                    
                </Link>

                            <h2>
                                Welcome to CareerHub
                            </h2>

                            <p>
                                Choose how you want to continue
                            </p>

                        </div>

                        <div className="login-role-cards">

                            {/* STUDENT */}

                            <button
                                type="button"
                                className="login-role-card student-role"
                                onClick={() =>
                                    goToLogin("/login")
                                }
                            >

                                <div className="role-icon">
                                    👨‍🎓
                                </div>

                                <div className="role-content">

                                    <h3>
                                        Student Login
                                    </h3>

                                    <p>
                                        Find jobs, apply for opportunities
                                        and build your career.
                                    </p>

                                </div>

                                <span className="role-arrow">
                                    →
                                </span>

                            </button>

                            {/* COMPANY */}

                            <button
                                type="button"
                                className="login-role-card company-role"
                                onClick={() =>
                                    goToLogin("/company/login")
                                }
                            >

                                <div className="role-icon">
                                    🏢
                                </div>

                                <div className="role-content">

                                    <h3>
                                        Company Login
                                    </h3>

                                    <p>
                                        Post jobs and discover talented
                                        students.
                                    </p>

                                </div>

                                <span className="role-arrow">
                                    →
                                </span>

                            </button>

                            {/* ADMIN */}

                            <button
                                type="button"
                                className="login-role-card admin-role"
                                onClick={() =>
                                    goToLogin("/admin/login")
                                }
                            >

                                <div className="role-icon">
                                    🔐
                                </div>

                                <div className="role-content">

                                    <h3>
                                        Admin Login
                                    </h3>

                                    <p>
                                        Manage students, companies,
                                        jobs and applications.
                                    </p>

                                </div>

                                <span className="role-arrow">
                                    →
                                </span>

                            </button>

                        </div>

                        <div className="login-modal-footer">

                            <span>
                                Don't have an account?
                            </span>

                            <button
    type="button"
    onClick={openRegisterPopup}
    className="login-create-account-button"
>
    Create Account
</button>

                        </div>

                    </div>

                </div>

            )}

{/* =====================================================
    REGISTER POPUP
====================================================== */}

{registerPopup && (

    <div
        className="login-modal-overlay"
        onClick={closeRegisterPopup}
    >

        <div
            className="login-modal"
            onClick={(e) => e.stopPropagation()}
        >

            <button
                type="button"
                className="login-modal-close"
                onClick={closeRegisterPopup}
                aria-label="Close register popup"
            >
                ×
            </button>

            <div className="login-modal-header">

                <Link to="/" className="landing-logo">
                        <Logo />

                    
                </Link>

                <h2>
                    Join CareerHub
                </h2>

                <p>
                    Choose how you want to register
                </p>

            </div>

            <div className="login-role-cards">

                {/* STUDENT REGISTER */}

                <button
                    type="button"
                    className="login-role-card student-role"
                    onClick={() =>
                        goToRegister("/register")
                    }
                >

                    <div className="role-icon">
                        👨‍🎓
                    </div>

                    <div className="role-content">

                        <h3>
                            Student Register
                        </h3>

                        <p>
                            Create your student account,
                            find jobs and build your career.
                        </p>

                    </div>

                    <span className="role-arrow">
                        →
                    </span>

                </button>


                {/* COMPANY REGISTER */}

                <button
                    type="button"
                    className="login-role-card company-role"
                    onClick={() =>
                        goToRegister("/company/register")
                    }
                >

                    <div className="role-icon">
                        🏢
                    </div>

                    <div className="role-content">

                        <h3>
                            Company Register
                        </h3>

                        <p>
                            Create your company account,
                            post jobs and hire talented students.
                        </p>

                    </div>

                    <span className="role-arrow">
                        →
                    </span>

                </button>

            </div>

            <div className="login-modal-footer">

                <span>
                    Already have an account?
                </span>

                <button
                    type="button"
                    onClick={() => {
                        closeRegisterPopup();
                        openLoginPopup();
                    }}
                    style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        color: "inherit",
                        font: "inherit",
                    }}
                >
                    Login
                </button>

            </div>

        </div>

    </div>

)}

        </div>
    );
}

export default Landing;