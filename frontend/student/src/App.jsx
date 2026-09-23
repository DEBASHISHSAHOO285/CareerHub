import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import StudentRegister from "./pages/studentRegister";

import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";

import CompanyLogin from "./pages/CompanyLogin";
import CompanyRegister from "./pages/CompanyRegister";
import CompanyDashboard from "./pages/CompanyDashboard";
import PostJob from "./pages/PostJob";
import CompanyJobs from "./pages/CompanyJobs";
import CompanyApplicants from "./pages/CompanyApplicants";
import CompanyProfile from "./pages/CompanyProfile";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import SavedJobs from "./pages/SavedJobs";
import Applications from "./pages/Applications";
import Interviews from "./pages/Interviews";
import Profile from "./pages/Profile";
import CompanyJobDetails from "./pages/CompanyJobDetails";
import CompanyJobEdit from "./pages/CompanyJobEdit";
import AdminStudents from "./pages/AdminStudents";
import AdminCompanies from "./pages/AdminCompanies";
import AdminJobs from "./pages/AdminJobs";
import AdminApplications from "./pages/AdminApplications";
import AdminInterviews from "./pages/AdminInterviews";
import CompanyInterviews from "./pages/CompanyInterviews";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* =========================
                    STUDENT
                ========================= */}

                <Route
                    path="/"
                    element={<Landing />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<StudentRegister />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/jobs"
                    element={<Jobs />}
                />

                <Route
                    path="/jobs/:id"
                    element={<JobDetails />}
                />


                {/* =========================
                    COMPANY AUTH
                ========================= */}

                <Route
                    path="/company/login"
                    element={<CompanyLogin />}
                />

                <Route
                    path="/company/register"
                    element={<CompanyRegister />}
                />


                {/* =========================
                    COMPANY DASHBOARD
                ========================= */}

                <Route
                    path="/company/dashboard"
                    element={<CompanyDashboard />}
                />

                <Route
                    path="/company/post-job"
                    element={<PostJob />}
                />

                {/* Manage Jobs */}

                <Route
                    path="/company/jobs"
                    element={<CompanyJobs />}
                />

                {/* Applicants for specific job */}

                <Route
                    path="/company/jobs/:jobId/applicants"
                    element={<CompanyApplicants />}
                />

                {/* Applicants menu */}

                <Route
                    path="/company/applicants"
                    element={<CompanyApplicants />}
                />

                {/* Company Profile */}

                <Route
                    path="/company/profile"
                    element={<CompanyProfile />}
                />

                {/* admin Login */}

                <Route
    path="/admin/login"
    element={<AdminLogin />}

/>

<Route
    path="/admin/dashboard"
    element={<AdminDashboard />}
/>

<Route
    path="/forgot-password"
    element={<ForgotPassword />}
/>

<Route
    path="/saved-jobs"
    element={<SavedJobs />}
/>

<Route
    path="/company/jobs/:jobId"
    element={<CompanyJobDetails />}
/>

<Route
    path="/company/jobs/:jobId/edit"
    element={<CompanyJobEdit />}
/>

<Route path="/applications" element={<Applications />} />
<Route path="/interviews" element={<Interviews />} />
<Route path="/profile" element={<Profile />} />

<Route
    path="/admin/students"
    element={<AdminStudents />}
/>

<Route
    path="/admin/companies"
    element={<AdminCompanies />}
/>

<Route
    path="/admin/jobs"
    element={<AdminJobs />}
/>

<Route
    path="/admin/applications"
    element={<AdminApplications />}
/>

<Route
    path="/admin/interviews"
    element={<AdminInterviews />}
/>

<Route
    path="/company/interviews"
    element={<CompanyInterviews />}
/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;