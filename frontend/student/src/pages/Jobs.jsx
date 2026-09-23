import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Jobs.css";

function Jobs() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("");
    const [jobType, setJobType] = useState("");

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/jobs");

            if (response.data.success) {
                setJobs(response.data.jobs || []);
            } else {
                setError(response.data.message || "Unable to load jobs");
            }
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to load jobs. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter((job) => {
        const searchText = search.toLowerCase();

        const matchesSearch =
            job.title?.toLowerCase().includes(searchText) ||
            job.company_name?.toLowerCase().includes(searchText) ||
            job.skills?.toLowerCase().includes(searchText);

        const matchesLocation =
            !location ||
            job.location?.toLowerCase() === location.toLowerCase();

        const matchesJobType =
            !jobType ||
            job.job_type?.toLowerCase() === jobType.toLowerCase();

        return matchesSearch && matchesLocation && matchesJobType;
    });

    const locations = [
        ...new Set(
            jobs
                .map((job) => job.location)
                .filter(Boolean)
        ),
    ];

    const jobTypes = [
        ...new Set(
            jobs
                .map((job) => job.job_type)
                .filter(Boolean)
        ),
    ];

    const handleViewJob = (job) => {
        navigate(`/jobs/${job.id}`, {
            state: { job },
        });
    };

    if (loading) {
        return (
            <div className="jobs-page">
                <div className="jobs-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading available jobs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="jobs-page">

            <div className="jobs-header">
                <div>
                    <span className="jobs-badge">
                        CAREER OPPORTUNITIES
                    </span>

                    <h1>
                        Find Your Next
                        <span> Opportunity</span>
                    </h1>

                    <p>
                        Explore jobs that match your skills and career goals.
                    </p>
                </div>

                <button
                    className="refresh-btn"
                    onClick={fetchJobs}
                >
                    ↻ Refresh
                </button>
            </div>

            <div className="jobs-filters">

                <div className="search-box">
                    <span>⌕</span>

                    <input
                        type="text"
                        placeholder="Search jobs, companies or skills..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                >
                    <option value="">All Locations</option>

                    {locations.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>

                <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                >
                    <option value="">All Job Types</option>

                    {jobTypes.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>

            </div>

            {error && (
                <div className="jobs-error">
                    <p>{error}</p>

                    <button onClick={fetchJobs}>
                        Try Again
                    </button>
                </div>
            )}

            {!error && (
                <div className="jobs-result-bar">
                    <span>
                        <strong>{filteredJobs.length}</strong>{" "}
                        {filteredJobs.length === 1 ? "job" : "jobs"} found
                    </span>

                    {(search || location || jobType) && (
                        <button
                            onClick={() => {
                                setSearch("");
                                setLocation("");
                                setJobType("");
                            }}
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            )}

            {!error && filteredJobs.length > 0 && (
                <div className="jobs-grid">

                    {filteredJobs.map((job) => (
                        <article
                            className="job-card"
                            key={job.id}
                        >

                            <div className="job-card-top">

                                <div className="company-logo">
                                    {job.company_name
                                        ?.charAt(0)
                                        ?.toUpperCase() || "C"}
                                </div>

                                <span className="job-type">
                                    {job.job_type || "Full Time"}
                                </span>

                            </div>

                            <div className="job-content">

                                <h2>{job.title}</h2>

                                <h3>
                                    {job.company_name || "Company"}
                                </h3>

                                <div className="job-meta">

                                    <span>
                                        📍 {job.location || "Remote"}
                                    </span>

                                    {job.salary && (
                                        <span>
                                            💰 {job.salary}
                                        </span>
                                    )}

                                </div>

                                {job.description && (
                                    <p className="job-description">
                                        {job.description}
                                    </p>
                                )}

                                {job.skills && (
                                    <div className="job-skills">
                                        {job.skills
                                            .split(",")
                                            .slice(0, 5)
                                            .map((skill) => (
                                                <span key={skill}>
                                                    {skill.trim()}
                                                </span>
                                            ))}
                                    </div>
                                )}

                                <div className="job-card-bottom">

                                    <span className="deadline">
                                        Deadline:{" "}
                                        {job.deadline || "Not specified"}
                                    </span>

                                    <button
                                        onClick={() =>
                                            handleViewJob(job)
                                        }
                                    >
                                        View Details →
                                    </button>

                                </div>

                            </div>

                        </article>
                    ))}

                </div>
            )}

            {!error && filteredJobs.length === 0 && (
                <div className="no-jobs">
                    <div className="no-jobs-icon">🔍</div>

                    <h2>No jobs found</h2>

                    <p>
                        Try changing your search or filter options.
                    </p>

                    <button
                        onClick={() => {
                            setSearch("");
                            setLocation("");
                            setJobType("");
                        }}
                    >
                        Clear Filters
                    </button>
                </div>
            )}

        </div>
    );
}

export default Jobs;