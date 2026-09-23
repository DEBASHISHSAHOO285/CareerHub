import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./Auth.css";

function StudentRegister() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        college: "",
        course: "",
        branch: "",
        cgpa: "",
        skills: "",
    });

    const [showPassword, setShowPassword] = useState(false);
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
                "/auth/student/register",
                formData
            );

            if (response.data.success) {
                setSuccess(
                    response.data.message ||
                    "Registration successful"
                );

                setTimeout(() => {
                    navigate("/", {
    state: {
        openLoginPopup: true,
    },
});
                }, 1000);
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page register-page">
            <div className="auth-brand">
                <div className="brand-logo">C</div>

                <div>
                    <h2>Career<span>Hub</span></h2>
                    <p>Start building your career today.</p>
                </div>
            </div>

            <div className="auth-card register-card">
                <div className="auth-header">
                    <h1>Create Your Account 🚀</h1>
                    <p>
                        Join CareerHub and discover new opportunities.
                    </p>
                </div>

                {error && (
                    <div className="auth-message error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="auth-message success-message">
                        {success}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="auth-form register-form"
                >
                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Your full name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address *</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Password *</label>

                            <div className="password-input">
                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="text"
                                name="phone"
                                placeholder="10-digit phone number"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>College</label>
                        <input
                            type="text"
                            name="college"
                            placeholder="Your college / university"
                            value={formData.college}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Course</label>
                            <input
                                type="text"
                                name="course"
                                placeholder="e.g. B.Tech"
                                value={formData.course}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Branch</label>
                            <input
                                type="text"
                                name="branch"
                                placeholder="e.g. CSE"
                                value={formData.branch}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>CGPA</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="10"
                                name="cgpa"
                                placeholder="e.g. 8.5"
                                value={formData.cgpa}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Skills</label>
                            <input
                                type="text"
                                name="skills"
                                placeholder="React, JavaScript, Python..."
                                value={formData.skills}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

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
                            "Create CareerHub Account"
                        )}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>OR</span>
                </div>

                <p className="auth-footer">
                    Already have an account?{" "}
                    <Link to="/login">
                        Login
                    </Link>
                </p>
            </div>

            <p className="auth-copyright">
                © 2026 CareerHub. All rights reserved.
            </p>
        </div>
    );
}

export default StudentRegister;