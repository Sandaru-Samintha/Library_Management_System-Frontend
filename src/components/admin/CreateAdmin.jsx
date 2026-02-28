import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAlert } from '../../context/AlertContext';
import adminService from '../../services/adminService';
import { FiUser, FiMail, FiLock, FiPhone, FiBriefcase, FiCamera, FiArrowLeft } from 'react-icons/fi';
import './CreateAdmin.css';

const CreateAdmin = () => {
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    adminFullName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    adminPhoneNumber: '',
    adminDepartment: '',
    profileImage: null
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear password error when typing
    if (name === 'adminPassword' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        showError('Please select a valid image file (JPEG, PNG, GIF)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('Image size should be less than 5MB');
        return;
      }

      setFormData({
        ...formData,
        profileImage: file
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    // Check if passwords match
    if (formData.adminPassword !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }

    // Check password strength (optional)
    if (formData.adminPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return false;
    }

    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.adminEmail)) {
      showError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare data for API
      const adminData = {
        adminFullName: formData.adminFullName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
        adminPhoneNumber: formData.adminPhoneNumber,
        adminDepartment: formData.adminDepartment,
        profileImage: formData.profileImage
      };

      console.log('Creating admin with data:', adminData);
      
      const response = await adminService.createAdmin(adminData);
      console.log('Create admin response:', response);

      if (response.code === '00') {
        showSuccess('Admin created successfully!');
        // Navigate back to admin list or dashboard
        setTimeout(() => {
          navigate('/admin/members'); // or '/admin/dashboard'
        }, 2000);
      } else {
        showError(response.message || 'Failed to create admin');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to create admin. Please try again.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setFormData({
      ...formData,
      profileImage: null
    });
    setImagePreview(null);
    document.getElementById('profileImage').value = '';
  };

  return (
    <div className="create-admin-container">
      <div className="create-admin-card">
        <div className="card-header">
          <Link to="/admin/dashboard" className="back-link">
            <FiArrowLeft /> Back to Dashboard
          </Link>
          <h1>Create New Admin</h1>
          <p className="subtitle">Add a new administrator to the system</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="adminFullName">
                <FiUser className="input-icon" />
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="adminFullName"
                name="adminFullName"
                value={formData.adminFullName}
                onChange={handleChange}
                placeholder="Enter full name"
                required
                maxLength="100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="adminEmail">
                <FiMail className="input-icon" />
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                id="adminEmail"
                name="adminEmail"
                value={formData.adminEmail}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="adminPassword">
                <FiLock className="input-icon" />
                Password <span className="required">*</span>
              </label>
              <input
                type="password"
                id="adminPassword"
                name="adminPassword"
                value={formData.adminPassword}
                onChange={handleChange}
                placeholder="Enter password"
                required
                minLength="6"
              />
              <small>Minimum 6 characters</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <FiLock className="input-icon" />
                Confirm Password <span className="required">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
              />
              {passwordError && (
                <div className="error-message">{passwordError}</div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="adminPhoneNumber">
                <FiPhone className="input-icon" />
                Phone Number
              </label>
              <input
                type="tel"
                id="adminPhoneNumber"
                name="adminPhoneNumber"
                value={formData.adminPhoneNumber}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="adminDepartment">
                <FiBriefcase className="input-icon" />
                Department
              </label>
              <input
                type="text"
                id="adminDepartment"
                name="adminDepartment"
                value={formData.adminDepartment}
                onChange={handleChange}
                placeholder="Enter department"
              />
            </div>
          </div>

          <div className="form-group image-upload-group">
            <label>Profile Image</label>
            <div className="image-upload-container">
              {imagePreview ? (
                <div className="image-preview-wrapper">
                  <img 
                    src={imagePreview} 
                    alt="Profile preview" 
                    className="image-preview"
                  />
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={clearImage}
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <FiCamera className="upload-icon" />
                  <p>Click to upload profile image</p>
                  <small>JPG, PNG or GIF (max. 5MB)</small>
                </div>
              )}
              <input
                type="file"
                id="profileImage"
                name="profileImage"
                accept="image/jpeg,image/png,image/jpg,image/gif"
                onChange={handleFileChange}
                className="file-input"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/admin/dashboard')}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                'Create Admin'
              )}
            </button>
          </div>
        </form>

        {/* <div className="card-footer">
          <p className="note">
            <span className="required">*</span> Required fields
          </p>
          <p className="note">
            The new admin will receive their login credentials via email (if email service is configured)
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default CreateAdmin;