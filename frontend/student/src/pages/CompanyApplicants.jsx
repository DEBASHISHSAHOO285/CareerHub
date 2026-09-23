import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./CompanyApplicants.css";

function CompanyApplicants() {
    const navigate = useNavigate();
    const { jobId } = useParams();

    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const companyToken = localStorage.getItem("companyToken");

    useEffect(() => {
        fetchApplicants();
    }, [jobId]);

    const fetchApplicants = async () => {
        try {
            setLoading(true);
            setError("");

            if (!companyToken) {
                setError("Company login session expired.");
                return;
            }

            const response = await api.get(
                `/applications/job/${jobId}/applicants`,
                {
                    headers: {
                        Authorization: `Bearer ${companyToken}`,
                    },
                }
            );

            if (response.data.success) {
                setApplicants(response.data.applicants || []);
            } else {
                setError(
                    response.data.message ||
                        "Unable to load applicants."
                );
            }
        } catch (err) {
            console.error("Applicants Error:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to load applicants."
            );
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (
        applicationId,
        status
    ) => {
        try {
            setUpdatingId(applicationId);

            const response = await api.put(
                `/applications/${applicationId}/status`,
                {
                    status,
                },
                {
                    headers: {
                        Authorization: `Bearer ${companyToken}`,
                    },
                }
            );

            if (response.data.success) {
                setApplicants((prev) =>
                    prev.map((applicant) =>
                        applicant.application_id ===
                        applicationId
                            ? {
                                  ...applicant,
                                  status,
                              }
                            : applicant
                    )
                );
            } else {
                alert(
                    response.data.message ||
                        "Unable to update status."
                );
            }
        } catch (err) {
            console.error(
                "Status Update Error:",
                err
            );

            alert(
                err.response?.data?.message ||
                    "Failed to update application status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusClass = (status) => {
        if (status === "Shortlisted") {
            return "status-shortlisted";
        }

        if (status === "Rejected") {
            return "status-rejected";
        }

        return "status-pending";
    };

    if (loading) {
        return (
            <div className="company-applicants-page">
                <div className="applicants-loading">
                    <div className="applicants-spinner"></div>
                    <p>Loading applicants...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="company-applicants-page">

            {/* TOP BAR */}
            <header className="applicants-topbar">

                <button
                    className="applicants-back-btn"
                    onClick={() =>
                        navigate("/company/jobs")
                    }
                >
                    ← My Jobs
                </button>

                <div className="applicants-brand">

                    <div className="applicants-logo">
                        C
                    </div>

                    <div>
                        <h2>
                            Career<span>Hub</span>
                        </h2>

                        <p>Company Portal</p>
                    </div>
                </div>

                <button
                    className="refresh-applicants-btn"
                    onClick={fetchApplicants}
                >
                    ↻ Refresh
                </button>

            </header>

            {/* MAIN */}
            <main className="applicants-container">

                <div className="applicants-header">

                    <div>

                        <span className="applicants-badge">
                            APPLICATION MANAGEMENT
                        </span>

                        <h1>
                            Job Applicants
                        </h1>

                        <p>
                            Review candidates and manage
                            their application status.
                        </p>

                    </div>

                    <div className="applicant-count-card">
                        <strong>
                            {applicants.length}
                        </strong>

                        <span>
                            {applicants.length === 1
                                ? "Applicant"
                                : "Applicants"}
                        </span>
                    </div>

                </div>

                {/* ERROR */}
                {error && (
                    <div className="applicants-error">

                        <strong>
                            Unable to load applicants
                        </strong>

                        <p>{error}</p>

                        <button
                            onClick={fetchApplicants}
                        >
                            Try Again
                        </button>

                    </div>
                )}

                {/* EMPTY */}
                {!error &&
                    applicants.length === 0 && (
                        <div className="no-applicants">

                            <div className="no-applicants-icon">
                                👥
                            </div>

                            <h2>
                                No applicants yet
                            </h2>

                            <p>
                                Students who apply for this
                                job will appear here.
                            </p>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/company/jobs"
                                    )
                                }
                            >
                                ← Back to My Jobs
                            </button>

                        </div>
                    )}

                {/* APPLICANTS */}
                {!error &&
                    applicants.length > 0 && (
                        <div className="applicants-list">

                            {applicants.map(
                                (applicant) => (
                                    <article
                                        className="applicant-card"
                                        key={
                                            applicant.application_id
                                        }
                                    >

                                        {/* HEADER */}
                                        <div className="applicant-card-header">

                                            <div className="student-profile">

                                                <div className="student-avatar">
                                                    {applicant.name
                                                        ?.charAt(
                                                            0
                                                        )
                                                        ?.toUpperCase() ||
                                                        "S"}
                                                </div>

                                                <div>

                                                    <h2>
                                                        {applicant.name ||
                                                            "Student"}
                                                    </h2>

                                                    <p>
                                                        {applicant.email ||
                                                            "No email"}
                                                    </p>

                                                </div>

                                            </div>

                                            <span
                                                className={`application-status ${getStatusClass(
                                                    applicant.status
                                                )}`}
                                            >
                                                {applicant.status ||
                                                    "Pending"}
                                            </span>

                                        </div>

                                        {/* DETAILS */}
                                        <div className="student-details-grid">

                                            <div className="student-detail">

                                                <span>
                                                    📱 Phone
                                                </span>

                                                <strong>
                                                    {applicant.phone ||
                                                        "Not provided"}
                                                </strong>

                                            </div>

                                            <div className="student-detail">

                                                <span>
                                                    🎓 College
                                                </span>

                                                <strong>
                                                    {applicant.college ||
                                                        "Not provided"}
                                                </strong>

                                            </div>

                                            <div className="student-detail">

                                                <span>
                                                    📚 Course
                                                </span>

                                                <strong>
                                                    {applicant.course ||
                                                        "Not provided"}
                                                </strong>

                                            </div>

                                            <div className="student-detail">

                                                <span>
                                                    🏫 Branch
                                                </span>

                                                <strong>
                                                    {applicant.branch ||
                                                        "Not provided"}
                                                </strong>

                                            </div>

                                            <div className="student-detail">

                                                <span>
                                                    📊 CGPA
                                                </span>

                                                <strong>
                                                    {applicant.cgpa ||
                                                        "Not provided"}
                                                </strong>

                                            </div>

                                            <div className="student-detail">

                                                <span>
                                                    📅 Applied
                                                </span>

                                                <strong>
                                                    {applicant.applied_at ||
                                                        "Not available"}
                                                </strong>

                                            </div>

                                        </div>

                                        {/* SKILLS */}
                                        {applicant.skills && (
                                            <div className="student-skills-section">

                                                <h3>
                                                    Skills
                                                </h3>

                                                <div className="student-skills">

                                                    {applicant.skills
                                                        .split(",")
                                                        .map(
                                                            (
                                                                skill,
                                                                index
                                                            ) => (
                                                                <span
                                                                    key={`${skill}-${index}`}
                                                                >
                                                                    {skill.trim()}
                                                                </span>
                                                            )
                                                        )}

                                                </div>

                                            </div>
                                        )}

                                        {/* FOOTER */}
                                        <div className="applicant-card-footer">

                                            <div className="resume-section">

                                                {applicant.resume ? (
                                                    <a
                                                        href={
                                                            applicant.resume
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="resume-btn"
                                                    >
                                                        📄 View Resume
                                                    </a>
                                                ) : (
                                                    <span className="no-resume">
                                                        Resume not
                                                        uploaded
                                                    </span>
                                                )}

                                            </div>

                                            <div className="applicant-actions">

                                                <button
                                                    className="shortlist-btn"
                                                    disabled={
                                                        updatingId ===
                                                        applicant.application_id
                                                    }
                                                    onClick={() =>
                                                        updateStatus(
                                                            applicant.application_id,
                                                            "Shortlisted"
                                                        )
                                                    }
                                                >
                                                    ✓ Shortlist
                                                </button>

                                                {applicant.status === "Shortlisted" && (
                                                    <button
                                                        className="schedule-interview-btn"
                                                        onClick={() =>
                                                            navigate(
                                                                `/company/interviews?application_id=${applicant.application_id}`
                                                            )
                                                        }
                                                    >
                                                        🎤 Schedule Interview
                                                    </button>
                                                )}

                                                <button
                                                    className="reject-btn"
                                                    disabled={
                                                        updatingId ===
                                                        applicant.application_id
                                                    }
                                                    onClick={() =>
                                                        updateStatus(
                                                            applicant.application_id,
                                                            "Rejected"
                                                        )
                                                    }
                                                >
                                                    ✕ Reject
                                                </button>

                                            </div>

                                        </div>

                                    </article>
                                )
                            )}

                        </div>
                    )}

            </main>

        </div>
    );
}

export default CompanyApplicants;