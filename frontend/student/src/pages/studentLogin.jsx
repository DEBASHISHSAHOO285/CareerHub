import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import api from "../services/api";

function StudentLogin() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await api.post(
                "/auth/student/login",
                formData
            );

            console.log("Login response:", response.data);

            if (response.data.success) {
                // Save login information
                localStorage.setItem(
                    "student",
                    JSON.stringify(response.data.student)
                );

                if (response.data.token) {
                    localStorage.setItem(
                        "studentToken",
                        response.data.token
                    );
                }

                alert("Login successful!");

                navigate("/dashboard");
            }
        } catch (error) {
            console.error("Login error:", error);

            setError(
                error.response?.data?.message ||
                "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">

                <h1>CareerHub</h1>

                <h2>Student Login</h2>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <Link
    to="/forgot-password"
    className="forgot-password-link"
>
    Forgot Password?
</Link>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

            </div>
        </div>
    );
}

export default StudentLogin;