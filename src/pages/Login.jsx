import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginRegister.css';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ userOrEmail: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = e => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => (u.email === form.userOrEmail || u.username === form.userOrEmail) && u.password === form.password);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      navigate('/main');
    } else {
      setError('Login failed. Invalid credentials.');
    }
  };

  return (
    <div className="login-register-bg">
      <div className="login-bg-image" />
      <div className="login-register-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="userOrEmail" className='input' placeholder="Username or Email" value={form.userOrEmail} onChange={handleChange} required />
          <input type="password" name="password" className='input' placeholder="Password" value={form.password} onChange={handleChange} required />
          <button className='input' type="submit">Login</button>
        </form>
        {error && <div className="error-msg">{error}</div>}
        <button className='input' type="button" onClick={() => navigate('/register')}>Don't have an account? Register</button>
      </div>
    </div>
  );
};

export default Login;
