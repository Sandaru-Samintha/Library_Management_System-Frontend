import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import memberService from '../../services/memberService';
import borrowService from '../../services/borrowService';
import fineService from '../../services/fineService';
import LoadingSpinner from '../common/LoadingSpinner';
import { 
  FiUser,FiBook, FiDollarSign, 
  FiEdit2, FiSave, FiX, FiCamera 
} from 'react-icons/fi';
import './MemberProfile.css';

const MemberProfile = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useAlert();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({
    totalBorrowed: 0,
    currentBorrowed: 0,
    overdueBooks: 0,
    totalFines: 0,
    paidFines: 0,
    unpaidFines: 0
  });
  
  const [formData, setFormData] = useState({
    memFullName: '',
    memPhoneNumber: '',
    memAddress: '',
    memPassword: '',
    confirmPassword: '',
    profileImage: null
  });
  
  const [previewImage, setPreviewImage] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchProfileData();
    fetchMemberStats();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await memberService.getProfile();
      
      if (response.code === '00') {
        setProfile(response.content);
        // Initialize form with profile data
        setFormData({
          memFullName: response.content.memFullName || '',
          memPhoneNumber: response.content.memPhoneNumber || '',
          memAddress: response.content.memAddress || '',
          memPassword: '',
          confirmPassword: '',
          profileImage: null
        });
      } else {
        showError(response.message || 'Failed to load profile');
      }
    } catch (error) {
      showError('Error loading profile');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberStats = async () => {
    try {
      // Get borrowed books
      const borrowedResponse = await borrowService.getMyBorrowedBooks();
      const borrowedBooks = borrowedResponse.code === '00' ? borrowedResponse.content : [];
      
      // Get borrow history
      const historyResponse = await borrowService.getMyBorrowHistory();
      const history = historyResponse.code === '00' ? historyResponse.content : [];
      
      // Get fines
      const finesResponse = await fineService.getMyFines();
      const fines = finesResponse.code === '00' ? finesResponse.content : [];
      
      // Calculate stats
      const currentBorrowed = borrowedBooks.length;
      const overdueBooks = borrowedBooks.filter(book => book.status === 'OVERDUE').length;
      const totalFines = fines.reduce((sum, fine) => sum + (fine.amount || 0), 0);
      const paidFines = fines.filter(f => f.status === 'PAID').reduce((sum, fine) => sum + (fine.amount || 0), 0);
      const unpaidFines = fines.filter(f => f.status === 'UNPAID').reduce((sum, fine) => sum + (fine.amount || 0), 0);
      
      setStats({
        totalBorrowed: history.length,
        currentBorrowed,
        overdueBooks,
        totalFines,
        paidFines,
        unpaidFines
      });
      
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (e) => {
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords if provided
    if (formData.memPassword && formData.memPassword !== formData.confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    
    try {
      setUpdating(true);
      
      // Create update data object
      const updateData = {
        memFullName: formData.memFullName,
        memPhoneNumber: formData.memPhoneNumber,
        memAddress: formData.memAddress
      };
      
      // Only include password if provided
      if (formData.memPassword) {
        updateData.memPassword = formData.memPassword;
      }
      
      // Include image if provided
      if (formData.profileImage) {
        updateData.profileImage = formData.profileImage;
      }
      
      const response = await memberService.updateProfile(updateData);
      
      if (response.code === '00') {
        // Check if the response content has the active status
        const updatedProfile = response.content;
        
        // Log the response to debug
        console.log('Update response:', response);
        
        // Ensure we preserve the active status from the response
        setProfile(updatedProfile);
        
        // Update user in auth context if needed
        if (updateUser) {
          updateUser(updatedProfile);
        }
        
        showSuccess('Profile updated successfully!');
        setEditing(false);
        setPreviewImage(null);
        
        // Clear password fields
        setFormData({
          ...formData,
          memPassword: '',
          confirmPassword: ''
        });
        
        // Refresh profile data to ensure we have the latest
        await fetchProfileData();
      } else {
        showError(response.message || 'Failed to update profile');
      }
    } catch (error) {
      showError('Error updating profile');
      console.error('Error:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original profile data
    setFormData({
      memFullName: profile?.memFullName || '',
      memPhoneNumber: profile?.memPhoneNumber || '',
      memAddress: profile?.memAddress || '',
      memPassword: '',
      confirmPassword: '',
      profileImage: null
    });
    setPreviewImage(null);
    setEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const imageUrl = previewImage || (profile?.profileImageUrl ? 
    `${process.env.REACT_APP_IMAGE_URL || 'http://localhost:8080'}${profile.profileImageUrl}` : null);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">My Profile</h1>
        <p className="profile-subtitle">Manage your personal information and view your library activity</p>
      </div>

      <div className="profile-content">
        {/* Profile Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-avatar-section">
            <div className="avatar-container">
              {imageUrl ? (
                <img src={imageUrl} alt={profile?.memFullName} className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  {getInitials(profile?.memFullName)}
                </div>
              )}
              {editing && (
                <label htmlFor="profile-image" className="avatar-upload">
                  <FiCamera />
                  <input
                    type="file"
                    id="profile-image"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
            <h2 className="avatar-name">{profile?.memFullName}</h2>
            <p className="avatar-email">{profile?.memEmail}</p>
            <p className="avatar-member-id">Member ID: {profile?.memId}</p>
            
            {/* Display Active Status in Sidebar */}
            <div className="avatar-status">
              <span className={`status-badge ${profile?.active ? 'active' : 'inactive'}`}>
                {profile?.active ? 'Active Account' : 'Inactive Account'}
              </span>
            </div>
          </div>

          <div className="profile-stats-mini">
            <div className="stat-mini-item">
              <FiBook className="stat-mini-icon" />
              <div>
                <span className="stat-mini-value">{stats.currentBorrowed}</span>
                <span className="stat-mini-label">Current Books</span>
              </div>
            </div>
            <div className="stat-mini-item">
              <FiDollarSign className="stat-mini-icon" />
              <div>
                <span className="stat-mini-value">Rs. {stats.unpaidFines.toFixed(2)}</span>
                <span className="stat-mini-label">Unpaid Fines</span>
              </div>
            </div>
          </div>

          <div className="profile-menu">
            <button 
              className={`profile-menu-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FiUser /> Profile Information
            </button>
          </div>
        </div>

        {/* Profile Main Content */}
        <div className="profile-main">
          {activeTab === 'profile' && (
            <div className="profile-card">
              <div className="card-header">
                <h2>Profile Information</h2>
                {!editing ? (
                  <button 
                    className="edit-btn"
                    onClick={() => setEditing(true)}
                    disabled={!profile?.active} // Disable edit if account is inactive
                  >
                    <FiEdit2 /> Edit Profile
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button 
                      className="save-btn"
                      onClick={handleSubmit}
                      disabled={updating}
                    >
                      <FiSave /> {updating ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={handleCancel}
                      disabled={updating}
                    >
                      <FiX /> Cancel
                    </button>
                  </div>
                )}
              </div>

              {!editing ? (
                <div className="profile-info">
                  <div className="info-group">
                    <label>Full Name</label>
                    <p>{profile?.memFullName || 'Not provided'}</p>
                  </div>
                  
                  <div className="info-group">
                    <label>Email Address</label>
                    <p>{profile?.memEmail || 'Not provided'}</p>
                  </div>
                  
                  <div className="info-group">
                    <label>Phone Number</label>
                    <p>{profile?.memPhoneNumber || 'Not provided'}</p>
                  </div>
                  
                  <div className="info-group">
                    <label>Address</label>
                    <p>{profile?.memAddress || 'Not provided'}</p>
                  </div>
                  
                  <div className="info-group">
                    <label>Membership Date</label>
                    <p>{formatDate(profile?.membershipDate)}</p>
                  </div>
                  
                  <div className="info-group">
                    <label>Account Status</label>
                    <p>
                      <span className={`status-badge ${profile?.active ? 'active' : 'inactive'}`}>
                        {profile?.active ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <form className="profile-edit-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="memFullName">Full Name *</label>
                    <input
                      type="text"
                      id="memFullName"
                      name="memFullName"
                      value={formData.memFullName}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="memPhoneNumber">Phone Number</label>
                    <input
                      type="tel"
                      id="memPhoneNumber"
                      name="memPhoneNumber"
                      value={formData.memPhoneNumber}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="memAddress">Address</label>
                    <textarea
                      id="memAddress"
                      name="memAddress"
                      value={formData.memAddress}
                      onChange={handleInputChange}
                      className="form-control"
                      rows="3"
                      placeholder="Enter your address"
                    />
                  </div>

                  <div className="form-divider">
                    <span>Change Password (Optional)</span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="memPassword">New Password</label>
                    <input
                      type="password"
                      id="memPassword"
                      name="memPassword"
                      value={formData.memPassword}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Leave blank to keep current password"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Confirm new password"
                    />
                  </div>

                  {!profile?.active && (
                    <div className="form-warning">
                      <p>⚠️ Your account is inactive. You cannot update your profile.</p>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;