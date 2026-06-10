import { Link } from "react-router-dom";
import {
  FilePlus,
  FolderOpen,
  ShieldCheck,
  ScanLine,
  BarChart3,
} from "lucide-react";

function Dashboard() {
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {name || "User"}. Your active role is{" "}
            <b>{role || "not selected"}</b>.
          </p>
        </div>
      </div>

      {role === "applicant" && (
        <div className="grid grid-3">
          <div className="card dashboard-card">
            <div className="icon-box">
              <FilePlus size={24} />
            </div>
            <h3>Create Application</h3>
            <p>Start a new passport application and schedule appointment details.</p>
            <Link to="/create-application" className="btn btn-primary">
              Create Application
            </Link>
          </div>

          <div className="card dashboard-card">
            <div className="icon-box">
              <FolderOpen size={24} />
            </div>
            <h3>My Applications</h3>
            <p>Track application status, upload documents, generate QR and view queue.</p>
            <Link to="/my-applications" className="btn btn-primary">
              View Applications
            </Link>
          </div>
        </div>
      )}

      {role === "officer" && (
        <div className="grid grid-3">
          <div className="card dashboard-card">
            <div className="icon-box">
              <ShieldCheck size={24} />
            </div>
            <h3>Officer Verification</h3>
            <p>Review applications, run OCR, view flags and approve or reject cases.</p>
            <Link to="/officer-dashboard" className="btn btn-primary">
              Open Officer Dashboard
            </Link>
          </div>
        </div>
      )}

      {role === "gate" && (
        <div className="grid grid-3">
          <div className="card dashboard-card">
            <div className="icon-box">
              <ScanLine size={24} />
            </div>
            <h3>Gate Verification</h3>
            <p>Verify applicant QR tokens and assign queue details on check-in.</p>
            <Link to="/gate-dashboard" className="btn btn-primary">
              Open Gate Dashboard
            </Link>
          </div>
        </div>
      )}

      {role === "admin" && (
        <div className="grid grid-3">
          <div className="card dashboard-card">
            <div className="icon-box">
              <BarChart3 size={24} />
            </div>
            <h3>Admin Analytics</h3>
            <p>Monitor applications, verification status, queue metrics and workload.</p>
            <Link to="/admin-dashboard" className="btn btn-primary">
              Open Admin Dashboard
            </Link>
          </div>
        </div>
      )}

      {!role && (
        <div className="card">
          <h3>No active session found</h3>
          <p>Please login to access your dashboard.</p>
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
        </div>
      )}
    </div>
  );
}

export default Dashboard;