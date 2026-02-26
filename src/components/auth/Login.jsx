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
    role: 'MEMBER'
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

  const handleRoleSelect = (selectedRole) => {
    setFormData({
      ...formData,
      role: selectedRole
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('Login attempt with:', { 
      email: formData.email, 
      role: formData.role 
    });
    
    try {
      const response = await login(formData);
      console.log('Login response:', response);
      
      if (response.code === '00') {
        const user = response.content;
        console.log('User data from backend:', user);
        
        const userRole = user?.role;
        console.log('User role from backend:', userRole);
        console.log('Selected role:', formData.role);
        
        // STRICT ROLE VALIDATION
        if (!userRole) {
          console.error('No role found in user data');
          showError('Unable to determine user role');
          setLoading(false);
          return;
        }
        
        // Case 1: User selected MEMBER but is actually ADMIN
        if (formData.role === 'MEMBER' && userRole === 'ADMIN') {
          console.warn('Role mismatch: Member login attempted with admin account');
          showError('❌ Invalid login: This is an Admin account. Please use Admin login.');
          // Clear any partial authentication
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
          setLoading(false);
          return;
        }
        
        // Case 2: User selected ADMIN but is actually MEMBER
        if (formData.role === 'ADMIN' && userRole === 'MEMBER') {
          console.warn('Role mismatch: Admin login attempted with member account');
          showError('❌ Access denied: This is a Member account. Members cannot access admin panel.');
          // Clear any partial authentication
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
          setLoading(false);
          return;
        }
        
        // Case 3: Valid login - role matches
        if (formData.role === userRole) {
          console.log('Role match successful!');
          showSuccess('Login successful!');
          
          // Redirect based on role
          if (userRole === 'ADMIN') {
            console.log('Redirecting to admin dashboard');
            navigate('/admin/dashboard');
          } else {
            console.log('Redirecting to member dashboard');
            navigate('/member/dashboard');
          }
        } else {
          console.error('Unexpected role mismatch');
          showError('Invalid login credentials');
          setLoading(false);
        }
      } else {
        console.error('Login failed with code:', response.code, 'message:', response.message);
        showError(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
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
            <label>Select Account Type</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${formData.role === 'MEMBER' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('MEMBER')}
              >
                <FiUser className="role-icon" />
                <div className="role-text">
                  <span className="role-title">Member</span>
                  <span className="role-desc">Borrow books, manage profile</span>
                </div>
              </button>
              
              <button
                type="button"
                className={`role-btn ${formData.role === 'ADMIN' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('ADMIN')}
              >
                <FiShield className="role-icon" />
                <div className="role-text">
                  <span className="role-title">Admin</span>
                  <span className="role-desc">Manage library, members, books</span>
                </div>
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
          <Link to="/register">New member? Register here</Link>
        </div>
        
        <div className="admin-note">
          <p>🔒 Admin access is restricted to authorized personnel only</p>
        </div>
      </div>
    </div>
  );
};

export default Login;