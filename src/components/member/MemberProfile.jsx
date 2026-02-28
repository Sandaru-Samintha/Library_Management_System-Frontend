import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import memberService from '../../services/memberService';
import borrowService from '../../services/borrowService';
import fineService from '../../services/fineService';
import LoadingSpinner from '../common/LoadingSpinner';
import ProfileImage from '../common/ProfileImage';
import { 
  FiUser, FiBook, FiDollarSign, FiEdit2, FiSave, FiX, FiCamera, FiCalendar, FiClock, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import './MemberProfile.css';

const MemberProfile = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useAlert();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
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
        const updatedProfile = response.content;
        
        console.log('Update response:', response);
        
        setProfile(updatedProfile);
        
        if (updateUser) {
          updateUser(updatedProfile);
        }
        
        showSuccess('Profile updated successfully!');
        setEditing(false);
        
        // Clear password fields
        setFormData({
          ...formData,
          memPassword: '',
          confirmPassword: '',
          profileImage: null
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="member-profile-container">
      <div className="member-profile-header">
        <h1 className="member-profile-title">My Profile</h1>
        <p className="member-profile-subtitle">Manage your personal information and view your library activity</p>
      </div>

      <div className="member-profile-content">
        {/* Profile Sidebar */}
        <div className="member-profile-sidebar">
          <div className="member-profile-avatar-section">
            <div className="member-avatar-container">
              <ProfileImage 
                imageUrl={profile?.profileImageUrl} 
                name={profile?.memFullName} 
                size={120}
              />
              {editing && (
                <label htmlFor="member-profile-image" className="member-avatar-upload">
                  <FiCamera />
                  <input
                    type="file"
                    id="member-profile-image"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
            <h2 className="member-avatar-name">{profile?.memFullName}</h2>
            <p className="member-avatar-email">{profile?.memEmail}</p>
            <p className="member-avatar-id">Member ID: {profile?.memId}</p>
            
            {/* Display Active Status in Sidebar */}
            <div className="member-avatar-status">
              <span className={`member-status-badge ${profile?.active ? 'member-status-active' : 'member-status-inactive'}`}>
                {profile?.active ? 'Active Account' : 'Inactive Account'}
              </span>
            </div>
          </div>

          <div className="member-profile-stats-mini">
            <div className="member-stat-mini-item">
              <FiBook className="member-stat-mini-icon" />
              <div>
                <span className="member-stat-mini-value">{stats.currentBorrowed}</span>
                <span className="member-stat-mini-label">Current Books</span>
              </div>
            </div>
            <div className="member-stat-mini-item">
              <FiDollarSign className="member-stat-mini-icon" />
              <div>
                <span className="member-stat-mini-value">Rs. {stats.unpaidFines.toFixed(2)}</span>
                <span className="member-stat-mini-label">Unpaid Fines</span>
              </div>
            </div>
          </div>

          <div className="member-profile-menu">
            <button 
              className={`member-menu-item ${activeTab === 'profile' ? 'member-menu-active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FiUser /> Profile Information
            </button>
            <button 
              className={`member-menu-item ${activeTab === 'stats' ? 'member-menu-active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              <FiBook /> Library Statistics
            </button>
          </div>
        </div>

        {/* Profile Main Content */}
        <div className="member-profile-main">
          {activeTab === 'profile' && (
            <div className="member-profile-card">
              <div className="member-card-header">
                <h2>Profile Information</h2>
                {!editing ? (
                  <button 
                    className="member-edit-btn"
                    onClick={() => setEditing(true)}
                    disabled={!profile?.active}
                  >
                    <FiEdit2 /> Edit Profile
                  </button>
                ) : (
                  <div className="member-edit-actions">
                    <button 
                      className="member-save-btn"
                      onClick={handleSubmit}
                      disabled={updating}
                    >
                      <FiSave /> {updating ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      className="member-cancel-btn"
                      onClick={handleCancel}
                      disabled={updating}
                    >
                      <FiX /> Cancel
                    </button>
                  </div>
                )}
              </div>

              {!editing ? (
                <div className="member-profile-info">
                  <div className="member-info-group">
                    <label>Full Name</label>
                    <p>{profile?.memFullName || 'Not provided'}</p>
                  </div>
                  
                  <div className="member-info-group">
                    <label>Email Address</label>
                    <p>{profile?.memEmail || 'Not provided'}</p>
                  </div>
                  
                  <div className="member-info-group">
                    <label>Phone Number</label>
                    <p>{profile?.memPhoneNumber || 'Not provided'}</p>
                  </div>
                  
                  <div className="member-info-group">
                    <label>Address</label>
                    <p>{profile?.memAddress || 'Not provided'}</p>
                  </div>
                  
                  <div className="member-info-group">
                    <label>Membership Date</label>
                    <p>{formatDate(profile?.membershipDate)}</p>
                  </div>
                  
                  <div className="member-info-group">
                    <label>Account Status</label>
                    <p>
                      <span className={`member-status-badge ${profile?.active ? 'member-status-active' : 'member-status-inactive'}`}>
                        {profile?.active ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <form className="member-profile-edit-form" onSubmit={handleSubmit}>
                  <div className="member-form-group">
                    <label htmlFor="member-memFullName">Full Name *</label>
                    <input
                      type="text"
                      id="member-memFullName"
                      name="memFullName"
                      value={formData.memFullName}
                      onChange={handleInputChange}
                      required
                      className="member-form-control"
                    />
                  </div>

                  <div className="member-form-group">
                    <label htmlFor="member-memPhoneNumber">Phone Number</label>
                    <input
                      type="tel"
                      id="member-memPhoneNumber"
                      name="memPhoneNumber"
                      value={formData.memPhoneNumber}
                      onChange={handleInputChange}
                      className="member-form-control"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="member-form-group">
                    <label htmlFor="member-memAddress">Address</label>
                    <textarea
                      id="member-memAddress"
                      name="memAddress"
                      value={formData.memAddress}
                      onChange={handleInputChange}
                      className="member-form-control"
                      rows="3"
                      placeholder="Enter your address"
                    />
                  </div>

                  <div className="member-form-divider">
                    <span>Change Password (Optional)</span>
                  </div>

                  <div className="member-form-group">
                    <label htmlFor="member-memPassword">New Password</label>
                    <input
                      type="password"
                      id="member-memPassword"
                      name="memPassword"
                      value={formData.memPassword}
                      onChange={handleInputChange}
                      className="member-form-control"
                      placeholder="Leave blank to keep current password"
                    />
                  </div>

                  <div className="member-form-group">
                    <label htmlFor="member-confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="member-confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="member-form-control"
                      placeholder="Confirm new password"
                    />
                  </div>

                  {!profile?.active && (
                    <div className="member-form-warning">
                      <p>⚠️ Your account is inactive. You cannot update your profile.</p>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="member-profile-card">
              <div className="member-card-header">
                <h2>Library Statistics</h2>
              </div>

              <div className="member-stats-grid">
                <div className="member-stat-card member-stat-card-blue">
                  <div className="member-stat-icon">
                    <FiBook />
                  </div>
                  <div className="member-stat-content">
                    <h3>Total Borrowed</h3>
                    <p className="member-stat-value">{stats.totalBorrowed}</p>
                  </div>
                </div>

                <div className="member-stat-card member-stat-card-green">
                  <div className="member-stat-icon">
                    <FiClock />
                  </div>
                  <div className="member-stat-content">
                    <h3>Currently Borrowed</h3>
                    <p className="member-stat-value">{stats.currentBorrowed}</p>
                  </div>
                </div>

                <div className="member-stat-card member-stat-card-red">
                  <div className="member-stat-icon">
                    <FiAlertCircle />
                  </div>
                  <div className="member-stat-content">
                    <h3>Overdue Books</h3>
                    <p className="member-stat-value">{stats.overdueBooks}</p>
                  </div>
                </div>

                <div className="member-stat-card member-stat-card-orange">
                  <div className="member-stat-icon">
                    <FiDollarSign />
                  </div>
                  <div className="member-stat-content">
                    <h3>Total Fines</h3>
                    <p className="member-stat-value">Rs. {stats.totalFines.toFixed(2)}</p>
                  </div>
                </div>

                <div className="member-stat-card member-stat-card-purple">
                  <div className="member-stat-icon">
                    <FiCheckCircle />
                  </div>
                  <div className="member-stat-content">
                    <h3>Paid Fines</h3>
                    <p className="member-stat-value">Rs. {stats.paidFines.toFixed(2)}</p>
                  </div>
                </div>

                <div className="member-stat-card member-stat-card-yellow">
                  <div className="member-stat-icon">
                    <FiAlertCircle />
                  </div>
                  <div className="member-stat-content">
                    <h3>Unpaid Fines</h3>
                    <p className="member-stat-value">Rs. {stats.unpaidFines.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="member-membership-info">
                <h3>Membership Details</h3>
                <div className="member-info-grid">
                  <div className="member-info-item">
                    <span className="member-info-label">Member Since</span>
                    <span className="member-info-value">{formatDate(profile?.membershipDate)}</span>
                  </div>
                  <div className="member-info-item">
                    <span className="member-info-label">Account Status</span>
                    <span className={`member-status-badge ${profile?.active ? 'member-status-active' : 'member-status-inactive'}`}>
                      {profile?.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;