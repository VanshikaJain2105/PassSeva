import { useState } from "react";
import axios from "axios";
import { LogIn } from "lucide-react";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://127.0.0.1:8000/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("email", res.data.email);

      alert("Login successful");
      window.location.href = "/dashboard";
    } catch (err) {
      alert(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="container">
      <div className="card form-card">
        <div className="icon-box">
          <LogIn size={24} />
        </div>

        <h2 className="form-title">Login to PassSeva</h2>
        <p className="page-subtitle">
          Access your personalized passport workflow dashboard.
        </p>

        <br />

        <form onSubmit={handleLogin}>
          <input
            className="input"
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
          />

          <input
            className="input"
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
          />

          <button className="btn btn-primary" type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;