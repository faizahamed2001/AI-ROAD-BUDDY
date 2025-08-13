import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateLogin } from "../utils/auth";
import "./LoginRegister.css";

const LoginRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password) {
      setError("Please enter both username and password");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = validateLogin(formData.username, formData.password);

      if (result.success) {
        navigate("/main");
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("An error occurred during login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-register-bg">
      <div className="login-bg-image" />
      <div className="login-register-container">
        <div className="box-container">
          <h2>Login</h2>
          {error && <div className="error-message login-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              className="input"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              className="input"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              className="input login-btn"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
            <div className="register-link">
              Not Registered?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/register");
                }}
              >
                Register
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
