import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import "./Auth.css";

function Login() {
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
            const response = await api.post("/auth/student/login", {
                email,
                password,
            });

            if (response.data.success) {
                localStorage.setItem(
                    "studentToken",
                    response.data.token
                );

                localStorage.setItem(
                    "studentUser",
                    JSON.stringify(response.data.user)
                );

                navigate("/dashboard");
            }
        } catch (error) {
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
            <div className="auth-brand">
                <div className="brand-logo">C</div>

                <div>
                    <h2>Career<span>Hub</span></h2>
                    <p>Build your career. Find your future.</p>
                </div>
            </div>

            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome Back 👋</h1>
                    <p>Login to continue your CareerHub journey.</p>
                </div>

                {error && (
                    <div className="auth-message error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="auth-form">
                    <div className="form-group">
                        <label>Email Address</label>

                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <div className="password-label">
                            <label>Password</label>
                            <button
                                type="button"
                                className="show-password"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
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
                            "Login to CareerHub"
                        )}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>OR</span>
                </div>

                <p className="auth-footer">
                    Don't have an account?{" "}
                    <Link to="/register">
                        Create Account
                    </Link>
                </p>
            </div>

            <p className="auth-copyright">
                © 2026 CareerHub. All rights reserved.
            </p>
        </div>
    );
}

export default Login;