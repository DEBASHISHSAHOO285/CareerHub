import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./PostJob.css";

function PostJob() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        description: "",
        location: "",
        salary: "",
        job_type: "Full Time",
        skills: "",
        deadline: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // Required field validation
        if (
            !form.title.trim() ||
            !form.description.trim() ||
            !form.location.trim() ||
            !form.job_type
        ) {
            setError("Please fill all required fields.");
            return;
        }

        try {
            setLoading(true);

            // Get logged-in company
            const companyUser = JSON.parse(
                localStorage.getItem("companyUser") || "null"
            );

            const companyToken =
                localStorage.getItem("companyToken");

            // Check login session
            if (!companyUser?.id || !companyToken) {
                setError(
                    "Company login session expired. Please login again."
                );

                setTimeout(() => {
                    navigate("/company/login");
                }, 1000);

                return;
            }

            // Data sent to backend
            const jobData = {
                company_id: Number(companyUser.id),
                title: form.title.trim(),
                description: form.description.trim(),
                location: form.location.trim(),
                salary: form.salary.trim(),
                job_type: form.job_type,
                skills: form.skills.trim(),
                deadline: form.deadline || null,
            };

            console.log("Posting job:", jobData);

            const response = await api.post(
                "/jobs",
                jobData,
                {
                    headers: {
                        Authorization: `Bearer ${companyToken}`,
                    },
                }
            );

            console.log(
                "Post job response:",
                response.data
            );

            if (response.data.success) {
                setSuccess(
                    "Job posted successfully!"
                );

                // Clear form
                setForm({
                    title: "",
                    description: "",
                    location: "",
                    salary: "",
                    job_type: "Full Time",
                    skills: "",
                    deadline: "",
                });

                // Go back to company dashboard
                setTimeout(() => {
                    navigate("/company/dashboard");
                }, 1200);
            } else {
                setError(
                    response.data.message ||
                    "Unable to post job."
                );
            }
        } catch (err) {
            console.error(
                "Post Job Error:",
                err
            );

            console.error(
                "Backend Response:",
                err.response?.data
            );

            setError(
                err.response?.data?.message ||
                "Failed to post job. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="post-job-page">

            {/* TOP BAR */}
            <div className="post-job-topbar">

                <button
                    className="back-btn"
                    type="button"
                    onClick={() =>
                        navigate("/company/dashboard")
                    }
                >
                    ← Back to Dashboard
                </button>

                <div className="post-job-brand">

                    <div className="post-job-logo">
                        C
                    </div>

                    <div>
                        <h2>
                            Career<span>Hub</span>
                        </h2>

                        <p>
                            Company Portal
                        </p>
                    </div>

                </div>

            </div>

            {/* MAIN CONTAINER */}
            <div className="post-job-container">

                {/* HEADER */}
                <div className="post-job-header">

                    <span className="post-job-badge">
                        COMPANY PORTAL
                    </span>

                    <h1>
                        Post a New Job
                    </h1>

                    <p>
                        Find talented students and build
                        your future team.
                    </p>

                </div>

                {/* FORM CARD */}
                <div className="post-job-card">

                    {/* ERROR */}
                    {error && (
                        <div className="post-job-message error">
                            {error}
                        </div>
                    )}

                    {/* SUCCESS */}
                    {success && (
                        <div className="post-job-message success">
                            {success}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                    >

                        {/* JOB INFORMATION */}
                        <div className="form-section">

                            <h2>
                                Job Information
                            </h2>

                            <p>
                                Provide the basic details
                                about the position.
                            </p>

                            <div className="form-grid">

                                {/* TITLE */}
                                <div className="form-group full-width">

                                    <label>
                                        Job Title *
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="e.g. Frontend Developer"
                                        value={form.title}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                {/* LOCATION */}
                                <div className="form-group">

                                    <label>
                                        Location *
                                    </label>

                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="e.g. Bangalore"
                                        value={form.location}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                {/* JOB TYPE */}
                                <div className="form-group">

                                    <label>
                                        Job Type *
                                    </label>

                                    <select
                                        name="job_type"
                                        value={form.job_type}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="Full Time">
                                            Full Time
                                        </option>

                                        <option value="Part Time">
                                            Part Time
                                        </option>

                                        <option value="Internship">
                                            Internship
                                        </option>

                                        <option value="Contract">
                                            Contract
                                        </option>

                                        <option value="Remote">
                                            Remote
                                        </option>
                                    </select>

                                </div>

                                {/* SALARY */}
                                <div className="form-group">

                                    <label>
                                        Salary
                                    </label>

                                    <input
                                        type="text"
                                        name="salary"
                                        placeholder="e.g. 5-8 LPA"
                                        value={form.salary}
                                        onChange={handleChange}
                                    />

                                </div>

                                {/* DEADLINE */}
                                <div className="form-group">

                                    <label>
                                        Application Deadline
                                    </label>

                                    <input
                                        type="date"
                                        name="deadline"
                                        value={form.deadline}
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>

                        </div>

                        {/* DESCRIPTION */}
                        <div className="form-section">

                            <h2>
                                Job Description
                            </h2>

                            <p>
                                Explain the role,
                                responsibilities and
                                expectations.
                            </p>

                            <div className="form-group">

                                <label>
                                    Description *
                                </label>

                                <textarea
                                    name="description"
                                    rows="7"
                                    placeholder="Describe the job role, responsibilities, requirements and expectations..."
                                    value={form.description}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>

                        {/* SKILLS */}
                        <div className="form-section">

                            <h2>
                                Required Skills
                            </h2>

                            <p>
                                Add the skills candidates
                                should have.
                            </p>

                            <div className="form-group">

                                <label>
                                    Skills
                                </label>

                                <input
                                    type="text"
                                    name="skills"
                                    placeholder="HTML, CSS, JavaScript, React, Node.js"
                                    value={form.skills}
                                    onChange={handleChange}
                                />

                                <small>
                                    Separate multiple
                                    skills with commas.
                                </small>

                            </div>

                        </div>

                        {/* BUTTONS */}
                        <div className="post-job-actions">

                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() =>
                                    navigate(
                                        "/company/dashboard"
                                    )
                                }
                                disabled={loading}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="submit-job-btn"
                                disabled={loading}
                            >

                                {loading ? (
                                    <>
                                        <span className="post-spinner"></span>
                                        Posting...
                                    </>
                                ) : (
                                    <>
                                        🚀 Post Job
                                    </>
                                )}

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default PostJob;