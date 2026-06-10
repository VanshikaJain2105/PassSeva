import { useState } from "react";
import axios from "axios";
import { UserPlus } from "lucide-react";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "applicant",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://127.0.0.1:8000/register", form);
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="container">
      <div className="card form-card">
        <div className="icon-box">
          <UserPlus size={24} />
        </div>

        <h2 className="form-title">Create PassSeva Account</h2>
        <p className="page-subtitle">
          Register as an applicant, officer, admin or gate operator.
        </p>

        <br />

        <form onSubmit={handleRegister}>
          <input
            className="input"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
          />

          <input
            className="input"
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
          />

          <input
            className="input"
            name="phone"
            placeholder="Phone Number"
            onChange={handleChange}
          />

          <input
            className="input"
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
          />

          <select name="role" onChange={handleChange}>
            <option value="applicant">Applicant</option>
            <option value="officer">Officer</option>
            <option value="admin">Admin</option>
            <option value="gate">Gate Operator</option>
          </select>

          <button className="btn btn-primary" type="submit">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;