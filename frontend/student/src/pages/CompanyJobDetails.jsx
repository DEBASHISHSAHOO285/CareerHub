import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./CompanyJobDetails.css";

function CompanyJobDetails() {
    const navigate = useNavigate();
    const { jobId } = useParams();
    const { state } = useLocation();

    const job = state?.job;

    if (!job) {
        return (
            <div className="company-job-details-page">
                <div className="company-job-details-empty">
                    <h2>Job details not available</h2>

                    <p>
                        This job information could not be loaded.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/company/jobs")
                        }
                    >
                        ← Back to My Jobs
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="company-job-details-page">

            {/* TOP BAR */}
            <header className="company-job-details-topbar">

                <button
                    className="company-details-back"
                    onClick={() =>
                        navigate("/company/jobs")
                    }
                >
                    ← My Jobs
                </button>

                <div className="company-details-brand">
                    <div className="company-details-logo">
                        C
                    </div>

                    <div>
                        <h2>
                            Career<span>Hub</span>
                        </h2>
                        <p>Company Portal</p>
                    </div>
                </div>

            </header>

            {/* CONTENT */}
            <main className="company-job-details-container">

                <span className="company-details-badge">
                    JOB DETAILS
                </span>

                <div className="company-details-header">

                    <div>
                        <h1>{job.title}</h1>

                        <p>
                            {job.company_name ||
                                "Your Company"}
                        </p>
                    </div>

                    <span className="company-details-type">
                        {job.job_type || "Full Time"}
                    </span>

                </div>

                <div className="company-details-meta">

                    <div>
                        <span>📍</span>
                        <div>
                            <small>Location</small>
                            <strong>
                                {job.location || "Remote"}
                            </strong>
                        </div>
                    </div>

                    <div>
                        <span>💰</span>
                        <div>
                            <small>Salary</small>
                            <strong>
                                {job.salary ||
                                    "Not specified"}
                            </strong>
                        </div>
                    </div>

                    <div>
                        <span>📅</span>
                        <div>
                            <small>Deadline</small>
                            <strong>
                                {job.deadline ||
                                    "Not specified"}
                            </strong>
                        </div>
                    </div>

                </div>

                <section className="company-details-card">

                    <h2>Job Description</h2>

                    <p>
                        {job.description ||
                            "No job description provided."}
                    </p>

                </section>

                {job.skills && (
                    <section className="company-details-card">

                        <h2>Required Skills</h2>

                        <div className="company-details-skills">
                            {job.skills
                                .split(",")
                                .map((skill, index) => (
                                    <span
                                        key={`${skill}-${index}`}
                                    >
                                        {skill.trim()}
                                    </span>
                                ))}
                        </div>

                    </section>
                )}

                <div className="company-details-actions">

                    <button
                        className="company-applicants-btn"
                        onClick={() =>
                            navigate(
                                `/company/jobs/${jobId}/applicants`
                            )
                        }
                    >
                        👥 View Applicants
                    </button>

                    <button
                        className="company-edit-btn"
                        onClick={() =>
                            navigate(
                                `/company/jobs/${jobId}/edit`,
                                {
                                    state: {
                                        job,
                                    },
                                }
                            )
                        }
                    >
                        ✏️ Edit Job
                    </button>

                </div>

            </main>

        </div>
    );
}

export default CompanyJobDetails;