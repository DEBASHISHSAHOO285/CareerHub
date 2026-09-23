import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminStudents.css";

function AdminStudents() {
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // =========================
    // LOAD STUDENTS
    // =========================
    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("adminToken");

            if (!token) {
                navigate("/admin/login");
                return;
            }

            const response = await api.get("/admin/students", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setStudents(response.data.students || []);
            } else {
                setError(
                    response.data.message ||
                    "Failed to load students."
                );
            }
        } catch (err) {
            console.error("Failed to load students:", err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminUser");

                navigate("/admin/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load students."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // DELETE STUDENT
    // =========================
    const handleDeleteStudent = async (studentId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this student?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(studentId);

            const token = localStorage.getItem("adminToken");

            if (!token) {
                navigate("/admin/login");
                return;
            }

            const response = await api.delete(
                `/admin/students/${studentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setStudents((prev) =>
                    prev.filter(
                        (student) =>
                            Number(student.id) !== Number(studentId)
                    )
                );

                if (
                    selectedStudent &&
                    Number(selectedStudent.id) === Number(studentId)
                ) {
                    setSelectedStudent(null);
                }
            } else {
                setError(
                    response.data.message ||
                    "Failed to delete student."
                );
            }
        } catch (err) {
            console.error("Delete student error:", err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminUser");

                navigate("/admin/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to delete student."
            );
        } finally {
            setDeletingId(null);
        }
    };

    // =========================
    // FILTER STUDENTS
    // =========================
    const filteredStudents = students.filter((student) => {
        const searchText = search.trim().toLowerCase();

        if (!searchText) {
            return true;
        }

        return (
            student.name
                ?.toLowerCase()
                .includes(searchText) ||
            student.email
                ?.toLowerCase()
                .includes(searchText) ||
            student.college
                ?.toLowerCase()
                .includes(searchText) ||
            student.course
                ?.toLowerCase()
                .includes(searchText) ||
            student.branch
                ?.toLowerCase()
                .includes(searchText)
        );
    });

    // =========================
    // ADMIN USER
    // =========================
    let adminUser = {};

    try {
        adminUser = JSON.parse(
            localStorage.getItem("adminUser") || "{}"
        );
    } catch {
        adminUser = {};
    }

    // =========================
    // LOGOUT
    // =========================
    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");

        navigate("/admin/login");
    };

    return (
        <div className="admin-layout">

            {/* =========================
                SIDEBAR
            ========================= */}

            <aside className="admin-sidebar">

                {/* BRAND */}
                <div className="admin-brand">

                    <div className="admin-brand-logo">
                        C
                    </div>

                    <div>
                        <h2>
                            Career<span>Hub</span>
                        </h2>

                        <p>Admin Panel</p>
                    </div>

                </div>

                {/* NAVIGATION */}
                <nav className="admin-nav">

                    <button
                        type="button"
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin/dashboard")
                        }
                    >
                        <span>📊</span>
                        <span>Dashboard</span>
                    </button>

                    <button
                        type="button"
                        className="admin-nav-item active"
                        onClick={() =>
                            navigate("/admin/students")
                        }
                    >
                        <span>👨‍🎓</span>
                        <span>Students</span>
                    </button>

                    <button
                        type="button"
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin/companies")
                        }
                    >
                        <span>🏢</span>
                        <span>Companies</span>
                    </button>

                    <button
                        type="button"
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin/jobs")
                        }
                    >
                        <span>💼</span>
                        <span>Jobs</span>
                    </button>

                    <button
                        type="button"
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin/applications")
                        }
                    >
                        <span>📋</span>
                        <span>Applications</span>
                    </button>

                    <button
    type="button"
    className="admin-nav-item"
    onClick={() =>
        navigate("/admin/interviews")
    }
>
    <span>🎤</span>
    <span>Interviews</span>
</button>

                </nav>

                {/* SIDEBAR BOTTOM */}
                <div className="admin-sidebar-bottom">

                    <div className="admin-user">

                        <div className="admin-avatar">
                            {adminUser.name
                                ? adminUser.name
                                      .charAt(0)
                                      .toUpperCase()
                                : "A"}
                        </div>

                        <div>
                            <strong>
                                {adminUser.name ||
                                    "CareerHub Admin"}
                            </strong>

                            <small>
                                Administrator
                            </small>
                        </div>

                    </div>

                    <button
                        type="button"
                        className="admin-logout"
                        onClick={handleLogout}
                    >
                        🚪 Logout
                    </button>

                </div>

            </aside>

            {/* =========================
                MAIN CONTENT
            ========================= */}

            <main className="admin-main">

                {/* HEADER */}
                <header className="admin-header">

                    <div>
                        <h1>Students</h1>

                        <p>
                            Manage registered CareerHub students.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="refresh-btn"
                        onClick={loadStudents}
                        disabled={loading}
                    >
                        {loading
                            ? "Loading..."
                            : "↻ Refresh"}
                    </button>

                </header>

                {/* ERROR */}
                {error && (
                    <div className="admin-error">

                        <strong>
                            Student Management Error
                        </strong>

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={loadStudents}
                        >
                            Try Again
                        </button>

                    </div>
                )}

                {/* =========================
                    STUDENT SECTION
                ========================= */}

                <section className="admin-students-section">

                    {/* TOP BAR */}
                    <div className="students-toolbar">

                        <div>
                            <h2>
                                Registered Students
                            </h2>

                            <p>
                                {students.length} student
                                {students.length !== 1
                                    ? "s"
                                    : ""}{" "}
                                registered
                            </p>
                        </div>

                        <div className="student-search-box">
                            <span>🔎</span>

                            <input
                                type="text"
                                placeholder="Search students..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />
                        </div>

                    </div>

                    {/* TABLE */}
                    {loading ? (
                        <div className="students-state">
                            <div className="students-spinner"></div>
                            <p>Loading students...</p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="students-state">

                            <div className="students-empty-icon">
                                👨‍🎓
                            </div>

                            <h3>
                                {search
                                    ? "No students found"
                                    : "No students registered"}
                            </h3>

                            <p>
                                {search
                                    ? "Try a different search term."
                                    : "Registered students will appear here."}
                            </p>

                        </div>
                    ) : (
                        <div className="students-table-wrapper">

                            <table className="students-table">

                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Email</th>
                                        <th>College</th>
                                        <th>Course</th>
                                        <th>Branch</th>
                                        <th>CGPA</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {filteredStudents.map(
                                        (student) => (
                                            <tr
                                                key={student.id}
                                            >

                                                {/* STUDENT */}
                                                <td>
                                                    <div className="student-name-cell">

                                                        <div className="student-avatar">
                                                            {student.name
                                                                ?.charAt(0)
                                                                ?.toUpperCase() ||
                                                                "S"}
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {student.name ||
                                                                    "Unnamed Student"}
                                                            </strong>

                                                            <small>
                                                                ID: #
                                                                {student.id}
                                                            </small>
                                                        </div>

                                                    </div>
                                                </td>

                                                {/* EMAIL */}
                                                <td>
                                                    {student.email ||
                                                        "—"}
                                                </td>

                                                {/* COLLEGE */}
                                                <td>
                                                    {student.college ||
                                                        "—"}
                                                </td>

                                                {/* COURSE */}
                                                <td>
                                                    {student.course ||
                                                        "—"}
                                                </td>

                                                {/* BRANCH */}
                                                <td>
                                                    {student.branch ||
                                                        "—"}
                                                </td>

                                                {/* CGPA */}
                                                <td>
                                                    <span className="cgpa-badge">
                                                        {student.cgpa ??
                                                            "—"}
                                                    </span>
                                                </td>

                                                {/* ACTIONS */}
                                                <td>

                                                    <div className="student-actions">

                                                        <button
                                                            type="button"
                                                            className="view-student-btn"
                                                            onClick={() =>
                                                                setSelectedStudent(
                                                                    student
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="delete-student-btn"
                                                            disabled={
                                                                deletingId ===
                                                                student.id
                                                            }
                                                            onClick={() =>
                                                                handleDeleteStudent(
                                                                    student.id
                                                                )
                                                            }
                                                        >
                                                            {deletingId ===
                                                            student.id
                                                                ? "Deleting..."
                                                                : "Delete"}
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </section>

            </main>

            {/* =========================
                STUDENT DETAILS MODAL
            ========================= */}

            {selectedStudent && (
                <div
                    className="student-modal-overlay"
                    onClick={() =>
                        setSelectedStudent(null)
                    }
                >
                    <div
                        className="student-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="student-modal-header">

                            <div>
                                <span>
                                    STUDENT DETAILS
                                </span>

                                <h2>
                                    {selectedStudent.name ||
                                        "Student"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="student-modal-close"
                                onClick={() =>
                                    setSelectedStudent(null)
                                }
                            >
                                ×
                            </button>

                        </div>

                        <div className="student-modal-body">

                            <div className="student-detail-grid">

                                <div className="student-detail-item">
                                    <span>Name</span>
                                    <strong>
                                        {selectedStudent.name ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="student-detail-item">
                                    <span>Email</span>
                                    <strong>
                                        {selectedStudent.email ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="student-detail-item">
                                    <span>Phone</span>
                                    <strong>
                                        {selectedStudent.phone ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="student-detail-item">
                                    <span>College</span>
                                    <strong>
                                        {selectedStudent.college ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="student-detail-item">
                                    <span>Course</span>
                                    <strong>
                                        {selectedStudent.course ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="student-detail-item">
                                    <span>Branch</span>
                                    <strong>
                                        {selectedStudent.branch ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="student-detail-item">
                                    <span>CGPA</span>
                                    <strong>
                                        {selectedStudent.cgpa ??
                                            "—"}
                                    </strong>
                                </div>

                                <div className="student-detail-item">
                                    <span>Joined</span>
                                    <strong>
                                        {selectedStudent.created_at
                                            ? new Date(
                                                  selectedStudent.created_at
                                              ).toLocaleDateString()
                                            : "—"}
                                    </strong>
                                </div>

                            </div>

                            <div className="student-detail-full">

                                <span>
                                    Skills
                                </span>

                                <p>
                                    {selectedStudent.skills ||
                                        "No skills added."}
                                </p>

                            </div>

                            <div className="student-detail-full">

                                <span>
                                    Resume
                                </span>

                                <p>
                                    {selectedStudent.resume
                                        ? "Resume uploaded"
                                        : "No resume uploaded"}
                                </p>

                            </div>

                        </div>

                        <div className="student-modal-footer">

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedStudent(null)
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminStudents;