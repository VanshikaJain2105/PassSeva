import { useEffect, useState } from "react";
import axios from "axios";
import {
  ShieldCheck,
  FileText,
  Search,
  Brain,
  Flag,
  CheckCircle,
  XCircle,
  User,
  CalendarDays,
  FileSearch,
} from "lucide-react";

function OfficerDashboard() {
  const [applications, setApplications] = useState([]);
  const [flags, setFlags] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [documents, setDocuments] = useState([]);
  const [ocrText, setOcrText] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);

  const officerEmail = localStorage.getItem("email");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/officer/applications`);
    setApplications(res.data);
  };

  const getStatusColor = (status) => {
    if (status === "Verified") return "green";
    if (status === "Rejected") return "red";
    if (status === "Checked-In") return "#2563eb";
    if (status === "QR Generated") return "#7c3aed";
    if (status === "Under Verification") return "#f59e0b";
    if (status === "OCR Completed") return "#0891b2";
    if (status === "Documents Uploaded") return "#0d9488";
    return "orange";
  };

  const viewFlags = async (applicationId) => {
    const res = await axios.get(
      `http://127.0.0.1:8000/application/${applicationId}/flags`
    );

    setFlags(res.data);
    setDocuments([]);
    setOcrText("");
    setVerificationResult(null);
    setSelectedApp(applicationId);
  };

  const viewDocuments = async (applicationId) => {
    const res = await axios.get(
      `http://127.0.0.1:8000/application/${applicationId}/documents`
    );

    setDocuments(res.data);
    setFlags([]);
    setOcrText("");
    setVerificationResult(null);
    setSelectedApp(applicationId);
  };

  const runOCR = async (documentId) => {
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/extract-ocr/${documentId}`
      );

      setOcrText(res.data.extracted_text);
      alert(res.data.message || "OCR completed successfully");
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.detail || "OCR failed");
    }
  };

  const runVerification = async (applicationId) => {
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/verify-application/${applicationId}`
      );

      setVerificationResult(res.data);
      setFlags(res.data.flags || []);

      alert(`Verification complete. Flags found: ${res.data.flags_found}`);
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.detail || "Verification failed");
    }
  };

  const approveApplication = async (applicationId) => {
    if (!remarks) {
      alert("Please write officer remarks before approval");
      return;
    }

    await axios.post(
      `http://127.0.0.1:8000/application/${applicationId}/approve`,
      {
        officer_email: officerEmail,
        remarks: remarks,
      }
    );

    alert("Application approved");
    setRemarks("");
    fetchApplications();
  };

  const rejectApplication = async (applicationId) => {
    if (!remarks) {
      alert("Please write rejection remarks before rejecting");
      return;
    }

    await axios.post(
      `http://127.0.0.1:8000/application/${applicationId}/reject`,
      {
        officer_email: officerEmail,
        remarks: remarks,
      }
    );

    alert("Application rejected");
    setRemarks("");
    fetchApplications();
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Officer Verification Dashboard</h1>
          <p className="page-subtitle">
            Review passport applications, run OCR, inspect verification flags and make decisions.
          </p>
        </div>
      </div>

      <div className="grid">
        {applications.map((app) => (
          <div key={app._id} className="card">
            <div className="page-header" style={{ marginBottom: "18px" }}>
              <div>
                <h3 style={{ margin: 0, color: "#0f2f57" }}>
                  {app.full_name}
                </h3>
                <p className="page-subtitle">
                  Application ID: {app._id}
                </p>
              </div>

              <span
                className="status-badge"
                style={{ backgroundColor: getStatusColor(app.status) }}
              >
                {app.status}
              </span>
            </div>

            <div className="grid grid-3">
              <div className="info-box">
                <User size={20} />
                <p><b>Applicant Name</b></p>
                <p>{app.full_name}</p>
              </div>

              <div className="info-box">
                <CalendarDays size={20} />
                <p><b>Date of Birth</b></p>
                <p>{app.dob}</p>
              </div>

              <div className="info-box">
                <FileText size={20} />
                <p><b>Passport Type</b></p>
                <p>{app.passport_type}</p>
              </div>
            </div>

            {app.officer_remarks && (
              <div className="info-box">
                <b>Officer Remarks</b>
                <p>{app.officer_remarks}</p>
              </div>
            )}

            {app.verified_by && (
              <div className="info-box">
                <b>Verified By</b>
                <p>{app.verified_by}</p>
              </div>
            )}

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => viewDocuments(app._id)}
              >
                <FileSearch size={16} /> View Documents
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => viewFlags(app._id)}
              >
                <Flag size={16} /> View Flags
              </button>

              {["OCR Completed", "Under Verification", "Documents Uploaded"].includes(app.status) && (
                <button
                  className="btn btn-primary"
                  onClick={() => runVerification(app._id)}
                >
                  <Brain size={16} /> Run Verification
                </button>
              )}
            </div>

            {["Under Verification"].includes(app.status) && (
              <div className="info-box">
                <h3 style={{ marginTop: 0 }}>Officer Decision</h3>

                <textarea
                  placeholder="Write officer remarks before approval or rejection"
                  value={selectedApp === app._id ? remarks : ""}
                  onChange={(e) => {
                    setSelectedApp(app._id);
                    setRemarks(e.target.value);
                  }}
                />

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    className="btn btn-success"
                    onClick={() => approveApplication(app._id)}
                  >
                    <CheckCircle size={16} /> Approve Application
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() => rejectApplication(app._id)}
                  >
                    <XCircle size={16} /> Reject Application
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedApp && documents.length > 0 && (
        <div className="card" style={{ marginTop: "28px" }}>
          <div className="page-header" style={{ marginBottom: "18px" }}>
            <div>
              <h3 style={{ margin: 0, color: "#0f2f57" }}>Uploaded Documents</h3>
              <p className="page-subtitle">Application ID: {selectedApp}</p>
            </div>
          </div>

          <div className="grid grid-3">
            {documents.map((doc) => (
              <div key={doc._id} className="info-box">
                <FileText size={20} />
                <p><b>Document Type</b></p>
                <p>{doc.document_type}</p>

                <p><b>File Name</b></p>
                <p>{doc.file_name}</p>

                <p><b>Status</b></p>
                <p>{doc.status}</p>

                <button
                  className="btn btn-primary"
                  onClick={() => runOCR(doc._id)}
                >
                  <Search size={16} /> Run OCR
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {ocrText && (
        <div className="card" style={{ marginTop: "28px" }}>
          <h3 style={{ marginTop: 0, color: "#0f2f57" }}>
            Extracted OCR Text
          </h3>

          <div
            className="info-box"
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: "1.7",
            }}
          >
            {ocrText}
          </div>
        </div>
      )}

      {verificationResult && (
        <div className="card" style={{ marginTop: "28px" }}>
          <div className="page-header" style={{ marginBottom: "18px" }}>
            <div>
              <h3 style={{ margin: 0, color: "#0f2f57" }}>
                Verification Result
              </h3>
              <p className="page-subtitle">
                Final Result: <b>{verificationResult.final_result}</b> | Flags Found:{" "}
                <b>{verificationResult.flags_found}</b>
              </p>
            </div>

            <div className="icon-box">
              <ShieldCheck size={24} />
            </div>
          </div>

          {verificationResult.checks && (
            <>
              <h3 style={{ color: "#0f2f57" }}>Verification Checks</h3>

              <div className="grid grid-3">
                {verificationResult.checks.map((check, index) => (
                  <div key={index} className="info-box">
                    <p><b>Field</b></p>
                    <p>{check.field}</p>

                    <p><b>Status</b></p>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor:
                          check.status === "passed"
                            ? "green"
                            : check.status === "failed"
                            ? "red"
                            : "#f59e0b",
                      }}
                    >
                      {check.status}
                    </span>

                    <p><b>Form Value</b></p>
                    <p>{check.form_value}</p>

                    <p><b>OCR Value</b></p>
                    <p>{check.ocr_value}</p>

                    <p><b>Message</b></p>
                    <p>{check.message}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {flags.length > 0 && (
            <>
              <h3 style={{ color: "#0f2f57", marginTop: "28px" }}>
                Verification Flags
              </h3>

              <div className="grid grid-3">
                {flags.map((flag, index) => (
                  <div key={flag._id || index} className="info-box">
                    <Flag size={20} />

                    <p><b>Field</b></p>
                    <p>{flag.field}</p>

                    <p><b>Form Value</b></p>
                    <p>{flag.form_value}</p>

                    <p><b>OCR Value</b></p>
                    <p>{flag.ocr_value}</p>

                    <p><b>Severity</b></p>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor:
                          flag.severity === "critical" ? "red" : "#f59e0b",
                      }}
                    >
                      {flag.severity}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {selectedApp && flags.length > 0 && !verificationResult && (
        <div className="card" style={{ marginTop: "28px" }}>
          <h3 style={{ marginTop: 0, color: "#0f2f57" }}>
            Verification Flags
          </h3>

          <div className="grid grid-3">
            {flags.map((flag) => (
              <div key={flag._id} className="info-box">
                <Flag size={20} />
                <p><b>Field</b></p>
                <p>{flag.field}</p>

                <p><b>Form Value</b></p>
                <p>{flag.form_value}</p>

                <p><b>OCR Value</b></p>
                <p>{flag.ocr_value}</p>

                <p><b>Severity</b></p>
                <span
                  className="status-badge"
                  style={{
                    backgroundColor:
                      flag.severity === "critical" ? "red" : "#f59e0b",
                  }}
                >
                  {flag.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedApp && flags.length === 0 && !verificationResult && documents.length === 0 && (
        <div className="card" style={{ marginTop: "28px" }}>
          <h3 style={{ marginTop: 0, color: "#0f2f57" }}>
            No flags found
          </h3>
          <p className="page-subtitle">
            This application has no verification flags yet.
          </p>
        </div>
      )}
    </div>
  );
}

export default OfficerDashboard;