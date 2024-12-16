import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook
import "./LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (role === "admin" && email === "admin@gmail.com" && password === "Admin123") {
      navigate("/admin-dashboard"); // Navigate to Admin Dashboard
    } else if (role === "doctor" && email === "doctor@gmail.com" && password === "Doctor123") {
      navigate("/poc-dashboard"); // Navigate to Doctor/POC Dashboard
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-form">
        <h1 className="login-title">Login</h1>
        <form>
          <div className="form-group">
            <label className="form-label" htmlFor="role">
              Role
            </label>
            <select
              className="form-control"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              className="form-control"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              className="form-control"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            className="login-button"
            type="button"
            onClick={handleLogin}
          >
            Login
          </button>
          {error && <div className="login-error">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
