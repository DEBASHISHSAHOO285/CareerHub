import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminCompanies.css";

function AdminCompanies() {
    const navigate = useNavigate();

    const [companies, setCompanies] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // =========================
    // LOAD COMPANIES
    // =========================
    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("adminToken");

            if (!token) {
                navigate("/admin/login");
                return;
            }

            const response = await api.get("/admin/companies", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setCompanies(response.data.companies || []);
            } else {
                setError(
                    response.data.message ||
                    "Failed to load companies."
                );
            }
        } catch (err) {
            console.error(
                "Failed to load companies:",
                err
            );

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
                "Failed to load companies."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // DELETE COMPANY
    // =========================
    const handleDeleteCompany = async (companyId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this company?\n\nThis may also remove its related jobs and applications."
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(companyId);

            const token = localStorage.getItem("adminToken");

            if (!token) {
                navigate("/admin/login");
                return;
            }

            const response = await api.delete(
                `/admin/companies/${companyId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setCompanies((prev) =>
                    prev.filter(
                        (company) =>
                            Number(company.id) !==
                            Number(companyId)
                    )
                );

                if (
                    selectedCompany &&
                    Number(selectedCompany.id) ===
                        Number(companyId)
                ) {
                    setSelectedCompany(null);
                }
            } else {
                setError(
                    response.data.message ||
                    "Failed to delete company."
                );
            }
        } catch (err) {
            console.error(
                "Delete company error:",
                err
            );

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
                "Failed to delete company."
            );
        } finally {
            setDeletingId(null);
        }
    };

    // =========================
    // FILTER
    // =========================
    const filteredCompanies = companies.filter(
        (company) => {
            const searchText = search
                .trim()
                .toLowerCase();

            if (!searchText) {
                return true;
            }

            return (
                company.company_name
                    ?.toLowerCase()
                    .includes(searchText) ||
                company.email
                    ?.toLowerCase()
                    .includes(searchText) ||
                company.phone
                    ?.toLowerCase()
                    .includes(searchText) ||
                company.location
                    ?.toLowerCase()
                    .includes(searchText) ||
                company.website
                    ?.toLowerCase()
                    .includes(searchText)
            );
        }
    );

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
                        className="admin-nav-item"
                        onClick={() =>
                            navigate("/admin/students")
                        }
                    >
                        <span>👨‍🎓</span>
                        <span>Students</span>
                    </button>

                    <button
                        type="button"
                        className="admin-nav-item active"
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
                        <h1>Companies</h1>

                        <p>
                            Manage registered CareerHub companies.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="refresh-btn"
                        onClick={loadCompanies}
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
                            Company Management Error
                        </strong>

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={loadCompanies}
                        >
                            Try Again
                        </button>

                    </div>
                )}

                {/* =========================
                    COMPANY SECTION
                ========================= */}

                <section className="admin-companies-section">

                    {/* TOOLBAR */}
                    <div className="companies-toolbar">

                        <div>
                            <h2>
                                Registered Companies
                            </h2>

                            <p>
                                {companies.length} compan
                                {companies.length !== 1
                                    ? "ies"
                                    : "y"}{" "}
                                registered
                            </p>
                        </div>

                        <div className="company-search-box">

                            <span>🔎</span>

                            <input
                                type="text"
                                placeholder="Search companies..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    </div>

                    {/* CONTENT */}
                    {loading ? (
                        <div className="companies-state">

                            <div className="companies-spinner"></div>

                            <p>
                                Loading companies...
                            </p>

                        </div>
                    ) : filteredCompanies.length === 0 ? (
                        <div className="companies-state">

                            <div className="companies-empty-icon">
                                🏢
                            </div>

                            <h3>
                                {search
                                    ? "No companies found"
                                    : "No companies registered"}
                            </h3>

                            <p>
                                {search
                                    ? "Try a different search term."
                                    : "Registered companies will appear here."}
                            </p>

                        </div>
                    ) : (
                        <div className="companies-table-wrapper">

                            <table className="companies-table">

                                <thead>
                                    <tr>
                                        <th>Company</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Location</th>
                                        <th>Website</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {filteredCompanies.map(
                                        (company) => (
                                            <tr
                                                key={company.id}
                                            >

                                                {/* COMPANY */}
                                                <td>
                                                    <div className="company-name-cell">

                                                        <div className="company-avatar">

                                                            {company.logo ? (
                                                                <img
                                                                    src={
                                                                        company.logo
                                                                    }
                                                                    alt=""
                                                                />
                                                            ) : (
                                                                company.company_name
                                                                    ?.charAt(0)
                                                                    ?.toUpperCase() ||
                                                                "C"
                                                            )}

                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {company.company_name ||
                                                                    "Unnamed Company"}
                                                            </strong>

                                                            <small>
                                                                ID: #
                                                                {company.id}
                                                            </small>
                                                        </div>

                                                    </div>
                                                </td>

                                                {/* EMAIL */}
                                                <td>
                                                    {company.email ||
                                                        "—"}
                                                </td>

                                                {/* PHONE */}
                                                <td>
                                                    {company.phone ||
                                                        "—"}
                                                </td>

                                                {/* LOCATION */}
                                                <td>
                                                    {company.location ||
                                                        "—"}
                                                </td>

                                                {/* WEBSITE */}
                                                <td>
                                                    {company.website ? (
                                                        <a
                                                            href={
                                                                company.website.startsWith(
                                                                    "http"
                                                                )
                                                                    ? company.website
                                                                    : `https://${company.website}`
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="company-website-link"
                                                        >
                                                            Visit
                                                        </a>
                                                    ) : (
                                                        "—"
                                                    )}
                                                </td>

                                                {/* JOINED */}
                                                <td>
                                                    {company.created_at
                                                        ? new Date(
                                                              company.created_at
                                                          ).toLocaleDateString()
                                                        : "—"}
                                                </td>

                                                {/* ACTIONS */}
                                                <td>

                                                    <div className="company-actions">

                                                        <button
                                                            type="button"
                                                            className="view-company-btn"
                                                            onClick={() =>
                                                                setSelectedCompany(
                                                                    company
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="delete-company-btn"
                                                            disabled={
                                                                deletingId ===
                                                                company.id
                                                            }
                                                            onClick={() =>
                                                                handleDeleteCompany(
                                                                    company.id
                                                                )
                                                            }
                                                        >
                                                            {deletingId ===
                                                            company.id
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
                COMPANY DETAILS MODAL
            ========================= */}

            {selectedCompany && (
                <div
                    className="company-modal-overlay"
                    onClick={() =>
                        setSelectedCompany(null)
                    }
                >
                    <div
                        className="company-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="company-modal-header">

                            <div className="company-modal-title">

                                <div className="company-modal-avatar">
                                    {selectedCompany.logo ? (
                                        <img
                                            src={
                                                selectedCompany.logo
                                            }
                                            alt=""
                                        />
                                    ) : (
                                        selectedCompany.company_name
                                            ?.charAt(0)
                                            ?.toUpperCase() ||
                                        "C"
                                    )}
                                </div>

                                <div>
                                    <span>
                                        COMPANY DETAILS
                                    </span>

                                    <h2>
                                        {selectedCompany.company_name ||
                                            "Company"}
                                    </h2>
                                </div>

                            </div>

                            <button
                                type="button"
                                className="company-modal-close"
                                onClick={() =>
                                    setSelectedCompany(
                                        null
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>

                        <div className="company-modal-body">

                            <div className="company-detail-grid">

                                <div className="company-detail-item">
                                    <span>Company Name</span>

                                    <strong>
                                        {selectedCompany.company_name ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="company-detail-item">
                                    <span>Email</span>

                                    <strong>
                                        {selectedCompany.email ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="company-detail-item">
                                    <span>Phone</span>

                                    <strong>
                                        {selectedCompany.phone ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="company-detail-item">
                                    <span>Location</span>

                                    <strong>
                                        {selectedCompany.location ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="company-detail-item">
                                    <span>Website</span>

                                    <strong>
                                        {selectedCompany.website ||
                                            "—"}
                                    </strong>
                                </div>

                                <div className="company-detail-item">
                                    <span>Joined</span>

                                    <strong>
                                        {selectedCompany.created_at
                                            ? new Date(
                                                  selectedCompany.created_at
                                              ).toLocaleDateString()
                                            : "—"}
                                    </strong>
                                </div>

                            </div>

                            <div className="company-detail-full">

                                <span>
                                    Description
                                </span>

                                <p>
                                    {selectedCompany.description ||
                                        "No company description added."}
                                </p>

                            </div>

                        </div>

                        <div className="company-modal-footer">

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedCompany(
                                        null
                                    )
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

export default AdminCompanies;