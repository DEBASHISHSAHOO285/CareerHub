import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./CompanyProfile.css";

function CompanyProfile() {
    const navigate = useNavigate();

    const [company, setCompany] = useState(null);
    const [formData, setFormData] = useState({
        company_name: "",
        email: "",
        phone: "",
        website: "",
        description: "",
        location: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("companyToken");

            const storedCompany =
                localStorage.getItem("companyUser");

            if (!token || !storedCompany) {
                navigate("/company/login");
                return;
            }

            let companyUser;

            try {
                companyUser = JSON.parse(storedCompany);
            } catch {
                localStorage.removeItem("companyToken");
                localStorage.removeItem("companyUser");
                navigate("/company/login");
                return;
            }

            const response = await api.get(
                `/auth/company/${companyUser.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                const data = response.data.company;

                setCompany(data);

                setFormData({
                    company_name: data.company_name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    website: data.website || "",
                    description:
                        data.description || "",
                    location: data.location || "",
                });

                // Keep localStorage updated
                localStorage.setItem(
                    "companyUser",
                    JSON.stringify(data)
                );
            }
        } catch (err) {
            console.error(
                "Company profile error:",
                err
            );

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                localStorage.removeItem(
                    "companyToken"
                );

                localStorage.removeItem(
                    "companyUser"
                );

                navigate("/company/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                    "Failed to load company profile."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    const handleSave = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const token =
                localStorage.getItem("companyToken");

            if (!token || !company?.id) {
                navigate("/company/login");
                return;
            }

            const response = await api.put(
                `/auth/company/${company.id}`,
                {
                    company_name:
                        formData.company_name,
                    email: formData.email,
                    phone: formData.phone,
                    website: formData.website,
                    description:
                        formData.description,
                    location: formData.location,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                const updatedCompany =
                    response.data.company ||
                    {
                        ...company,
                        ...formData,
                    };

                setCompany(updatedCompany);

                setFormData({
                    company_name:
                        updatedCompany.company_name ||
                        "",
                    email:
                        updatedCompany.email || "",
                    phone:
                        updatedCompany.phone || "",
                    website:
                        updatedCompany.website || "",
                    description:
                        updatedCompany.description ||
                        "",
                    location:
                        updatedCompany.location ||
                        "",
                });

                localStorage.setItem(
                    "companyUser",
                    JSON.stringify(updatedCompany)
                );

                setEditing(false);

                setSuccess(
                    "Company profile updated successfully."
                );
            }
        } catch (err) {
            console.error(
                "Update profile error:",
                err
            );

            setError(
                err.response?.data?.message ||
                    "Failed to update company profile."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (company) {
            setFormData({
                company_name:
                    company.company_name || "",
                email: company.email || "",
                phone: company.phone || "",
                website: company.website || "",
                description:
                    company.description || "",
                location:
                    company.location || "",
            });
        }

        setEditing(false);
        setError("");
        setSuccess("");
    };

    const handleLogout = () => {
        localStorage.removeItem("companyToken");
        localStorage.removeItem("companyUser");

        navigate("/");
    };

    if (loading) {
        return (
            <div className="company-profile-loading">
                <div className="company-profile-spinner"></div>
                <p>Loading Company Profile...</p>
            </div>
        );
    }

    return (
        <div className="company-profile-page">

            {/* SIDEBAR */}

            <aside className="company-profile-sidebar">

                <div className="company-profile-brand">

                    <div className="company-profile-logo">
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

                <nav className="company-profile-nav">

                    <button
                        onClick={() =>
                            navigate(
                                "/company/dashboard"
                            )
                        }
                    >
                        <span>⌂</span>
                        Dashboard
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/company/jobs"
                            )
                        }
                    >
                        <span>💼</span>
                        My Jobs
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/company/post-job"
                            )
                        }
                    >
                        <span>＋</span>
                        Post New Job
                    </button>

                    <button
                        onClick={() =>
                            navigate(
                                "/company/applicants"
                            )
                        }
                    >
                        <span>👥</span>
                        Applicants
                    </button>

                    <button className="active">
                        <span>🏢</span>
                        Company Profile
                    </button>

                </nav>

                <div className="company-profile-sidebar-bottom">

                    <button
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </div>

            </aside>

            {/* MAIN */}

            <main className="company-profile-main">

                {/* TOPBAR */}

                <header className="company-profile-topbar">

                    <div>
                        <p>
                            COMPANY PORTAL
                        </p>

                        <h1>
                            Company Profile
                        </h1>
                    </div>

                    <div className="company-profile-user">

                        <div>
                            <strong>
                                {company?.company_name ||
                                    "Company"}
                            </strong>

                            <span>
                                {company?.email || ""}
                            </span>
                        </div>

                        <div className="company-profile-avatar">
                            {company?.company_name
                                ?.charAt(0)
                                ?.toUpperCase() || "C"}
                        </div>

                    </div>

                </header>

                {/* CONTENT */}

                <div className="company-profile-content">

                    {/* BACK */}

                    <button
                        className="profile-back-btn"
                        onClick={() =>
                            navigate(
                                "/company/dashboard"
                            )
                        }
                    >
                        ← Back to Dashboard
                    </button>

                    {/* HEADER CARD */}

                    <section className="profile-header-card">

                        <div className="profile-big-logo">
                            {company?.company_name
                                ?.charAt(0)
                                ?.toUpperCase() || "C"}
                        </div>

                        <div className="profile-header-info">

                            <span>
                                COMPANY PROFILE
                            </span>

                            <h2>
                                {company?.company_name ||
                                    "Company"}
                            </h2>

                            <p>
                                {company?.location ||
                                    "Location not provided"}
                            </p>

                        </div>

                        {!editing && (
                            <button
                                className="edit-profile-btn"
                                onClick={() => {
                                    setEditing(true);
                                    setSuccess("");
                                    setError("");
                                }}
                            >
                                ✏️ Edit Profile
                            </button>
                        )}

                    </section>

                    {/* MESSAGE */}

                    {error && (
                        <div className="profile-message profile-error">
                            ⚠️ {error}
                        </div>
                    )}

                    {success && (
                        <div className="profile-message profile-success">
                            ✓ {success}
                        </div>
                    )}

                    {/* FORM */}

                    <section className="profile-card">

                        <div className="profile-card-heading">

                            <div>
                                <p>
                                    COMPANY INFORMATION
                                </p>

                                <h2>
                                    {editing
                                        ? "Edit Company Details"
                                        : "Company Details"}
                                </h2>
                            </div>

                            {editing && (
                                <span className="editing-badge">
                                    Editing
                                </span>
                            )}

                        </div>

                        <form
                            onSubmit={handleSave}
                            className="company-profile-form"
                        >

                            {/* COMPANY NAME */}

                            <div className="profile-form-group">

                                <label>
                                    Company Name
                                </label>

                                <input
                                    type="text"
                                    name="company_name"
                                    value={
                                        formData.company_name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={!editing}
                                    placeholder="Enter company name"
                                    required
                                />

                            </div>

                            {/* EMAIL */}

                            <div className="profile-form-group">

                                <label>
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={
                                        formData.email
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={!editing}
                                    placeholder="company@example.com"
                                    required
                                />

                            </div>

                            {/* PHONE */}

                            <div className="profile-form-group">

                                <label>
                                    Phone Number
                                </label>

                                <input
                                    type="text"
                                    name="phone"
                                    value={
                                        formData.phone
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={!editing}
                                    placeholder="Enter phone number"
                                />

                            </div>

                            {/* WEBSITE */}

                            <div className="profile-form-group">

                                <label>
                                    Website
                                </label>

                                <input
                                    type="text"
                                    name="website"
                                    value={
                                        formData.website
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={!editing}
                                    placeholder="https://example.com"
                                />

                            </div>

                            {/* LOCATION */}

                            <div className="profile-form-group profile-full-width">

                                <label>
                                    Location
                                </label>

                                <input
                                    type="text"
                                    name="location"
                                    value={
                                        formData.location
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={!editing}
                                    placeholder="Bhubaneswar, Odisha"
                                />

                            </div>

                            {/* DESCRIPTION */}

                            <div className="profile-form-group profile-full-width">

                                <label>
                                    Company Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={!editing}
                                    placeholder="Tell students about your company..."
                                    rows="6"
                                />

                            </div>

                            {/* BUTTONS */}

                            {editing && (
                                <div className="profile-form-actions">

                                    <button
                                        type="button"
                                        className="cancel-profile-btn"
                                        onClick={
                                            handleCancel
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="save-profile-btn"
                                        disabled={
                                            saving
                                        }
                                    >
                                        {saving
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>

                                </div>
                            )}

                        </form>

                    </section>

                    {/* PROFILE SUMMARY */}

                    <section className="profile-summary">

                        <div className="summary-item">
                            <span>🏢</span>

                            <div>
                                <small>
                                    Company
                                </small>

                                <strong>
                                    {company?.company_name ||
                                        "Not provided"}
                                </strong>
                            </div>
                        </div>

                        <div className="summary-item">
                            <span>📍</span>

                            <div>
                                <small>
                                    Location
                                </small>

                                <strong>
                                    {company?.location ||
                                        "Not provided"}
                                </strong>
                            </div>
                        </div>

                        <div className="summary-item">
                            <span>🌐</span>

                            <div>
                                <small>
                                    Website
                                </small>

                                <strong>
                                    {company?.website ||
                                        "Not provided"}
                                </strong>
                            </div>
                        </div>

                    </section>

                </div>

            </main>

        </div>
    );
}

export default CompanyProfile;