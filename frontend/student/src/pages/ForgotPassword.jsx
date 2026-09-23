import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import "./ForgotPassword.css";

function ForgotPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const initialRole = searchParams.get("role");

    const [role, setRole] = useState(
        ["student", "company", "admin"].includes(initialRole)
            ? initialRole
            : "student"
    );

    const [step, setStep] = useState(1);

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const roleName = {
        student: "Student",
        company: "Company",
        admin: "Admin",
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/auth/forgot-password",
                {
                    email: email.trim(),
                    role,
                }
            );

            if (response.data.success) {
                setMessage(
                    response.data.message ||
                        "OTP has been sent to your email."
                );

                setStep(2);
            } else {
                setError(
                    response.data.message ||
                        "Unable to send OTP."
                );
            }
        } catch (err) {
            console.error("Forgot password error:", err);

            setError(
                err.response?.data?.message ||
                    "Unable to send OTP. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (!otp.trim()) {
            setError("Please enter the OTP.");
            return;
        }

        if (newPassword.length < 6) {
            setError(
                "Password must be at least 6 characters."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/auth/reset-password",
                {
                    email: email.trim(),
                    role,
                    otp: otp.trim(),
                    newPassword,
                }
            );

            if (response.data.success) {
                setMessage(
                    response.data.message ||
                        "Password reset successfully."
                );

                setTimeout(() => {
                    if (role === "student") {
                        navigate("/login");
                    } else if (role === "company") {
                        navigate("/company/login");
                    } else {
                        navigate("/admin/login");
                    }
                }, 1500);
            } else {
                setError(
                    response.data.message ||
                        "Unable to reset password."
                );
            }
        } catch (err) {
            console.error("Reset password error:", err);

            setError(
                err.response?.data?.message ||
                    "Unable to reset password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-page">

            <div className="forgot-brand">
                <Link to="/" className="forgot-brand-link">
                    <div className="forgot-brand-logo">
                        C
                    </div>

                    <div>
                        Career<span>Hub</span>
                    </div>
                </Link>

                <p>
                    Secure password recovery
                </p>
            </div>

            <div className="forgot-card">

                <div className="forgot-header">

                    <div className="forgot-icon">
                        🔐
                    </div>

                    <h1>
                        {step === 1
                            ? "Forgot Password?"
                            : "Reset Your Password"}
                    </h1>

                    <p>
                        {step === 1
                            ? "Enter your registered email to receive a verification OTP."
                            : `Enter the OTP sent to your email and create a new ${roleName[role].toLowerCase()} password.`}
                    </p>

                </div>

                {/* ROLE SELECT */}

                {step === 1 && (
                    <div className="forgot-role-section">

                        <label>
                            Account Type
                        </label>

                        <div className="forgot-role-grid">

                            <button
                                type="button"
                                className={
                                    role === "student"
                                        ? "forgot-role active"
                                        : "forgot-role"
                                }
                                onClick={() =>
                                    setRole("student")
                                }
                            >
                                <span>🎓</span>
                                Student
                            </button>

                            <button
                                type="button"
                                className={
                                    role === "company"
                                        ? "forgot-role active"
                                        : "forgot-role"
                                }
                                onClick={() =>
                                    setRole("company")
                                }
                            >
                                <span>🏢</span>
                                Company
                            </button>

                            <button
                                type="button"
                                className={
                                    role === "admin"
                                        ? "forgot-role active"
                                        : "forgot-role"
                                }
                                onClick={() =>
                                    setRole("admin")
                                }
                            >
                                <span>🔐</span>
                                Admin
                            </button>

                        </div>

                    </div>
                )}

                {/* STEP 1 */}

                {step === 1 && (
                    <form
                        className="forgot-form"
                        onSubmit={handleSendOTP}
                    >

                        <div className="forgot-input-group">

                            <label>
                                Email Address
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                                autoComplete="email"
                            />

                        </div>

                        {error && (
                            <div className="forgot-error">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="forgot-success">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="forgot-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="forgot-spinner"></span>
                                    Sending OTP...
                                </>
                            ) : (
                                "Send OTP"
                            )}
                        </button>

                    </form>
                )}

                {/* STEP 2 */}

                {step === 2 && (
                    <form
                        className="forgot-form"
                        onSubmit={handleResetPassword}
                    >

                        <div className="forgot-input-group">

                            <label>
                                Verification OTP
                            </label>

                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength="6"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) =>
                                    setOtp(
                                        e.target.value.replace(
                                            /\D/g,
                                            ""
                                        )
                                    )
                                }
                            />

                        </div>

                        <div className="forgot-input-group">

                            <label>
                                New Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) =>
                                    setNewPassword(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="forgot-input-group">

                            <label>
                                Confirm Password
                            </label>

                            <input
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        {error && (
                            <div className="forgot-error">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="forgot-success">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="forgot-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="forgot-spinner"></span>
                                    Updating Password...
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </button>

                        <button
                            type="button"
                            className="forgot-back-button"
                            onClick={() => {
                                setStep(1);
                                setOtp("");
                                setNewPassword("");
                                setConfirmPassword("");
                                setError("");
                                setMessage("");
                            }}
                        >
                            ← Change Email
                        </button>

                    </form>
                )}

                <div className="forgot-footer">

                    {role === "student" && (
                        <Link to="/login">
                            ← Back to Student Login
                        </Link>
                    )}

                    {role === "company" && (
                        <Link to="/company/login">
                            ← Back to Company Login
                        </Link>
                    )}

                    {role === "admin" && (
                        <Link to="/admin/login">
                            ← Back to Admin Login
                        </Link>
                    )}

                </div>

            </div>

            <div className="forgot-copyright">
                © 2026 CareerHub. All rights reserved.
            </div>

        </div>
    );
}

export default ForgotPassword;