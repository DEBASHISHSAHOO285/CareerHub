import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./SavedJobs.css";

function SavedJobs() {
    const navigate = useNavigate();

    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removingId, setRemovingId] = useState(null);

    useEffect(() => {
        loadSavedJobs();
    }, []);

    const loadSavedJobs = async () => {
        try {
            setLoading(true);
            setError("");

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
                navigate("/login");
                return;
            }

            const response = await api.get(
                `/saved-jobs/student/${user.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setSavedJobs(response.data.jobs || []);
            } else {
                setError(
                    response.data.message ||
                        "Failed to load saved jobs."
                );
            }
        } catch (err) {
            console.error("Saved jobs error:", err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                localStorage.removeItem("studentToken");
                localStorage.removeItem("studentUser");

                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                    "Failed to load saved jobs."
            );
        } finally {
            setLoading(false);
        }
    };

    const removeSavedJob = async (jobId) => {
        try {
            setRemovingId(jobId);

            const token = localStorage.getItem("studentToken");
            const studentUser = localStorage.getItem("studentUser");

            if (!token || !studentUser) {
                navigate("/login");
                return;
            }

            const user = JSON.parse(studentUser);

            await api.delete(
                `/saved-jobs/${user.id}/${jobId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSavedJobs((previousJobs) =>
                previousJobs.filter(
                    (job) =>
                        Number(job.job_id) !== Number(jobId)
                )
            );
        } catch (err) {
            console.error("Remove saved job error:", err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                localStorage.removeItem("studentToken");
                localStorage.removeItem("studentUser");

                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                    "Failed to remove saved job."
            );
        } finally {
            setRemovingId(null);
        }
    };

    const viewJob = (job) => {
        navigate(`/jobs/${job.job_id}`, {
            state: {
                job: {
                    ...job,
                    id: job.job_id,
                },
            },
        });
    };

    if (loading) {
        return (
            <div className="saved-jobs-page">
                <div className="saved-jobs-loading">
                    <div className="saved-spinner"></div>
                    <p>Loading saved jobs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="saved-jobs-page">

            {/* TOP BAR */}
            <header className="saved-jobs-topbar">

                <button
                    className="saved-back-btn"
                    onClick={() => navigate("/dashboard")}
                >
                    ← Dashboard
                </button>

                <div className="saved-brand">
                    <div className="saved-brand-logo">
                        C
                    </div>

                    <div>
                        <strong>
                            Career<span>Hub</span>
                        </strong>

                        <small>
                            Student Portal
                        </small>
                    </div>
                </div>

                <button
                    className="saved-find-btn"
                    onClick={() => navigate("/jobs")}
                >
                    Find Jobs →
                </button>

            </header>

            {/* CONTENT */}
            <main className="saved-jobs-content">

                <div className="saved-jobs-heading">

                    <div>
                        <span className="saved-section-label">
                            YOUR COLLECTION
                        </span>

                        <h1>
                            Saved Jobs
                        </h1>

                        <p>
                            Jobs you saved for later are listed here.
                        </p>
                    </div>

                    <div className="saved-count-box">
                        <strong>
                            {savedJobs.length}
                        </strong>

                        <span>
                            Saved Jobs
                        </span>
                    </div>

                </div>

                {error && (
                    <div className="saved-error">
                        <span>⚠️</span>
                        {error}
                    </div>
                )}

                {savedJobs.length === 0 ? (

                    <div className="saved-empty">

                        <div className="saved-empty-icon">
                            ♡
                        </div>

                        <h2>
                            No saved jobs yet
                        </h2>

                        <p>
                            Save jobs you are interested in and
                            they will appear here.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/jobs")
                            }
                            className="saved-empty-btn"
                        >
                            Explore Jobs →
                        </button>

                    </div>

                ) : (

                    <div className="saved-jobs-grid">

                        {savedJobs.map((job) => (

                            <article
                                className="saved-job-card"
                                key={job.saved_job_id}
                            >

                                <div className="saved-card-top">

                                    <div className="saved-company-logo">
                                        {job.company_name
                                            ?.charAt(0)
                                            ?.toUpperCase() || "C"}
                                    </div>

                                    <button
                                        className="remove-saved-btn"
                                        onClick={() =>
                                            removeSavedJob(
                                                job.job_id
                                            )
                                        }
                                        disabled={
                                            removingId ===
                                            job.job_id
                                        }
                                        title="Remove from saved jobs"
                                    >
                                        {removingId ===
                                        job.job_id
                                            ? "..."
                                            : "♥"}
                                    </button>

                                </div>

                                <div className="saved-job-main">

                                    <h2>
                                        {job.title ||
                                            "Untitled Job"}
                                    </h2>

                                    <p className="saved-company-name">
                                        {job.company_name ||
                                            "Company"}
                                    </p>

                                    <div className="saved-job-meta">

                                        <span>
                                            📍{" "}
                                            {job.location ||
                                                "Remote"}
                                        </span>

                                        <span>
                                            💼{" "}
                                            {job.job_type ||
                                                "Full Time"}
                                        </span>

                                        {job.salary && (
                                            <span>
                                                💰 ₹
                                                {job.salary}
                                            </span>
                                        )}

                                    </div>

                                    {job.skills && (
                                        <div className="saved-skills">

                                            {job.skills
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
                                    )}

                                    <div className="saved-card-bottom">

                                        <small>
                                            Saved{" "}
                                            {job.saved_at
                                                ? `• ${job.saved_at}`
                                                : ""}
                                        </small>

                                        <button
                                            className="saved-view-btn"
                                            onClick={() =>
                                                viewJob(job)
                                            }
                                        >
                                            View Job →
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

export default SavedJobs;