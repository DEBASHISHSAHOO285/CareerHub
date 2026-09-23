import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./CompanyJobEdit.css";

function CompanyJobEdit() {
    const navigate = useNavigate();
    const { jobId } = useParams();
    const { state } = useLocation();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        salary: "",
        job_type: "",
        skills: "",
        deadline: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadJob();
    }, []);

    const loadJob = async () => {
        try {
            setLoading(true);
            setError("");

            if (state?.job) {
                setFormData({
                    title: state.job.title || "",
                    description: state.job.description || "",
                    location: state.job.location || "",
                    salary: state.job.salary || "",
                    job_type: state.job.job_type || "",
                    skills: state.job.skills || "",
                    deadline: state.job.deadline || "",
                });

                setLoading(false);
                return;
            }

            const response = await api.get(`/jobs/${jobId}`);

            if (response.data.success) {
                const job = response.data.job;

                setFormData({
                    title: job.title || "",
                    description: job.description || "",
                    location: job.location || "",
                    salary: job.salary || "",
                    job_type: job.job_type || "",
                    skills: job.skills || "",
                    deadline: job.deadline || "",
                });
            } else {
                setError(
                    response.data.message ||
                        "Unable to load job."
                );
            }
        } catch (err) {
            console.error("Load job error:", err);

            setError(
                err.response?.data?.message ||
                    "Unable to load job."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const companyUser = JSON.parse(
                localStorage.getItem("companyUser") || "null"
            );

            const companyToken =
                localStorage.getItem("companyToken");

            if (!companyUser?.id || !companyToken) {
                navigate("/company/login");
                return;
            }

            const response = await api.put(
                `/jobs/${jobId}`,
                {
                    company_id: companyUser.id,
                    title: formData.title,
                    description: formData.description,
                    location: formData.location,
                    salary: formData.salary,
                    job_type: formData.job_type,
                    skills: formData.skills,
                    deadline: formData.deadline,
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${companyToken}`,
                    },
                }
            );

            if (response.data.success) {
                setSuccess(
                    "Job updated successfully."
                );

                setTimeout(() => {
                    navigate(`/company/jobs/${jobId}`, {
                        state: {
                            job: {
                                id: Number(jobId),
                                company_id: companyUser.id,
                                ...formData,
                            },
                        },
                    });
                }, 700);
            } else {
                setError(
                    response.data.message ||
                        "Failed to update job."
                );
            }
        } catch (err) {
            console.error("Update job error:", err);

            setError(
                err.response?.data?.message ||
                    "Failed to update job."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="company-job-edit-page">
                <div className="company-job-edit-loading">
                    Loading job...
                </div>
            </div>
        );
    }

    return (
        <div className="company-job-edit-page">

            <header className="company-job-edit-topbar">

                <button
                    className="company-edit-back"
                    onClick={() =>
                        navigate(
                            `/company/jobs/${jobId}`,
                            {
                                state: {
                                    job: {
                                        id: Number(jobId),
                                        ...formData,
                                    },
                                },
                            }
                        )
                    }
                >
                    ← Job Details
                </button>

                <div className="company-edit-brand">
                    <div className="company-edit-logo">
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

            <main className="company-job-edit-container">

                <div className="company-edit-heading">
                    <span>JOB MANAGEMENT</span>
                    <h1>Edit Job</h1>
                    <p>
                        Update your job posting details.
                    </p>
                </div>

                {error && (
                    <div className="company-edit-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="company-edit-success">
                        {success}
                    </div>
                )}

                <form
                    className="company-job-edit-form"
                    onSubmit={handleSubmit}
                >

                    <div className="company-edit-field">
                        <label>Job Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="company-edit-field">
                        <label>Job Type</label>
                        <select
                            name="job_type"
                            value={formData.job_type}
                            onChange={handleChange}
                        >
                            <option value="">
                                Select Job Type
                            </option>
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
                        </select>
                    </div>

                    <div className="company-edit-field">
                        <label>Location</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="company-edit-field">
                        <label>Salary</label>
                        <input
                            type="text"
                            name="salary"
                            value={formData.salary}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="company-edit-field full">
                        <label>Job Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="7"
                            required
                        />
                    </div>

                    <div className="company-edit-field full">
                        <label>Required Skills</label>
                        <input
                            type="text"
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            placeholder="React, JavaScript, Node.js"
                        />
                    </div>

                    <div className="company-edit-field">
                        <label>Application Deadline</label>
                        <input
                            type="date"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="company-edit-actions">

                        <button
                            type="button"
                            className="company-edit-cancel"
                            onClick={() =>
                                navigate("/company/jobs")
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="company-edit-save"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                    </div>

                </form>

            </main>
        </div>
    );
}

export default CompanyJobEdit;