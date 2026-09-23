import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./CompanyJobs.css";

function CompanyJobs() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const companyUser = JSON.parse(
        localStorage.getItem("companyUser") || "null"
    );

    const companyToken = localStorage.getItem("companyToken");

    useEffect(() => {
        fetchMyJobs();
    }, []);

    const fetchMyJobs = async () => {
        try {
            setLoading(true);
            setError("");

            if (!companyUser?.id || !companyToken) {
                setError("Company login session expired.");
                return;
            }

            /*
             * Backend jobs endpoint se jobs fetch kar rahe hain.
             * Phir sirf current company ke jobs show honge.
             */
            const response = await api.get("/jobs");

            if (response.data.success) {
                const allJobs = response.data.jobs || [];

                const myJobs = allJobs.filter(
                    (job) =>
                        Number(job.company_id) ===
                        Number(companyUser.id)
                );

                setJobs(myJobs);
            } else {
                setError(
                    response.data.message ||
                    "Unable to load jobs."
                );
            }
        } catch (err) {
            console.error("My Jobs Error:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load your jobs."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (jobId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this job?"
        );

        if (!confirmed) return;

        try {
            await api.delete(`/jobs/${jobId}`, {
                headers: {
                    Authorization: `Bearer ${companyToken}`,
                },
            });

            setJobs((prev) =>
                prev.filter((job) => job.id !== jobId)
            );
        } catch (err) {
            console.error("Delete Job Error:", err);

            alert(
                err.response?.data?.message ||
                "Unable to delete this job."
            );
        }
    };

    if (loading) {
        return (
            <div className="company-jobs-page">
                <div className="company-jobs-loading">
                    <div className="company-jobs-spinner"></div>
                    <p>Loading your jobs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="company-jobs-page">

            {/* TOP BAR */}
            <header className="company-jobs-topbar">

                <button
                    className="company-jobs-back"
                    onClick={() =>
                        navigate("/company/dashboard")
                    }
                >
                    ← Dashboard
                </button>

                <div className="company-jobs-brand">
                    <div className="company-jobs-logo">
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
                    className="company-jobs-post"
                    onClick={() =>
                        navigate("/company/post-job")
                    }
                >
                    + Post New Job
                </button>

            </header>

            {/* MAIN */}
            <main className="company-jobs-container">

                <div className="company-jobs-header">

                    <div>
                        <span className="company-jobs-badge">
                            COMPANY PORTAL
                        </span>

                        <h1>My Jobs</h1>

                        <p>
                            Manage the jobs posted by your company.
                        </p>
                    </div>

                    <div className="jobs-count-card">
                        <strong>{jobs.length}</strong>
                        <span>
                            {jobs.length === 1
                                ? "Active Job"
                                : "Jobs Posted"}
                        </span>
                    </div>

                </div>

                {/* ERROR */}
                {error && (
                    <div className="company-jobs-error">
                        <strong>Something went wrong</strong>
                        <p>{error}</p>

                        <button onClick={fetchMyJobs}>
                            Try Again
                        </button>
                    </div>
                )}

                {/* NO JOBS */}
                {!error && jobs.length === 0 && (
                    <div className="company-no-jobs">

                        <div className="company-no-jobs-icon">
                            💼
                        </div>

                        <h2>No jobs posted yet</h2>

                        <p>
                            Start hiring by posting your first
                            job on CareerHub.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/company/post-job")
                            }
                        >
                            + Post Your First Job
                        </button>

                    </div>
                )}

                {/* JOBS */}
                {!error && jobs.length > 0 && (
                    <div className="company-jobs-grid">

                        {jobs.map((job) => (
                            <article
                                className="company-job-card"
                                key={job.id}
                            >

                                {/* CARD TOP */}
                                <div className="company-job-card-top">

                                    <div className="company-job-icon">
                                        {job.title
                                            ?.charAt(0)
                                            ?.toUpperCase() || "J"}
                                    </div>

                                    <span className="company-job-type">
                                        {job.job_type ||
                                            "Full Time"}
                                    </span>

                                </div>

                                {/* CONTENT */}
                                <div className="company-job-content">

                                    <h2>{job.title}</h2>

                                    <div className="company-job-location">
                                        📍{" "}
                                        {job.location ||
                                            "Remote"}
                                    </div>

                                    {job.salary && (
                                        <div className="company-job-salary">
                                            💰 {job.salary}
                                        </div>
                                    )}

                                    {job.description && (
                                        <p>
                                            {job.description.length >
                                            130
                                                ? job.description.slice(
                                                      0,
                                                      130
                                                  ) + "..."
                                                : job.description}
                                        </p>
                                    )}

                                    {job.skills && (
                                        <div className="company-job-skills">

                                            {job.skills
                                                .split(",")
                                                .slice(0, 4)
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
                                    )}

                                </div>

                                {/* BOTTOM */}
                                <div className="company-job-bottom">

                                    <div className="company-job-deadline">
                                        <small>
                                            Deadline
                                        </small>

                                        <strong>
                                            {job.deadline ||
                                                "Not specified"}
                                        </strong>
                                    </div>

                                    <div className="company-job-actions">

                                        <button
                                            className="applicants-btn"
                                            onClick={() =>
                                                navigate(
                                                    `/company/jobs/${job.id}/applicants`
                                                )
                                            }
                                        >
                                            👥 Applicants
                                        </button>

                                        <button
    className="view-job-btn"
    onClick={() =>
        navigate(
            `/company/jobs/${job.id}`,
            {
                state: {
                    job,
                },
            }
        )
    }
>
    View
</button>

                                        <button
                                            className="delete-job-btn"
                                            onClick={() =>
                                                handleDelete(
                                                    job.id
                                                )
                                            }
                                        >
                                            🗑
                                        </button>

                                    </div>

                                </div>

                            </article>
                        ))}

                    </div>
                )}

            </main>

        </div>
    );
}

export default CompanyJobs;