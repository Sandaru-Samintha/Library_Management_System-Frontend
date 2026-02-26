import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAlert } from '../../context/AlertContext';
import authService from '../../services/authService';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock } from 'react-icons/fi';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    memFullName: '',
    memEmail: '',
    memPassword: '',
    memPhoneNumber: '',
    memAddress: '',
    profileImage: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      profileImage: file
    });
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authService.register(formData);
      
      if (response.code === '00') {
        showSuccess('Registration successful! Please login.');
        navigate('/login');
      } else {
        showError(response.message || 'Registration failed');
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2 className="register-title">Create Account</h2>
        <p className="register-subtitle">Register as a library member</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="memFullName">Full Name *</label>
            <div className="input-group">
              <FiUser className="input-icon" />
              <input
                id="memFullName"
                name="memFullName"
                type="text"
                required
                value={formData.memFullName}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="memEmail">Email *</label>
            <div className="input-group">
              <FiMail className="input-icon" />
              <input
                id="memEmail"
                name="memEmail"
                type="email"
                required
                value={formData.memEmail}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="memPassword">Password *</label>
            <div className="input-group">
              <FiLock className="input-icon" />
              <input
                id="memPassword"
                name="memPassword"
                type="password"
                required
                value={formData.memPassword}
                onChange={handleChange}
                placeholder="Enter your password"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="memPhoneNumber">Phone Number</label>
            <div className="input-group">
              <FiPhone className="input-icon" />
              <input
                id="memPhoneNumber"
                name="memPhoneNumber"
                type="tel"
                value={formData.memPhoneNumber}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="memAddress">Address</label>
            <div className="input-group">
              <FiMapPin className="input-icon" />
              <textarea
                id="memAddress"
                name="memAddress"
                value={formData.memAddress}
                onChange={handleChange}
                placeholder="Enter your address"
                rows="3"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="profileImage">Profile Image</label>
            <input
              id="profileImage"
              name="profileImage"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            {previewImage && (
              <div className="image-preview">
                <img src={previewImage} alt="Preview" />
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="form-register-btn">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <div className="login-link">
          <Link to="/login">Already have an account? Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;