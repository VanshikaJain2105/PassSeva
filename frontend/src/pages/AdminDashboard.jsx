import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart3,
  FileText,
  UploadCloud,
  ScanText,
  ShieldCheck,
  CheckCircle,
  XCircle,
  QrCode,
  LogIn,
  Flag,
  Clock,
  Users,
  RefreshCw,
} from "lucide-react";

function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/admin/stats");
      setStats(res.data);
    } catch (err) {
      alert("Failed to fetch admin stats");
    }
  };

  if (!stats) {
    return (
      <div className="container">
        <div className="card">
          <h2>Admin Dashboard</h2>
          <p className="page-subtitle">Loading stats...</p>
        </div>
      </div>
    );
  }

  const MetricCard = ({ title, value, icon, color }) => (
    <div className="card dashboard-card">
      <div
        className="icon-box"
        style={{
          background: `${color}18`,
          color: color,
        }}
      >
        {icon}
      </div>

      <h3>{title}</h3>
      <h1 style={{ margin: "10px 0 0", color: "#0f2f57" }}>{value}</h1>
    </div>
  );

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Analytics Dashboard</h1>
          <p className="page-subtitle">
            Monitor application lifecycle, verification workload, QR check-ins and queue performance.
          </p>
        </div>

        <button className="btn btn-primary" onClick={fetchStats}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <h3 style={{ color: "#0f2f57" }}>Application Overview</h3>

      <div className="grid grid-3">
        <MetricCard
          title="Total Applications"
          value={stats.total_applications}
          icon={<BarChart3 size={24} />}
          color="#174ea6"
        />

        <MetricCard
          title="Submitted"
          value={stats.submitted}
          icon={<FileText size={24} />}
          color="#f59e0b"
        />

        <MetricCard
          title="Documents Uploaded"
          value={stats.documents_uploaded}
          icon={<UploadCloud size={24} />}
          color="#0d9488"
        />

        <MetricCard
          title="OCR Completed"
          value={stats.ocr_completed}
          icon={<ScanText size={24} />}
          color="#0891b2"
        />

        <MetricCard
          title="Under Verification"
          value={stats.under_verification}
          icon={<ShieldCheck size={24} />}
          color="#f59e0b"
        />

        <MetricCard
          title="Verified"
          value={stats.verified}
          icon={<CheckCircle size={24} />}
          color="green"
        />

        <MetricCard
          title="Rejected"
          value={stats.rejected}
          icon={<XCircle size={24} />}
          color="#dc2626"
        />

        <MetricCard
          title="QR Generated"
          value={stats.qr_generated}
          icon={<QrCode size={24} />}
          color="#7c3aed"
        />

        <MetricCard
          title="Checked-In"
          value={stats.checked_in}
          icon={<LogIn size={24} />}
          color="#2563eb"
        />
      </div>

      <h3 style={{ color: "#0f2f57", marginTop: "36px" }}>
        Operational Metrics
      </h3>

      <div className="grid grid-3">
        <MetricCard
          title="Total Documents"
          value={stats.total_documents}
          icon={<FileText size={24} />}
          color="#174ea6"
        />

        <MetricCard
          title="Verification Flags"
          value={stats.total_flags}
          icon={<Flag size={24} />}
          color="#dc2626"
        />

        <MetricCard
          title="QR Tokens"
          value={stats.total_qr_tokens}
          icon={<QrCode size={24} />}
          color="#7c3aed"
        />

        <MetricCard
          title="Entry Logs"
          value={stats.total_entry_logs}
          icon={<Users size={24} />}
          color="#2563eb"
        />

        <MetricCard
          title="Queue Entries"
          value={stats.total_queue_entries}
          icon={<Users size={24} />}
          color="#0d9488"
        />

        <MetricCard
          title="Average Wait Time"
          value={`${stats.average_wait_time} min`}
          icon={<Clock size={24} />}
          color="#f59e0b"
        />
      </div>
    </div>
  );
}

export default AdminDashboard;