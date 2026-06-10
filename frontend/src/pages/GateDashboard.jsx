import { useState } from "react";
import axios from "axios";
import {
  QrCode,
  ShieldCheck,
  User,
  Clock,
  Building2,
  CheckCircle,
} from "lucide-react";

function GateDashboard() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState(null);

  const verifyQR = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Please enter QR token");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/verify-qr/${token}`
      );

      setResult(res.data);
      alert(res.data.message);
      setToken("");
    } catch (err) {
      setResult(null);
      alert(err.response?.data?.detail || "QR verification failed");
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gate Operator Dashboard</h1>
          <p className="page-subtitle">
            Verify applicant QR tokens and assign queue details for passport office entry.
          </p>
        </div>
      </div>

      <div
        className="card"
        style={{
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <div className="icon-box">
            <QrCode size={24} />
          </div>

          <div>
            <h2 style={{ margin: 0, color: "#0f2f57" }}>
              QR Verification Portal
            </h2>
            <p className="page-subtitle">
              Enter the applicant's QR token to verify entry.
            </p>
          </div>
        </div>

        <form onSubmit={verifyQR}>
          <input
            className="input"
            placeholder="Enter QR Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />

          <button
            type="submit"
            className="btn btn-primary"
          >
            Verify QR
          </button>
        </form>
      </div>

      {result && (
        <div
          className="card"
          style={{
            marginTop: "30px",
            border: "2px solid #16a34a",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <div
              className="icon-box"
              style={{
                background: "#dcfce7",
                color: "#16a34a",
              }}
            >
              <CheckCircle size={24} />
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#16a34a",
                }}
              >
                Entry Verified
              </h2>

              <p className="page-subtitle">
                Applicant successfully checked in.
              </p>
            </div>
          </div>

          <div className="grid grid-3">
            <div className="info-box">
              <ShieldCheck size={20} />
              <p><b>Application ID</b></p>
              <p>{result.application_id}</p>
            </div>

            <div className="info-box">
              <User size={20} />
              <p><b>Applicant Name</b></p>
              <p>{result.applicant_name}</p>
            </div>

            <div className="info-box">
              <CheckCircle size={20} />
              <p><b>Status</b></p>
              <p>{result.status}</p>
            </div>
          </div>

          <h3
            style={{
              marginTop: "30px",
              color: "#0f2f57",
            }}
          >
            Queue Assignment
          </h3>

          <div className="grid grid-3">
            <div className="info-box">
              <Clock size={20} />
              <p><b>Queue Number</b></p>
              <h2>{result.queue_number}</h2>
            </div>

            <div className="info-box">
              <Building2 size={20} />
              <p><b>Counter Number</b></p>
              <h2>{result.counter_number}</h2>
            </div>

            <div className="info-box">
              <Clock size={20} />
              <p><b>Estimated Wait Time</b></p>
              <h2>{result.estimated_wait_time} min</h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GateDashboard;