import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import "./JobDetails.css";

function JobDetails() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const job = state?.job;

    const [applying, setApplying] = useState(false);
    const [checkingApplication, setCheckingApplication] = useState(true);
    const [applied, setApplied] = useState(false);
    const [applyMessage, setApplyMessage] = useState("");
    const [applyError, setApplyError] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [saveError, setSaveError] = useState("");

    /*
     * Direct URL open hone par job state nahi milegi
     */
    if (!job) {
        return (
            <div className="job-details-page">
                <div className="job-details-empty">
                    <div className="empty-icon">🔍</div>

                    <h2>Job not found</h2>

                    <p>
                        This job information is no longer available here.
                    </p>

                    <button onClick={() => navigate("/jobs")}>
                        ← Back to Jobs
                    </button>
                </div>
            </div>
        );
    }

    /*
     * Check whether student already applied
     */
    useEffect(() => {
        const checkApplicationStatus = async () => {
            try {
                const token = localStorage.getItem("studentToken");
                const studentUser = localStorage.getItem("studentUser");

                if (!token || !studentUser) {
                    setCheckingApplication(false);
                    return;
                }

                let user;

                try {
                    user = JSON.parse(studentUser);
                } catch (error) {
                    localStorage.removeItem("studentToken");
                    localStorage.removeItem("studentUser");
                    setCheckingApplication(false);
                    return;
                }

                if (!user?.id) {
                    setCheckingApplication(false);
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

                if (response.data.success) {
                    const applications = response.data.applications || [];

                    const alreadyApplied = applications.some(
                        (application) =>
                            Number(application.job_id) === Number(job.id)
                    );

                    setApplied(alreadyApplied);
                }
            } catch (error) {
                console.error(
                    "Application status check failed:",
                    error
                );
            } finally {
                setCheckingApplication(false);
            }
        };

        checkApplicationStatus();
    }, [job.id]);

    const skills = job.skills
        ? job.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean)
        : [];

    /*
     * Apply for Job
     */
    const handleApply = async () => {
        if (applied) {
            return;
        }

        try {
            setApplying(true);
            setApplyMessage("");
            setApplyError("");

            const token = localStorage.getItem("studentToken");
            const studentUser = localStorage.getItem("studentUser");

            /*
             * Student login check
             */
            if (!token || !studentUser) {
                navigate("/login");
                return;
            }

            let user;

            try {
                user = JSON.parse(studentUser);
            } catch (error) {
                localStorage.removeItem("studentToken");
                localStorage.removeItem("studentUser");

                navigate("/login");
                return;
            }

            if (!user?.id) {
                setApplyError(
                    "Student information not found. Please login again."
                );
                return;
            }

            /*
             * Backend application API
             */
            const response = await api.post(
                "/applications",
                {
                    student_id: user.id,
                    job_id: job.id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setApplied(true);

                setApplyMessage(
                    response.data.message ||
                        "Application submitted successfully!"
                );
            } else {
                setApplyError(
                    response.data.message ||
                        "Failed to submit application."
                );
            }
        } catch (error) {
            console.error("Application error:", error);

            /*
             * Unauthorized
             */
            if (error.response?.status === 401) {
                localStorage.removeItem("studentToken");
                localStorage.removeItem("studentUser");

                navigate("/login");
                return;
            }

            /*
             * Already applied
             */
            if (error.response?.status === 409) {
                setApplied(true);

                setApplyMessage(
                    error.response?.data?.message ||
                        "You have already applied for this job."
                );

                return;
            }

            setApplyError(
                error.response?.data?.message ||
                    "Failed to submit application. Please try again."
            );
        } finally {
            setApplying(false);
        }
    };

    // ================================
// SAVE JOB
// ================================

const handleSaveJob = async () => {
    try {
        setSaving(true);
        setSaveMessage("");
        setSaveError("");

        const token = localStorage.getItem("studentToken");
        const studentUser = localStorage.getItem("studentUser");

        if (!token || !studentUser) {
            navigate("/login");
            return;
        }

        let user;

        try {
            user = JSON.parse(studentUser);
        } catch {
            localStorage.removeItem("studentToken");
            localStorage.removeItem("studentUser");

            navigate("/login");
            return;
        }

        if (!user?.id) {
            setSaveError(
                "Student information not found. Please login again."
            );
            return;
        }

        const response = await api.post(
            "/saved-jobs",
            {
                student_id: user.id,
                job_id: job.id,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.data.success) {
            setSaveMessage(
                response.data.message ||
                    "Job saved successfully!"
            );
        } else {
            setSaveError(
                response.data.message ||
                    "Failed to save job."
            );
        }

    } catch (error) {
        console.error("Save job error:", error);

        if (error.response?.status === 401) {
            localStorage.removeItem("studentToken");
            localStorage.removeItem("studentUser");

            navigate("/login");
            return;
        }

        setSaveError(
            error.response?.data?.message ||
                "Failed to save job. Please try again."
        );
    } finally {
        setSaving(false);
    }
};

    return (
        <div className="job-details-page">

            {/* TOP BAR */}
            <div className="job-details-topbar">
                <button
                    className="back-jobs-btn"
                    onClick={() => navigate("/jobs")}
                >
                    ← Back to Jobs
                </button>
            </div>

            {/* HERO */}
            <section className="job-details-hero">

                <div className="job-company-logo">
                    {job.company_name
                        ?.charAt(0)
                        ?.toUpperCase() || "C"}
                </div>

                <div className="job-hero-content">

                    <div className="job-hero-tags">

                        <span className="job-type-badge">
                            {job.job_type || "Full Time"}
                        </span>

                        {job.location && (
                            <span className="location-badge">
                                📍 {job.location}
                            </span>
                        )}

                    </div>

                    <h1>{job.title}</h1>

                    <p className="job-company-name">
                        {job.company_name || "Company"}
                    </p>

                </div>

            </section>

            {/* MAIN CONTENT */}
            <div className="job-details-layout">

                {/* LEFT SIDE */}
                <main className="job-details-main">

                    {/* ABOUT JOB */}
                    <section className="details-section">

                        <h2>About the Job</h2>

                        <p className="job-full-description">
                            {job.description ||
                                "No job description has been provided."}
                        </p>

                    </section>

                    {/* REQUIRED SKILLS */}
                    {skills.length > 0 && (
                        <section className="details-section">

                            <h2>Required Skills</h2>

                            <div className="details-skills">

                                {skills.map((skill, index) => (
                                    <span
                                        key={`${skill}-${index}`}
                                    >
                                        {skill}
                                    </span>
                                ))}

                            </div>

                        </section>
                    )}

                    {/* JOB INFORMATION */}
                    <section className="details-section">

                        <h2>Job Information</h2>

                        <div className="job-info-grid">

                            {/* Job Type */}
                            <div className="job-info-item">

                                <span className="info-icon">
                                    💼
                                </span>

                                <div>
                                    <small>Job Type</small>

                                    <strong>
                                        {job.job_type ||
                                            "Not specified"}
                                    </strong>
                                </div>

                            </div>

                            {/* Location */}
                            <div className="job-info-item">

                                <span className="info-icon">
                                    📍
                                </span>

                                <div>
                                    <small>Location</small>

                                    <strong>
                                        {job.location ||
                                            "Remote"}
                                    </strong>
                                </div>

                            </div>

                            {/* Salary */}
                            <div className="job-info-item">

                                <span className="info-icon">
                                    💰
                                </span>

                                <div>
                                    <small>Salary</small>

                                    <strong>
                                        {job.salary ||
                                            "Not specified"}
                                    </strong>
                                </div>

                            </div>

                            {/* Deadline */}
                            <div className="job-info-item">

                                <span className="info-icon">
                                    📅
                                </span>

                                <div>
                                    <small>
                                        Application Deadline
                                    </small>

                                    <strong>
                                        {job.deadline ||
                                            "Not specified"}
                                    </strong>
                                </div>

                            </div>

                        </div>

                    </section>

                </main>

                {/* RIGHT SIDEBAR */}
                <aside className="job-details-sidebar">

                    {/* APPLY CARD */}
                    <div className="apply-card">

                        <div className="apply-card-header">

                            <span>
                                {applied
                                    ? "Application Submitted"
                                    : "Ready to apply?"}
                            </span>

                            <strong>
                                {applied ? "✓" : "🚀"}
                            </strong>

                        </div>

                        <h3>{job.title}</h3>

                        <p>
                            {applied
                                ? "You have already applied for this job."
                                : "Submit your application and take the next step toward your career."}
                        </p>

                        {/* APPLY BUTTON */}
                        <button
                            className={`apply-btn ${
                                applied
                                    ? "applied-btn"
                                    : ""
                            }`}
                            onClick={handleApply}
                            disabled={
                                applying ||
                                checkingApplication ||
                                applied
                            }
                        >
                            {checkingApplication
                                ? "Checking..."
                                : applying
                                ? "Applying..."
                                : applied
                                ? "✓ Already Applied"
                                : "Apply Now →"}
                        </button>

                        <button
    className="save-job-btn"
    onClick={handleSaveJob}
    disabled={saving}
>
    {saving
        ? "Saving..."
        : "♡ Save Job"}
</button>

{saveMessage && (
    <div className="save-success">
        ✓ {saveMessage}
    </div>
)}

{saveError && (
    <div className="save-error">
        {saveError}
    </div>
)}

                        {/* SUCCESS MESSAGE */}
                        {applyMessage && (
                            <div className="apply-success">
                                ✓ {applyMessage}
                            </div>
                        )}

                        {/* ERROR MESSAGE */}
                        {applyError && (
                            <div className="apply-error">
                                {applyError}
                            </div>
                        )}

                        {/* DEADLINE */}
                        <div className="apply-deadline">

                            <span>
                                Application Deadline
                            </span>

                            <strong>
                                {job.deadline ||
                                    "Not specified"}
                            </strong>

                        </div>

                    </div>

                    {/* COMPANY CARD */}
                    <div className="company-card">

                        <div className="company-card-logo">

                            {job.company_name
                                ?.charAt(0)
                                ?.toUpperCase() || "C"}

                        </div>

                        <h3>
                            {job.company_name ||
                                "Company"}
                        </h3>

                        <p>
                            Hiring through CareerHub
                        </p>

                    </div>

                </aside>

            </div>

        </div>
    );
}

export default JobDetails;