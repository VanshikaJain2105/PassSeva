import { useEffect, useState } from "react";
import axios from "axios";
import {
  CalendarDays,
  FileText,
  UploadCloud,
  QrCode,
  Clock,
  Building2,
  User,
} from "lucide-react";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [qrData, setQrData] = useState({});
  const [queueData, setQueueData] = useState({});
  const email = localStorage.getItem("email");

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/applications/${email}`);
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

  const generateQR = async (applicationId) => {
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/generate-qr/${applicationId}`
      );

      setQrData({
        ...qrData,
        [applicationId]: res.data,
      });

      alert(res.data.message);
      fetchMyApplications();
    } catch (err) {
      alert(err.response?.data?.detail || "QR generation failed");
    }
  };

  const fetchQueueDetails = async (applicationId) => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/application/${applicationId}/queue`
      );

      setQueueData({
        ...queueData,
        [applicationId]: res.data,
      });
    } catch (err) {
      alert("Failed to fetch queue details");
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Passport Applications</h1>
          <p className="page-subtitle">
            Track document verification, QR check-in and queue assignment.
          </p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="card">
          <h3>No applications found</h3>
          <p className="page-subtitle">
            Create a passport application to begin your PassSeva journey.
          </p>
        </div>
      ) : (
        <div className="grid">
          {applications.map((app) => (
            <div key={app._id} className="card">
              <div className="page-header" style={{ marginBottom: "18px" }}>
                <div>
                  <h3 style={{ margin: 0, color: "#0f2f57" }}>
                    Passport Application
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
                  <p><b>Name</b></p>
                  <p>{app.full_name}</p>
                </div>

                <div className="info-box">
                  <FileText size={20} />
                  <p><b>Passport Type</b></p>
                  <p>{app.passport_type}</p>
                </div>

                <div className="info-box">
                  <CalendarDays size={20} />
                  <p><b>Appointment Date</b></p>
                  <p>{app.appointment_date}</p>
                </div>
              </div>

              {app.officer_remarks && (
                <div className="info-box">
                  <b>Officer Remarks</b>
                  <p>{app.officer_remarks}</p>
                </div>
              )}

              <div style={{ marginTop: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {["Submitted", "Documents Uploaded"].includes(app.status) && (
                  <a
                    href={`/upload-document/${app._id}`}
                    className="btn btn-secondary"
                  >
                    <UploadCloud size={16} /> Upload Documents
                  </a>
                )}

                {app.status === "Verified" && (
                  <button
                    className="btn btn-primary"
                    onClick={() => generateQR(app._id)}
                  >
                    <QrCode size={16} /> Generate QR
                  </button>
                )}

                {app.status === "Checked-In" && (
                  <button
                    className="btn btn-primary"
                    onClick={() => fetchQueueDetails(app._id)}
                  >
                    <Clock size={16} /> View Queue Details
                  </button>
                )}
              </div>

              {qrData[app._id] && (
                <div className="info-box">
                  <h3 style={{ marginTop: 0 }}>QR Check-In Token</h3>

                  <p>
                    <b>Token:</b> {qrData[app._id].token}
                  </p>

                  <img
                    src={`http://127.0.0.1:8000/${qrData[app._id].qr_path}`}
                    alt="QR Code"
                    style={{
                      width: "180px",
                      height: "180px",
                      border: "1px solid #d8e2f0",
                      padding: "10px",
                      borderRadius: "14px",
                      background: "white",
                    }}
                  />
                </div>
              )}

              {queueData[app._id] && queueData[app._id].queue_found && (
                <div className="info-box">
                  <h3 style={{ marginTop: 0 }}>Queue Details</h3>

                  <div className="grid grid-3">
                    <div>
                      <Clock size={20} />
                      <p><b>Queue Number</b></p>
                      <h2>{queueData[app._id].queue_number}</h2>
                    </div>

                    <div>
                      <Building2 size={20} />
                      <p><b>Counter</b></p>
                      <h2>{queueData[app._id].counter_number}</h2>
                    </div>

                    <div>
                      <Clock size={20} />
                      <p><b>Wait Time</b></p>
                      <h2>{queueData[app._id].estimated_wait_time} min</h2>
                    </div>
                  </div>

                  <p>
                    <b>Queue Status:</b> {queueData[app._id].status}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyApplications;