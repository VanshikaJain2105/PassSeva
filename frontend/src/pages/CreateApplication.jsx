import { useState } from "react";
import axios from "axios";
import {
  FilePlus,
  User,
  MapPin,
  CalendarDays,
  BadgeIndianRupee,
} from "lucide-react";

function CreateApplication() {
  const email = localStorage.getItem("email");

  const [form, setForm] = useState({
    applicant_email: email,
    full_name: "",
    dob: "",
    gender: "",
    nationality: "",
    address: "",
    passport_type: "",
    appointment_date: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/applications",
        form
      );

      alert(res.data.message);
      window.location.href = "/my-applications";
    } catch (err) {
      alert(err.response?.data?.detail || "Application submission failed");
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Create Passport Application</h1>
          <p className="page-subtitle">
            Fill applicant details carefully. These details will later be matched with uploaded documents using OCR verification.
          </p>
        </div>
      </div>

      <div className="card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginBottom: "24px",
          }}
        >
          <div className="icon-box">
            <FilePlus size={24} />
          </div>

          <div>
            <h2 style={{ margin: 0, color: "#0f2f57" }}>
              Passport Application Form
            </h2>
            <p className="page-subtitle">
              Applicant email: {email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="info-box">
            <h3 style={{ marginTop: 0, color: "#0f2f57" }}>
              <User size={18} /> Personal Details
            </h3>

            <div className="grid grid-3">
              <div>
                <label><b>Full Name</b></label>
                <input
                  className="input"
                  name="full_name"
                  placeholder="Enter full name"
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label><b>Date of Birth</b></label>
                <input
                  className="input"
                  type="text"
                  name="dob"
                  placeholder="DD/MM/YYYY"
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label><b>Gender</b></label>
                <select name="gender" onChange={handleChange} required>
                  <option value="">Select gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-3">
              <div>
                <label><b>Nationality</b></label>
                <input
                  className="input"
                  name="nationality"
                  placeholder="Indian"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="info-box">
            <h3 style={{ marginTop: 0, color: "#0f2f57" }}>
              <MapPin size={18} /> Address Details
            </h3>

            <label><b>Residential Address</b></label>
            <textarea
              name="address"
              placeholder="Enter complete residential address"
              onChange={handleChange}
              required
            />
          </div>

          <div className="info-box">
            <h3 style={{ marginTop: 0, color: "#0f2f57" }}>
              <CalendarDays size={18} /> Application & Appointment Details
            </h3>

            <div className="grid grid-3">
              <div>
                <label><b>Passport Type</b></label>
                <select name="passport_type" onChange={handleChange} required>
                  <option value="">Select passport type</option>
                  <option value="Fresh Passport">Fresh Passport</option>
                  <option value="Renewal">Renewal</option>
                  <option value="Tatkal">Tatkal</option>
                  <option value="Minor Passport">Minor Passport</option>
                  <option value="Duplicate Passport">Duplicate Passport</option>
                </select>
              </div>

              <div>
                <label><b>Appointment Date</b></label>
                <input
                  className="input"
                  type="date"
                  name="appointment_date"
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label><b>Fee Status</b></label>
                <div className="input" style={{ background: "#f8fbff" }}>
                  <BadgeIndianRupee size={16} /> Pending Payment Simulation
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "24px",
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button className="btn btn-primary" type="submit">
              Submit Application
            </button>

            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => (window.location.href = "/dashboard")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateApplication;