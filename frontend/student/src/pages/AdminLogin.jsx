import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./Auth.css";

function AdminLogin() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/admin/login", {
                email: email.trim(),
                password,
            });

            if (response.data.success) {
                const token = response.data.token;
                const user = response.data.user || response.data.admin;

                if (!token) {
                    setError("Login successful, but admin token was not received.");
                    return;
                }

                localStorage.setItem("adminToken", token);

                if (user) {
                    localStorage.setItem(
                        "adminUser",
                        JSON.stringify(user)
                    );
                }

                navigate("/admin/dashboard");
            } else {
                setError(
                    response.data.message ||
                    "Login failed. Please check your credentials."
                );
            }
        } catch (error) {
            console.error("Admin Login Error:", error);

            setError(
                error.response?.data?.message ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            {/* BRAND */}
            <div className="auth-brand">
                <div className="brand-logo">C</div>

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
            <div className="auth-card">

                <div className="auth-header">
                    <h1>Admin Login 🔐</h1>

                    <p>
                        Login to manage CareerHub.
                    </p>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="auth-message error-message">
                        {error}
                    </div>
                )}

                {/* FORM */}
                <form
                    onSubmit={handleLogin}
                    className="auth-form"
                >

                    {/* EMAIL */}
                    <div className="form-group">
                        <label>
                            Email Address
                        </label>

                        <input
                            type="email"
                            placeholder="admin@careerhub.com"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />
                    </div>

                    {/* PASSWORD */}
                    <div className="form-group">

                        <div className="password-label">
                            <label>
                                Password
                            </label>

                            <button
                                type="button"
                                className="show-password"
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

                        <input
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            required
                        />

                        <Link
                            to="/forgot-password"
                            className="forgot-password-link"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {/* LOGIN BUTTON */}
                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Logging in...
                            </>
                        ) : (
                            "Login as Admin"
                        )}
                    </button>

                </form>

                {/* DIVIDER */}
                <div className="auth-divider">
                    <span>SECURE ADMIN ACCESS</span>
                </div>

                {/* FOOTER */}
                <p className="auth-footer">
                    <Link to="/">
                        ← Back to CareerHub
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

export default AdminLogin;