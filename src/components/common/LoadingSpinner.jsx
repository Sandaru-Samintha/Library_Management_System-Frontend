import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { FiMail, FiLock, FiUser, FiShield } from 'react-icons/fi';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'MEMBER' // Default to MEMBER
  });
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await login(formData);
      
      if (response.code === '00') {
        const user = response.content;
        const userRole = user?.role; // Get role from backend response
        
        // Strict role validation
        if (!userRole) {
          showError('Unable to determine user role');
          setLoading(false);
          return;
        }
        
        // Validate that the user is logging in with the correct role
        if (formData.role === 'ADMIN' && userRole !== 'ADMIN') {
          showError('Access denied: This account is not registered as an Admin');
          setLoading(false);
          return;
        }
        
        if (formData.role === 'MEMBER' && userRole !== 'MEMBER') {
          showError('Invalid login: Please use Admin login for admin accounts');
          setLoading(false);
          return;
        }
        
        showSuccess('Login successful!');
        
        // Redirect based on actual user role from backend
        if (userRole === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/member/dashboard');
        }
      } else {
        showError(response.message || 'Login failed');
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Library Management System</h2>
        <p className="login-subtitle">Sign in to your account</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="role">Login as</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${formData.role === 'MEMBER' ? 'active' : ''}`}
                onClick={() => setFormData({...formData, role: 'MEMBER'})}
              >
                <FiUser className="role-icon" />
                <span>Member</span>
              </button>
              <button
                type="button"
                className={`role-btn ${formData.role === 'ADMIN' ? 'active' : ''}`}
                onClick={() => setFormData({...formData, role: 'ADMIN'})}
              >
                <FiShield className="role-icon" />
                <span>Admin</span>
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <div className="input-group">
              <FiMail className="input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-group">
              <FiLock className="input-icon" />
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        <div className="register-link">
          <Link to="/register">Don't have an account? Register as Member</Link>
        </div>
        
        {/* Info message for first-time admins */}
        <div className="admin-info" style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>
          <p>Note: Admin accounts can only be created by existing administrators.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;