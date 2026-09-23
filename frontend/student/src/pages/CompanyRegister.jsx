import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./Auth.css";

function CompanyRegister() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        company_name: "",
        email: "",
        password: "",
        phone: "",
        website: "",
        description: "",
        location: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await api.post(
                "/auth/company/register",
                formData
            );

            if (response.data.success) {
                setSuccess(
                    response.data.message ||
                    "Company registered successfully."
                );

                setTimeout(() => {
                    navigate("/", {
    state: {
        openLoginPopup: true,
    },
});
                }, 1200);
            } else {
                setError(
                    response.data.message ||
                    "Registration failed."
                );
            }
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            {/* BRAND */}
            <div className="auth-brand">

                <div className="brand-logo">
                    C
                </div>

                <div>
                    <h2>
                        Career<span>Hub</span>
                    </h2>

                    <p>
                        Build your career. Find your future.
                    </p>
                </div>

            </div>

            {/* CARD */}
            <div className="auth-card register-card">

                {/* HEADER */}
                <div className="auth-header">

                    <h1>
                        Create Company Account 🏢
                    </h1>

                    <p>
                        Join CareerHub and start hiring talented
                        students.
                    </p>

                </div>

                {/* ERROR */}
                {error && (
                    <div className="auth-message error-message">
                        {error}
                    </div>
                )}

                {/* SUCCESS */}
                {success && (
                    <div className="auth-message success-message">
                        {success}
                    </div>
                )}

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="auth-form"
                >

                    {/* COMPANY + EMAIL */}
                    <div className="form-row">

                        <div className="form-group">
                            <label>
                                Company Name
                            </label>

                            <input
                                type="text"
                                name="company_name"
                                placeholder="Your company name"
                                value={formData.company_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                Email Address
                            </label>

                            <input
                                type="email"
                                name="email"
                                placeholder="company@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                    </div>

                    {/* PASSWORD + PHONE */}
                    <div className="form-row">

                        <div className="form-group">
                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                Phone
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                placeholder="Company phone number"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                    </div>

                    {/* WEBSITE + LOCATION */}
                    <div className="form-row">

                        <div className="form-group">
                            <label>
                                Website
                            </label>

                            <input
                                type="url"
                                name="website"
                                placeholder="https://example.com"
                                value={formData.website}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                Location
                            </label>

                            <input
                                type="text"
                                name="location"
                                placeholder="Bangalore, India"
                                value={formData.location}
                                onChange={handleChange}
                            />
                        </div>

                    </div>

                    {/* DESCRIPTION */}
                    <div className="form-group">

                        <label>
                            Company Description
                        </label>

                        <textarea
                            name="description"
                            placeholder="Tell students about your company..."
                            value={formData.description}
                            onChange={handleChange}
                            rows="5"
                            style={{
                                width: "100%",
                                padding: "14px",
                                border: "1px solid #dbe1ea",
                                borderRadius: "10px",
                                outline: "none",
                                background: "#ffffff",
                                color: "#111827",
                                fontSize: "14px",
                                fontFamily: "inherit",
                                resize: "vertical",
                            }}
                        />

                    </div>

                    {/* SUBMIT */}
                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Creating Account...
                            </>
                        ) : (
                            "Create Company Account"
                        )}
                    </button>

                </form>

                {/* DIVIDER */}
                <div className="auth-divider">
                    <span>OR</span>
                </div>

                {/* LOGIN */}
                <p className="auth-footer">
                    Already have a company account?{" "}

                    <Link to="/company/login">
                        Login
                    </Link>
                </p>

            </div>

            {/* COPYRIGHT */}
            <p className="auth-copyright">
                © 2026 CareerHub. All rights reserved.
            </p>

        </div>
    );
}

export default CompanyRegister;