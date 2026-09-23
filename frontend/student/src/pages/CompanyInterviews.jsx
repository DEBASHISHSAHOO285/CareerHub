import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import "./CompanyInterviews.css";

function CompanyInterviews() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    /*
     * Applicants page se URL me application_id aayega:
     *
     * /company/interviews?application_id=123
     */
    const applicationIdFromUrl =
        searchParams.get("application_id");

    const [interviews, setInterviews] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [showScheduleModal, setShowScheduleModal] =
        useState(false);

    const [scheduling, setScheduling] = useState(false);
    const [scheduleError, setScheduleError] = useState("");
    const [scheduleMessage, setScheduleMessage] = useState("");

    /*
     * SINGLE FORM STATE
     */
    const [formData, setFormData] = useState({
        application_id: "",
        interview_date: "",
        interview_time: "",
        mode: "Online",
        meeting_link: "",
    });

    /*
     * COMPANY SESSION
     */
    let companyUser = null;

    try {
        companyUser = JSON.parse(
            localStorage.getItem("companyUser") || "null"
        );
    } catch {
        companyUser = null;
    }

    const companyToken =
        localStorage.getItem("companyToken");

    /*
     * Application ID URL se mila hai
     * to form automatically open hoga.
     */
    useEffect(() => {
        if (applicationIdFromUrl) {
            setFormData((previous) => ({
                ...previous,
                application_id: applicationIdFromUrl,
            }));

            setScheduleError("");
            setScheduleMessage("");

            setShowScheduleModal(true);
        }
    }, [applicationIdFromUrl]);

    /*
     * LOAD COMPANY INTERVIEWS
     */
    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            setLoading(true);
            setError("");

            if (!companyUser?.id || !companyToken) {
                navigate("/company/login");
                return;
            }

            const response = await api.get(
                `/interviews/company/${companyUser.id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${companyToken}`,
                    },
                }
            );

            if (response.data.success) {
                setInterviews(
                    response.data.interviews || []
                );
            } else {
                setError(
                    response.data.message ||
                        "Failed to load interviews."
                );
            }
        } catch (err) {
            console.error(
                "Company interviews error:",
                err
            );

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                localStorage.removeItem("companyToken");
                localStorage.removeItem("companyUser");

                navigate("/company/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                    "Failed to load interviews."
            );
        } finally {
            setLoading(false);
        }
    };

    /*
     * LOGOUT
     */
    const handleLogout = () => {
        localStorage.removeItem("companyToken");
        localStorage.removeItem("companyUser");

        navigate("/");
    };

    /*
     * FORM CHANGE
     *
     * Application ID URL se aaya ho to
     * readonly rahega.
     */
    const handleFormChange = (event) => {
        const { name, value } = event.target;

        /*
         * Application ID locked hai
         */
        if (
            name === "application_id" &&
            applicationIdFromUrl
        ) {
            return;
        }

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    /*
     * OPEN MANUAL SCHEDULE FORM
     */
    const openManualScheduleForm = () => {
        setScheduleError("");
        setScheduleMessage("");

        setFormData({
            application_id: "",
            interview_date: "",
            interview_time: "",
            mode: "Online",
            meeting_link: "",
        });

        setShowScheduleModal(true);
    };

    /*
     * SCHEDULE INTERVIEW
     */
    const handleSchedule = async (event) => {
        event.preventDefault();

        try {
            setScheduling(true);
            setScheduleError("");
            setScheduleMessage("");

            if (!companyUser?.id || !companyToken) {
                navigate("/company/login");
                return;
            }

            if (!formData.application_id) {
                setScheduleError(
                    "Application ID is required."
                );
                return;
            }

            if (!formData.interview_date) {
                setScheduleError(
                    "Please select interview date."
                );
                return;
            }

            if (!formData.interview_time) {
                setScheduleError(
                    "Please select interview time."
                );
                return;
            }

            /*
             * Backend already checks:
             * - company login
             * - application exists
             * - application belongs to this company
             */
            const response = await api.post(
                "/interviews",
                {
                    application_id: Number(
                        formData.application_id
                    ),
                    interview_date:
                        formData.interview_date,
                    interview_time:
                        formData.interview_time,
                    mode: formData.mode,
                    meeting_link:
                        formData.meeting_link.trim() ||
                        null,
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${companyToken}`,
                    },
                }
            );

            if (response.data.success) {
                setScheduleMessage(
                    response.data.message ||
                        "Interview scheduled successfully."
                );

                /*
                 * Refresh interview list
                 */
                await fetchInterviews();

                /*
                 * Keep message visible briefly,
                 * then close modal.
                 *
                 * After successful scheduling, remove
                 * application_id from URL so that a later
                 * manual scheduling form is not locked
                 * to the previous application.
                 */
                setTimeout(() => {
                    setShowScheduleModal(false);

                    setScheduleMessage("");

                    navigate(
                        "/company/interviews",
                        { replace: true }
                    );
                }, 900);
            } else {
                setScheduleError(
                    response.data.message ||
                        "Failed to schedule interview."
                );
            }
        } catch (err) {
            console.error(
                "Schedule interview error:",
                err
            );

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                localStorage.removeItem("companyToken");
                localStorage.removeItem("companyUser");

                navigate("/company/login");
                return;
            }

            setScheduleError(
                err.response?.data?.message ||
                    "Failed to schedule interview."
            );
        } finally {
            setScheduling(false);
        }
    };

    /*
     * CLOSE MODAL
     */
    const closeModal = () => {
        if (scheduling) {
            return;
        }

        setShowScheduleModal(false);

        setScheduleError("");
        setScheduleMessage("");

        /*
         * Agar Applicants se application_id aaya tha,
         * ID ko preserve karenge.
         *
         * Taaki reopen karne par same application rahe.
         */
        setFormData((previous) => ({
            ...previous,
            application_id:
                applicationIdFromUrl ||
                previous.application_id,
        }));
    };

    /*
     * DATE FORMAT
     */
    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return date;
        }

        return parsed.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    /*
     * FILTER
     */
    const filteredInterviews = useMemo(() => {
        return interviews.filter((interview) => {
            const text = `
                ${interview.name || ""}
                ${interview.email || ""}
                ${interview.title || ""}
                ${interview.mode || ""}
                ${interview.status || ""}
            `.toLowerCase();

            const matchesSearch =
                text.includes(
                    search.toLowerCase()
                );

            const matchesStatus =
                statusFilter === "All" ||
                interview.status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [
        interviews,
        search,
        statusFilter,
    ]);

    /*
     * STATS
     */
    const totalInterviews =
        interviews.length;

    const scheduledInterviews =
        interviews.filter(
            (item) =>
                item.status === "Scheduled"
        ).length;

    const completedInterviews =
        interviews.filter(
            (item) =>
                item.status === "Completed"
        ).length;

    /*
     * APPLICATION ID LOCKED?
     */
    const applicationIdLocked =
        Boolean(applicationIdFromUrl);

    return (
        <div className="company-interviews-page">

            {/* =========================================
                SIDEBAR
            ========================================== */}

            <aside className="company-interviews-sidebar">

                <div className="company-interviews-brand">

                    <div className="company-interviews-logo">
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


                <nav className="company-interviews-nav">

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
                        <span>🎤</span>
                        Interviews
                    </button>


                    <button
                        onClick={() =>
                            navigate(
                                "/company/profile"
                            )
                        }
                    >
                        <span>🏢</span>
                        Company Profile
                    </button>

                </nav>


                <div className="company-interviews-sidebar-bottom">

                    <div className="company-interviews-user">

                        <div className="company-interviews-avatar">
                            {companyUser?.company_name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "C"}
                        </div>

                        <div>
                            <strong>
                                {companyUser?.company_name ||
                                    "Company"}
                            </strong>

                            <small>
                                Company Account
                            </small>
                        </div>

                    </div>


                    <button
                        className="company-interviews-logout"
                        onClick={handleLogout}
                    >
                        🚪 Logout
                    </button>

                </div>

            </aside>


            {/* =========================================
                MAIN
            ========================================== */}

            <main className="company-interviews-main">

                <header className="company-interviews-header">

                    <div>

                        <span className="company-page-label">
                            COMPANY PORTAL
                        </span>

                        <h1>
                            Interview Management
                        </h1>

                        <p>
                            Schedule and monitor your
                            company interviews.
                        </p>

                    </div>


                    <button
                        className="schedule-interview-btn"
                        onClick={
                            openManualScheduleForm
                        }
                    >
                        ＋ Schedule Interview
                    </button>

                </header>


                {/* =====================================
                    AUTO SELECTED APPLICATION MESSAGE
                ====================================== */}

                {applicationIdFromUrl && (
                    <div className="selected-application-banner">

                        <span>✓</span>

                        <div>
                            <strong>
                                Application selected
                            </strong>

                            <p>
                                Application ID{" "}
                                <b>
                                    #{applicationIdFromUrl}
                                </b>{" "}
                                has been automatically
                                selected from Applicants.
                            </p>
                        </div>

                    </div>
                )}


                {/* =====================================
                    STATS
                ====================================== */}

                <section className="company-interview-stats">

                    <div className="company-interview-stat">

                        <span>🎤</span>

                        <div>
                            <small>
                                Total Interviews
                            </small>

                            <strong>
                                {totalInterviews}
                            </strong>
                        </div>

                    </div>


                    <div className="company-interview-stat">

                        <span>📅</span>

                        <div>
                            <small>
                                Scheduled
                            </small>

                            <strong>
                                {scheduledInterviews}
                            </strong>
                        </div>

                    </div>


                    <div className="company-interview-stat">

                        <span>✅</span>

                        <div>
                            <small>
                                Completed
                            </small>

                            <strong>
                                {completedInterviews}
                            </strong>
                        </div>

                    </div>

                </section>


                {/* =====================================
                    FILTER TOOLBAR
                ====================================== */}

                <section className="company-interview-toolbar">

                    <div className="company-interview-search">
                        🔍

                        <input
                            type="text"
                            placeholder="Search student, job..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                        />
                    </div>


                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                    >
                        <option value="All">
                            All Status
                        </option>

                        <option value="Scheduled">
                            Scheduled
                        </option>

                        <option value="Completed">
                            Completed
                        </option>

                        <option value="Cancelled">
                            Cancelled
                        </option>
                    </select>


                    <button
                        className="company-refresh-btn"
                        onClick={fetchInterviews}
                    >
                        🔄 Refresh
                    </button>

                </section>


                {/* =====================================
                    TABLE
                ====================================== */}

                <section className="company-interview-card">

                    {loading ? (
                        <div className="company-interview-state">

                            <div className="company-interview-spinner"></div>

                            <p>
                                Loading interviews...
                            </p>

                        </div>
                    ) : error ? (
                        <div className="company-interview-state error">

                            <div>
                                ⚠️
                            </div>

                            <h3>
                                Unable to load interviews
                            </h3>

                            <p>
                                {error}
                            </p>

                            <button
                                onClick={
                                    fetchInterviews
                                }
                            >
                                Try Again
                            </button>

                        </div>
                    ) : filteredInterviews.length === 0 ? (
                        <div className="company-interview-state">

                            <div>
                                🎤
                            </div>

                            <h3>
                                No interviews found
                            </h3>

                            <p>
                                Scheduled interviews
                                will appear here.
                            </p>

                        </div>
                    ) : (
                        <div className="company-interview-table-wrapper">

                            <table className="company-interview-table">

                                <thead>

                                    <tr>
                                        <th>Student</th>
                                        <th>Job</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Mode</th>
                                        <th>Status</th>
                                        <th>Meeting</th>
                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredInterviews.map(
                                        (interview) => (
                                            <tr
                                                key={
                                                    interview.interview_id
                                                }
                                            >

                                                <td>

                                                    <div className="interview-student">

                                                        <div className="interview-student-avatar">
                                                            {interview.name
                                                                ?.charAt(
                                                                    0
                                                                )
                                                                ?.toUpperCase() ||
                                                                "S"}
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {interview.name ||
                                                                    "Student"}
                                                            </strong>

                                                            <small>
                                                                {interview.email ||
                                                                    "—"}
                                                            </small>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>
                                                    <strong>
                                                        {interview.title ||
                                                            "—"}
                                                    </strong>
                                                </td>


                                                <td>
                                                    {formatDate(
                                                        interview.interview_date
                                                    )}
                                                </td>


                                                <td>
                                                    {interview.interview_time ||
                                                        "—"}
                                                </td>


                                                <td>

                                                    <span className="interview-mode">
                                                        {interview.mode ||
                                                            "—"}
                                                    </span>

                                                </td>


                                                <td>

                                                    <span
                                                        className={`interview-status ${(
                                                            interview.status ||
                                                            "unknown"
                                                        )
                                                            .toLowerCase()
                                                            .replace(
                                                                /\s+/g,
                                                                "-"
                                                            )}`}
                                                    >
                                                        {interview.status ||
                                                            "Unknown"}
                                                    </span>

                                                </td>


                                                <td>

                                                    {interview.meeting_link ? (
                                                        <a
                                                            className="meeting-link-btn"
                                                            href={
                                                                interview.meeting_link
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            Open →
                                                        </a>
                                                    ) : (
                                                        <span className="no-link">
                                                            No link
                                                        </span>
                                                    )}

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


            {/* =========================================
                SCHEDULE MODAL
            ========================================== */}

            {showScheduleModal && (
                <div
                    className="company-interview-modal-overlay"
                    onClick={closeModal}
                >

                    <div
                        className="company-interview-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="company-interview-modal-header">

                            <div>

                                <span>
                                    CAREERHUB
                                </span>

                                <h2>
                                    Schedule Interview
                                </h2>

                                <p>
                                    Set the interview details
                                    for a student application.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={scheduling}
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={handleSchedule}
                            className="company-interview-form"
                        >

                            {/* APPLICATION ID */}

                            <div className="company-interview-form-group">

                                <label>
                                    Application ID
                                </label>

                                <input
                                    type="number"
                                    name="application_id"
                                    value={
                                        formData.application_id
                                    }
                                    readOnly={
                                        applicationIdLocked
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    placeholder="Application ID"
                                    required
                                    min="1"
                                />

                                {applicationIdLocked ? (
                                    <small className="readonly-help">
                                        Automatically selected
                                        from Applicants.
                                    </small>
                                ) : (
                                    <small>
                                        Enter an application
                                        ID to schedule an
                                        interview manually.
                                    </small>
                                )}

                            </div>


                            {/* DATE + TIME */}

                            <div className="company-interview-form-row">

                                <div className="company-interview-form-group">

                                    <label>
                                        Interview Date
                                    </label>

                                    <input
                                        type="date"
                                        name="interview_date"
                                        value={
                                            formData.interview_date
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        required
                                    />

                                </div>


                                <div className="company-interview-form-group">

                                    <label>
                                        Interview Time
                                    </label>

                                    <input
                                        type="time"
                                        name="interview_time"
                                        value={
                                            formData.interview_time
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        required
                                    />

                                </div>

                            </div>


                            {/* MODE */}

                            <div className="company-interview-form-group">

                                <label>
                                    Interview Mode
                                </label>

                                <select
                                    name="mode"
                                    value={
                                        formData.mode
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                >
                                    <option value="Online">
                                        Online
                                    </option>

                                    <option value="Offline">
                                        Offline
                                    </option>

                                    <option value="Hybrid">
                                        Hybrid
                                    </option>
                                </select>

                            </div>


                            {/* MEETING LINK */}

                            <div className="company-interview-form-group">

                                <label>
                                    Meeting Link
                                    <span>
                                        Optional
                                    </span>
                                </label>

                                <input
                                    type="url"
                                    name="meeting_link"
                                    value={
                                        formData.meeting_link
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    placeholder="https://meet.google.com/..."
                                />

                            </div>


                            {/* ERROR */}

                            {scheduleError && (
                                <div className="schedule-error">
                                    {scheduleError}
                                </div>
                            )}


                            {/* SUCCESS */}

                            {scheduleMessage && (
                                <div className="schedule-success">
                                    {scheduleMessage}
                                </div>
                            )}


                            {/* ACTIONS */}

                            <div className="company-interview-form-actions">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={scheduling}
                                    className="cancel-form-btn"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={scheduling}
                                    className="submit-interview-btn"
                                >
                                    {scheduling
                                        ? "Scheduling..."
                                        : "Schedule Interview"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

export default CompanyInterviews;