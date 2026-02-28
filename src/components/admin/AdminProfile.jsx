import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import adminService from '../../services/adminService';
import LoadingSpinner from '../common/LoadingSpinner';
import { 
  FiUser, FiMail, FiPhone, FiBriefcase, FiCalendar, 
  FiCamera, FiLock, FiSave, FiArrowLeft, FiEdit2 
} from 'react-icons/fi';
import './AdminProfile.css';

const AdminProfile = () => {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  
  const [formData, setFormData] = useState({
    adminFullName: '',
    adminEmail: '',
    adminPhoneNumber: '',
    adminDepartment: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profileImage: null
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [passwordError, setPasswordError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAdminProfile();
      console.log('Profile response:', response);
      
      if (response.code === '00') {
        setProfile(response.content);
        // Initialize form with profile data
        setFormData({
          adminFullName: response.content.adminFullName || '',
          adminEmail: response.content.adminEmail || '',
          adminPhoneNumber: response.content.adminPhoneNumber || '',
          adminDepartment: response.content.adminDepartment || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          profileImage: null
        });
        
        // Set image preview if exists
        if (response.content.profileImageUrl) {
          const baseUrl = process.env.REACT_APP_IMAGE_URL || 'http://localhost:8080';
          setImagePreview(`${baseUrl}${response.content.profileImageUrl}`);
        }
      } else {
        showError('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showError('Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear password errors when typing
    if (name === 'newPassword' || name === 'confirmPassword' || name === 'currentPassword') {
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

  const validatePassword = () => {
    if (changePassword) {
      if (!formData.currentPassword) {
        setPasswordError('Current password is required');
        return false;
      }
      if (formData.newPassword.length < 6) {
        setPasswordError('New password must be at least 6 characters');
        return false;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setPasswordError('New passwords do not match');
        return false;
      }
    }
    return true;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!validateEmail(formData.adminEmail)) {
      showError('Please enter a valid email address');
      return;
    }

    // Validate password if changing
    if (!validatePassword()) {
      return;
    }

    setSaving(true);

    try {
      // Prepare data for API
      const profileData = {
        adminFullName: formData.adminFullName,
        adminEmail: formData.adminEmail,
        adminPhoneNumber: formData.adminPhoneNumber,
        adminDepartment: formData.adminDepartment,
        profileImage: formData.profileImage
      };

      // Add password if changing
      if (changePassword && formData.newPassword) {
        profileData.adminPassword = formData.newPassword;
      }

      console.log('Updating profile with data:', profileData);
      
      const response = await adminService.updateAdminProfile(profileData);
      console.log('Update response:', response);

      if (response.code === '00') {
        showSuccess('Profile updated successfully!');
        
        // Refresh profile data
        await fetchProfile();
        
        // Reset form states
        setEditMode(false);
        setChangePassword(false);
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        showError(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to update profile. Please try again.';
      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original profile data
    if (profile) {
      setFormData({
        adminFullName: profile.adminFullName || '',
        adminEmail: profile.adminEmail || '',
        adminPhoneNumber: profile.adminPhoneNumber || '',
        adminDepartment: profile.adminDepartment || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        profileImage: null
      });
      
      // Reset image preview
      if (profile.profileImageUrl) {
        const baseUrl = process.env.REACT_APP_IMAGE_URL || 'http://localhost:8080';
        setImagePreview(`${baseUrl}${profile.profileImageUrl}`);
      } else {
        setImagePreview(null);
      }
    }
    
    setEditMode(false);
    setChangePassword(false);
    setPasswordError('');
  };

  const clearImage = () => {
    setFormData({
      ...formData,
      profileImage: null
    });
    
    // Reset to original image
    if (profile?.profileImageUrl) {
      const baseUrl = process.env.REACT_APP_IMAGE_URL || 'http://localhost:8080';
      setImagePreview(`${baseUrl}${profile.profileImageUrl}`);
    } else {
      setImagePreview(null);
    }
    
    document.getElementById('profileImage').value = '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="admin-profile-container">
      <div className="admin-profile-card">
        <div className="admin-profile-header">
          <Link to="/admin/dashboard" className="admin-profile-back-link">
            <FiArrowLeft /> Back to Dashboard
          </Link>
          
          <div className="admin-profile-header-content">
            <h1 className="admin-profile-title">Admin Profile</h1>
            {!editMode ? (
              <button 
                className="admin-profile-edit-btn"
                onClick={() => setEditMode(true)}
              >
                <FiEdit2 /> Edit Profile
              </button>
            ) : (
              <button 
                className="admin-profile-cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="admin-profile-content">
          {/* Profile Image Section */}
          <div className="admin-profile-image-section">
            <div className="admin-profile-image-container">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt={profile?.adminFullName} 
                  className="admin-profile-image"
                />
              ) : (
                <div className="admin-profile-image-placeholder">
                  {profile?.adminFullName?.charAt(0) || 'A'}
                </div>
              )}
              
              {editMode && (
                <div className="admin-profile-image-overlay">
                  <label htmlFor="profileImage" className="admin-profile-image-label">
                    <FiCamera />
                    <span>Change Photo</span>
                  </label>
                  <input
                    type="file"
                    id="profileImage"
                    name="profileImage"
                    accept="image/jpeg,image/png,image/jpg,image/gif"
                    onChange={handleFileChange}
                    className="admin-profile-file-input"
                  />
                  {formData.profileImage && (
                    <button 
                      type="button" 
                      className="admin-profile-remove-image"
                      onClick={clearImage}
                      title="Reset to original"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {!editMode && (
              <div className="admin-profile-role">
                <span className="admin-profile-role-badge">Administrator</span>
              </div>
            )}
          </div>

          {/* Profile Details Form */}
          <form onSubmit={handleSubmit} className="admin-profile-form">
            <div className="admin-profile-form-grid">
              {/* Full Name */}
              <div className="admin-profile-form-group">
                <label className="admin-profile-form-label">
                  <FiUser className="admin-profile-input-icon" />
                  Full Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="adminFullName"
                    value={formData.adminFullName}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="admin-profile-form-input"
                  />
                ) : (
                  <p className="admin-profile-info-text">{profile?.adminFullName || 'Not set'}</p>
                )}
              </div>

              {/* Email */}
              <div className="admin-profile-form-group">
                <label className="admin-profile-form-label">
                  <FiMail className="admin-profile-input-icon" />
                  Email Address
                </label>
                {editMode ? (
                  <input
                    type="email"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    className="admin-profile-form-input"
                  />
                ) : (
                  <p className="admin-profile-info-text">{profile?.adminEmail || 'Not set'}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="admin-profile-form-group">
                <label className="admin-profile-form-label">
                  <FiPhone className="admin-profile-input-icon" />
                  Phone Number
                </label>
                {editMode ? (
                  <input
                    type="tel"
                    name="adminPhoneNumber"
                    value={formData.adminPhoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="admin-profile-form-input"
                  />
                ) : (
                  <p className="admin-profile-info-text">{profile?.adminPhoneNumber || 'Not set'}</p>
                )}
              </div>

              {/* Department */}
              <div className="admin-profile-form-group">
                <label className="admin-profile-form-label">
                  <FiBriefcase className="admin-profile-input-icon" />
                  Department
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="adminDepartment"
                    value={formData.adminDepartment}
                    onChange={handleChange}
                    placeholder="Enter your department"
                    className="admin-profile-form-input"
                  />
                ) : (
                  <p className="admin-profile-info-text">{profile?.adminDepartment || 'Not set'}</p>
                )}
              </div>

              {/* Created Date (Read-only) */}
              <div className="admin-profile-form-group">
                <label className="admin-profile-form-label">
                  <FiCalendar className="admin-profile-input-icon" />
                  Created Date
                </label>
                <p className="admin-profile-info-text admin-profile-info-muted">
                  {formatDate(profile?.createdDate)}
                </p>
              </div>

              {/* Last Updated (Read-only) */}
              <div className="admin-profile-form-group">
                <label className="admin-profile-form-label">
                  <FiCalendar className="admin-profile-input-icon" />
                  Last Updated
                </label>
                <p className="admin-profile-info-text admin-profile-info-muted">
                  {formatDate(profile?.updatedDate)}
                </p>
              </div>
            </div>

            {/* Password Change Section */}
            {editMode && (
              <div className="admin-profile-password-section">
                <div className="admin-profile-password-header">
                  <h3 className="admin-profile-password-title">Change Password</h3>
                  <button
                    type="button"
                    className="admin-profile-toggle-password"
                    onClick={() => setChangePassword(!changePassword)}
                  >
                    {changePassword ? 'Cancel' : 'Change Password'}
                  </button>
                </div>

                {changePassword && (
                  <div className="admin-profile-password-fields">
                    <div className="admin-profile-form-group">
                      <label className="admin-profile-form-label">
                        <FiLock className="admin-profile-input-icon" />
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        placeholder="Enter current password"
                        required={changePassword}
                        className="admin-profile-form-input"
                      />
                    </div>

                    <div className="admin-profile-password-row">
                      <div className="admin-profile-form-group">
                        <label className="admin-profile-form-label">
                          <FiLock className="admin-profile-input-icon" />
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          placeholder="Enter new password"
                          minLength="6"
                          required={changePassword}
                          className="admin-profile-form-input"
                        />
                        <small className="admin-profile-input-hint">Minimum 6 characters</small>
                      </div>

                      <div className="admin-profile-form-group">
                        <label className="admin-profile-form-label">
                          <FiLock className="admin-profile-input-icon" />
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm new password"
                          required={changePassword}
                          className="admin-profile-form-input"
                        />
                      </div>
                    </div>

                    {passwordError && (
                      <div className="admin-profile-error-message">{passwordError}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Form Actions */}
            {editMode && (
              <div className="admin-profile-form-actions">
                <button 
                  type="button" 
                  className="admin-profile-btn admin-profile-btn-secondary"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="admin-profile-btn admin-profile-btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="admin-profile-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave /> Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Account Actions */}
        <div className="admin-profile-footer">
          <button 
            className="admin-profile-btn admin-profile-btn-danger"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;