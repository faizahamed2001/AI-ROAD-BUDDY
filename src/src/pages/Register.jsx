import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveUserToStorage } from '../utils/auth';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.firstname.trim()) {
      newErrors.firstname = 'First name is required';
    }
    if (!formData.lastname.trim()) {
      newErrors.lastname = 'Last name is required';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { confirmPassword, ...userData } = formData;
      const result = saveUserToStorage(userData);

      if (result.success) {
        alert('Registration successful! Please login with your credentials.');
        navigate('/');
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred during registration' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-bg">
      <div className="register-bg-image">
        <div className="welcome-overlay">
          <h1>Welcome to MobUrb</h1>
          <p>Transform your urban mobility experience with our smart solutions</p>
        </div>
      </div>
      <div className="register-container">
        <h2>Create Account</h2>
        {errors.general && (
          <div className="error-message general-error">
            {errors.general}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="name-row">
            <div className="input-group">
              <input
                type="text"
                name="firstname"
                className={`input ${errors.firstname ? 'error' : ''}`}
                placeholder="First Name"
                value={formData.firstname}
                onChange={handleChange}
              />
              {errors.firstname && (
                <span className="error-message">{errors.firstname}</span>
              )}
            </div>
            <div className="input-group">
              <input
                type="text"
                name="lastname"
                className={`input ${errors.lastname ? 'error' : ''}`}
                placeholder="Last Name"
                value={formData.lastname}
                onChange={handleChange}
              />
              {errors.lastname && (
                <span className="error-message">{errors.lastname}</span>
              )}
            </div>
          </div>
          
          <div className="input-group">
            <input
              type="text"
              name="username"
              className={`input ${errors.username ? 'error' : ''}`}
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && (
              <span className="error-message">{errors.username}</span>
            )}
          </div>

          <div className="input-group">
            <input
              type="email"
              name="email"
              className={`input ${errors.email ? 'error' : ''}`}
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              className={`input ${errors.password ? 'error' : ''}`}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="input-group">
            <input
              type="password"
              name="confirmPassword"
              className={`input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <button 
            className="input register-btn" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Register'}
          </button>
          
          <button 
            className="input login-link-btn" 
            type="button" 
            onClick={() => navigate('/')}
          >
            Already have an account? Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
