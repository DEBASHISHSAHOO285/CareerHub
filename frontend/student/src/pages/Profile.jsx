import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Profile.css";

function Profile() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        college: "",
        course: "",
        branch: "",
        cgpa: "",
        skills: "",
        resume: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeName, setResumeName] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const studentUser = localStorage.getItem("studentUser");
            const token = localStorage.getItem("studentToken");

            if (!studentUser || !token) {
                navigate("/login");
                return;
            }

            let user;

            try {
                user = JSON.parse(studentUser);
            } catch {
                localStorage.removeItem("studentToken");
                localStorage.removeItem("studentUser");
                navigate("/login");
                return;
            }

            if (!user?.id) {
                navigate("/login");
                return;
            }

            const response = await api.get(
                `/auth/student/${user.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const student = response.data.student;

            setProfile(student);

            setFormData({
                name: student.name || "",
                phone: student.phone || "",
                college: student.college || "",
                course: student.course || "",
                branch: student.branch || "",
                cgpa: student.cgpa || "",
                skills: student.skills || "",
                resume: student.resume || "",
            });
        } catch (err) {
            console.error("Profile fetch error:", err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                localStorage.removeItem("studentToken");
                localStorage.removeItem("studentUser");
                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load profile."
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

    const handleResumeChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        setError("Resume file size must be less than 2 MB.");
        e.target.value = "";
        return;
    }

    const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
        setError("Only PDF, DOC and DOCX files are allowed.");
        e.target.value = "";
        return;
    }

    setError("");
    setResumeFile(file);
    setResumeName(file.name);
};

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        setSaving(true);
        setMessage("");
        setError("");

        const studentUser = localStorage.getItem("studentUser");
        const token = localStorage.getItem("studentToken");

        if (!studentUser || !token) {
            navigate("/login");
            return;
        }

        const user = JSON.parse(studentUser);

        /* ================================
           UPDATE PROFILE DATA
        ================================= */

        const response = await api.put(
            `/auth/student/${user.id}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.data.success) {
            setMessage("Profile updated successfully.");
        }

        /* ================================
           UPLOAD RESUME FILE
        ================================= */

        if (resumeFile) {
            const uploadData = new FormData();

            uploadData.append("resume", resumeFile);

            const uploadResponse = await api.post(
                `/auth/student/${user.id}/resume`,
                uploadData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (uploadResponse.data.success) {
                setFormData((prev) => ({
                    ...prev,
                    resume: uploadResponse.data.resume,
                }));

                setProfile((prev) => ({
                    ...prev,
                    resume: uploadResponse.data.resume,
                }));

                setResumeFile(null);
                setResumeName(uploadResponse.data.file_name || "");
                
                setMessage(
                    "Profile and resume updated successfully."
                );
            }
        }

    } catch (err) {
        console.error("Profile update error:", err);

        if (
            err.response?.status === 401 ||
            err.response?.status === 403
        ) {
            localStorage.removeItem("studentToken");
            localStorage.removeItem("studentUser");
            navigate("/login");
            return;
        }

        setError(
            err.response?.data?.message ||
            "Failed to update profile."
        );
    } finally {
        setSaving(false);
    }
};

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-loading">
                    Loading profile...
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">

                <div className="profile-header">
                    <div>
                        <h1>My Profile</h1>
                        <p>
                            Manage your student profile information.
                        </p>
                    </div>

                    <button
                        className="profile-back-btn"
                        onClick={() => navigate("/dashboard")}
                    >
                        ← Dashboard
                    </button>
                </div>

                {message && (
                    <div className="profile-success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="profile-error">
                        {error}
                    </div>
                )}

                <div className="profile-card">

                    <div className="profile-avatar-section">
                        <div className="profile-avatar">
                            {profile?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "S"}
                        </div>

                        <div>
                            <h2>{profile?.name || "Student"}</h2>
                            <p>{profile?.email || ""}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="profile-section-title">
                            Personal Information
                        </div>

                        <div className="profile-grid">

                            <div className="profile-field">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="profile-field">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={profile?.email || ""}
                                    disabled
                                />
                            </div>

                            <div className="profile-field">
                                <label>Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="profile-field">
                                <label>College</label>
                                <input
                                    type="text"
                                    name="college"
                                    value={formData.college}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="profile-field">
                                <label>Course</label>
                                <input
                                    type="text"
                                    name="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="profile-field">
                                <label>Branch</label>
                                <input
                                    type="text"
                                    name="branch"
                                    value={formData.branch}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="profile-field">
                                <label>CGPA</label>
                                <input
                                    type="text"
                                    name="cgpa"
                                    value={formData.cgpa}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="profile-field full-width">
                                <label>Skills</label>
                                <textarea
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="HTML, CSS, JavaScript, React, Python..."
                                />
                            </div>

                            <div className="profile-field full-width">
    <label>Upload Resume</label>

    <div className="resume-upload-box">
        <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeChange}
        />

        <p className="resume-help">
            PDF, DOC, DOCX — Maximum 2 MB
        </p>

        {resumeName && (
            <div className="resume-selected">
                📄 {resumeName}
            </div>
        )}

        {!resumeName && formData.resume && (
            <div className="resume-existing">
                ✅ Resume already uploaded
            </div>
        )}
    </div>
</div>

                        </div>

                        <div className="profile-actions">
                            <button
                                type="button"
                                className="profile-cancel-btn"
                                onClick={() => navigate("/dashboard")}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="profile-save-btn"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    );
}

export default Profile;