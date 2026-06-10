import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { ShieldCheck, UserCircle, LogOut } from "lucide-react";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateApplication from "./pages/CreateApplication";
import MyApplications from "./pages/MyApplications";
import UploadDocument from "./pages/UploadDocument";
import OfficerDashboard from "./pages/OfficerDashboard";
import GateDashboard from "./pages/GateDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Footer from "./components/Footer";

function Home() {
  return (
    <div className="container">
      <section className="hero">
        <div>
          <div className="hero-badge">AI-Enabled Passport Automation</div>

          <h1 className="hero-title">
            Smart Passport Processing, Verification & Queue Management.
          </h1>

          <p className="hero-text">
            PassSeva digitizes passport office operations with OCR-based
            document verification, QR-based check-in, officer approval workflow,
            and intelligent queue allocation.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>

            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-top">
            <div>
              <div className="mini-label">System Status</div>
              <div className="big-number">Live</div>
            </div>

            <div className="icon-box">
              <ShieldCheck size={26} />
            </div>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <h4>OCR Verification</h4>
              <p>Extracts and compares document data with applicant details.</p>
            </div>

            <div className="feature-item">
              <h4>QR Check-In</h4>
              <p>Verified applicants receive secure QR tokens for office entry.</p>
            </div>

            <div className="feature-item">
              <h4>Smart Queue</h4>
              <p>Assigns queue number, counter, and estimated wait time.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Navbar() {
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  const isLoggedIn = Boolean(role);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <div className="logo-mark">PS</div>
        <span>PassSeva</span>
      </Link>

      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>

        {!isLoggedIn && (
          <>
            <Link to="/register" className="nav-link">Register</Link>
            <Link to="/login" className="nav-link">Login</Link>
          </>
        )}

        {role === "applicant" && (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/my-applications" className="nav-link">My Applications</Link>
          </>
        )}

        {role === "officer" && (
          <Link to="/officer-dashboard" className="nav-link">
            Officer Dashboard
          </Link>
        )}

        {role === "gate" && (
          <Link to="/gate-dashboard" className="nav-link">
            Gate Dashboard
          </Link>
        )}

        {role === "admin" && (
          <Link to="/admin-dashboard" className="nav-link">
            Admin Dashboard
          </Link>
        )}

        {isLoggedIn && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "14px",
                background: "#edf4ff",
                color: "#0f2f57",
                fontWeight: "700",
                fontSize: "13px",
              }}
            >
              <UserCircle size={18} />
              <div>
                <div>{name}</div>
                <div style={{ fontSize: "11px", color: "#66728c" }}>
                  {role}
                </div>
              </div>
            </div>

            <button className="btn btn-secondary" onClick={logout}>
              <LogOut size={16} /> Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

function ProtectedRoute({ allowedRole, children }) {
  const role = localStorage.getItem("role");

  if (!role) {
    return (
      <div className="container">
        <div className="card">
          <h2>Login Required</h2>
          <p className="page-subtitle">
            Please login to access this page.
          </p>

          <br />

          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (role !== allowedRole) {
    return (
      <div className="container">
        <div className="card">
          <h2>Unauthorized Access</h2>
          <p className="page-subtitle">
            You do not have permission to access this dashboard.
          </p>

          <br />

          <Link to="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <div className="page">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              localStorage.getItem("role") ? (
                <Dashboard />
              ) : (
                <ProtectedRoute allowedRole="applicant">
                  <Dashboard />
                </ProtectedRoute>
              )
            }
          />

          <Route
            path="/create-application"
            element={
              <ProtectedRoute allowedRole="applicant">
                <CreateApplication />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-applications"
            element={
              <ProtectedRoute allowedRole="applicant">
                <MyApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/upload-document/:applicationId"
            element={
              <ProtectedRoute allowedRole="applicant">
                <UploadDocument />
              </ProtectedRoute>
            }
          />

          <Route
            path="/officer-dashboard"
            element={
              <ProtectedRoute allowedRole="officer">
                <OfficerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gate-dashboard"
            element={
              <ProtectedRoute allowedRole="gate">
                <GateDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;