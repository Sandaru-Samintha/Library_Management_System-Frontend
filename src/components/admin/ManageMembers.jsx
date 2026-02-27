import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAlert } from '../../context/AlertContext';
import adminService from '../../services/adminService';
import borrowService from '../../services/borrowService';
import fineService from '../../services/fineService';
import LoadingSpinner from '../common/LoadingSpinner';
import ProfileImage from '../common/ProfileImage';
import { FiSearch, FiUser, FiMail, FiPhone, FiCalendar, FiBook, FiDollarSign, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import './ManageMembers.css';

const ManageMembers = () => {
  const { showSuccess, showError } = useAlert();
  
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDetails, setMemberDetails] = useState(null);
  const [memberBorrows, setMemberBorrows] = useState([]);
  const [memberFines, setMemberFines] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  const [editFormData, setEditFormData] = useState({
    memFullName: '',
    memEmail: '',
    memPhoneNumber: '',
    memAddress: '',
    active: true
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [searchTerm, statusFilter, members]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllMembers();
      if (response.code === '00') {
        setMembers(response.content || []);
        setFilteredMembers(response.content || []);
      } else {
        showError('Failed to fetch members');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      showError('Error fetching members');
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = [...members];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => 
        statusFilter === 'active' ? member.active : !member.active
      );
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(member => 
        member.memFullName?.toLowerCase().includes(term) ||
        member.memEmail?.toLowerCase().includes(term) ||
        member.memPhoneNumber?.includes(term)
      );
    }
    
    setFilteredMembers(filtered);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (filter) => {
    setStatusFilter(filter);
  };

  const handleViewMember = async (member) => {
    setSelectedMember(member);
    setShowDetailsModal(true);
    
    try {
      // Fetch member details
      const detailsResponse = await adminService.getMemberById(member.memId);
      if (detailsResponse.code === '00') {
        setMemberDetails(detailsResponse.content);
      }
      
      // Fetch member borrow history
      const borrowsResponse = await borrowService.getMemberBorrowHistory(member.memId);
      if (borrowsResponse.code === '00') {
        setMemberBorrows(borrowsResponse.content || []);
      }
      
      // Fetch member fines
      const finesResponse = await fineService.getMemberFines(member.memId);
      if (finesResponse.code === '00') {
        setMemberFines(finesResponse.content || []);
      }
    } catch (error) {
      console.error('Error fetching member details:', error);
      showError('Failed to load member details');
    }
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setEditFormData({
      memFullName: member.memFullName || '',
      memEmail: member.memEmail || '',
      memPhoneNumber: member.memPhoneNumber || '',
      memAddress: member.memAddress || '',
      active: member.active
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    
    try {
      // Note: You'll need to implement this endpoint in your backend
      // For now, we'll just update the status
      if (editFormData.active !== selectedMember.active) {
        const response = await adminService.updateMemberStatus(selectedMember.memId, editFormData.active);
        if (response.code === '00') {
          showSuccess('Member status updated successfully');
          fetchMembers();
          setShowEditModal(false);
        } else {
          showError(response.message || 'Failed to update member');
        }
      } else {
        // If only other fields changed, you need an update endpoint
        showError('Profile update endpoint not implemented yet');
      }
    } catch (error) {
      console.error('Error updating member:', error);
      showError('Failed to update member');
    }
  };

  const handleToggleStatus = async (memberId, currentStatus) => {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this member?`)) {
      try {
        const response = await adminService.updateMemberStatus(memberId, !currentStatus);
        if (response.code === '00') {
          showSuccess(`Member ${currentStatus ? 'deactivated' : 'activated'} successfully`);
          fetchMembers();
        } else {
          showError(response.message || `Failed to ${currentStatus ? 'deactivate' : 'activate'} member`);
        }
      } catch (error) {
        console.error('Error toggling member status:', error);
        showError('Failed to update member status');
      }
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      try {
        // Note: You'll need to implement this endpoint in your backend
        showError('Delete endpoint not implemented yet');
        // const response = await adminService.deleteMember(memberId);
        // if (response.code === '00') {
        //   showSuccess('Member deleted successfully');
        //   fetchMembers();
        // }
      } catch (error) {
        console.error('Error deleting member:', error);
        showError('Failed to delete member');
      }
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedMember(null);
    setMemberDetails(null);
    setMemberBorrows([]);
    setMemberFines([]);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedMember(null);
  };

  const calculateTotalFines = () => {
    return memberFines.reduce((total, fine) => total + (fine.amount || 0), 0);
  };

  const calculatePaidFines = () => {
    return memberFines
      .filter(fine => fine.status === 'PAID')
      .reduce((total, fine) => total + (fine.amount || 0), 0);
  };

  const calculatePendingFines = () => {
    return memberFines
      .filter(fine => fine.status === 'UNPAID')
      .reduce((total, fine) => total + (fine.amount || 0), 0);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="manage-members">
      <div className="page-header">
        <h1>Manage Members</h1>
        <div className="header-actions">
          <Link to="/admin/dashboard" className="btn btn-secondary">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <div className="status-filters">
          <button 
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleStatusFilterChange('all')}
          >
            All ({members.length})
          </button>
          <button 
            className={`filter-btn active-filter ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => handleStatusFilterChange('active')}
          >
            Active ({members.filter(m => m.active).length})
          </button>
          <button 
            className={`filter-btn inactive-filter ${statusFilter === 'inactive' ? 'active' : ''}`}
            onClick={() => handleStatusFilterChange('inactive')}
          >
            Inactive ({members.filter(m => !m.active).length})
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="members-table-container">
        <table className="members-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Contact</th>
              <th>Membership Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map(member => (
                <tr key={member.memId}>
                  <td>
                    <div className="member-cell">
                      <ProfileImage 
                        imageUrl={member.profileImageUrl} 
                        name={member.memFullName} 
                        size={40}
                      />
                      <div className="member-info">
                        <span className="member-name">{member.memFullName}</span>
                        <span className="member-email">{member.memEmail}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      {member.memPhoneNumber && (
                        <span><FiPhone /> {member.memPhoneNumber}</span>
                      )}
                      {member.memAddress && (
                        <span className="address">{member.memAddress}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {member.membershipDate ? new Date(member.membershipDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <span className={`status-badge ${member.active ? 'active' : 'inactive'}`}>
                      {member.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn view"
                        onClick={() => handleViewMember(member)}
                        title="View Details"
                      >
                        <FiEye />
                      </button>
                      <button 
                        className="action-btn edit"
                        onClick={() => handleEditMember(member)}
                        title="Edit Member"
                      >
                        <FiEdit />
                      </button>
                      <button 
                        className={`action-btn ${member.active ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleStatus(member.memId, member.active)}
                        title={member.active ? 'Deactivate' : 'Activate'}
                      >
                        {member.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  No members found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Member Details Modal */}
      {showDetailsModal && selectedMember && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-content member-details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Member Details</h2>
              <button className="close-btn" onClick={closeDetailsModal}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Profile Section */}
              <div className="details-profile">
                <ProfileImage 
                  imageUrl={selectedMember.profileImageUrl} 
                  name={selectedMember.memFullName} 
                  size={80}
                />
                <div className="profile-info">
                  <h3>{selectedMember.memFullName}</h3>
                  <p><FiMail /> {selectedMember.memEmail}</p>
                  {selectedMember.memPhoneNumber && (
                    <p><FiPhone /> {selectedMember.memPhoneNumber}</p>
                  )}
                  <p><FiCalendar /> Member since: {selectedMember.membershipDate ? new Date(selectedMember.membershipDate).toLocaleDateString() : 'N/A'}</p>
                  <span className={`status-badge ${selectedMember.active ? 'active' : 'inactive'}`}>
                    {selectedMember.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Address */}
              {selectedMember.memAddress && (
                <div className="details-section">
                  <h4>Address</h4>
                  <p>{selectedMember.memAddress}</p>
                </div>
              )}

              {/* Statistics */}
              <div className="details-section">
                <h4>Statistics</h4>
                <div className="stats-grid-small">
                  <div className="stat-item">
                    <FiBook />
                    <div>
                      <span className="stat-label">Total Borrows</span>
                      <span className="stat-value">{memberBorrows.length}</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <FiBook className="active" />
                    <div>
                      <span className="stat-label">Current Borrows</span>
                      <span className="stat-value">
                        {memberBorrows.filter(b => b.status === 'BORROWED').length}
                      </span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <FiDollarSign />
                    <div>
                      <span className="stat-label">Total Fines</span>
                      <span className="stat-value">Rs. {calculateTotalFines().toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <FiDollarSign className="paid" />
                    <div>
                      <span className="stat-label">Paid Fines</span>
                      <span className="stat-value">Rs. {calculatePaidFines().toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <FiDollarSign className="pending" />
                    <div>
                      <span className="stat-label">Pending Fines</span>
                      <span className="stat-value">Rs. {calculatePendingFines().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Borrows */}
              {memberBorrows.length > 0 && (
                <div className="details-section">
                  <h4>Recent Borrows</h4>
                  <div className="borrows-list-small">
                    {memberBorrows.slice(0, 5).map(borrow => (
                      <div key={borrow.borrowId} className="borrow-item-small">
                        <div>
                          <span className="book-title">{borrow.bookTitle}</span>
                          <span className="borrow-dates">
                            {borrow.borrowDate} - {borrow.returnDate || 'Not returned'}
                          </span>
                        </div>
                        <span className={`status-badge ${borrow.status?.toLowerCase()}`}>
                          {borrow.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  {memberBorrows.length > 5 && (
                    <Link to={`/admin/borrows?member=${selectedMember.memId}`} className="view-all-link">
                      View all borrows →
                    </Link>
                  )}
                </div>
              )}

              {/* Fines */}
              {memberFines.length > 0 && (
                <div className="details-section">
                  <h4>Fines</h4>
                  <div className="fines-list-small">
                    {memberFines.slice(0, 5).map(fine => (
                      <div key={fine.fineId} className="fine-item-small">
                        <div>
                          <span className="fine-book">{fine.bookTitle}</span>
                          <span className="fine-amount">Rs. {fine.amount}</span>
                        </div>
                        <span className={`status-badge ${fine.status?.toLowerCase()}`}>
                          {fine.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && selectedMember && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content edit-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Member</h2>
              <button className="close-btn" onClick={closeEditModal}>×</button>
            </div>
            
            <form onSubmit={handleUpdateMember}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="memFullName">Full Name</label>
                  <input
                    type="text"
                    id="memFullName"
                    name="memFullName"
                    value={editFormData.memFullName}
                    onChange={handleEditFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="memEmail">Email</label>
                  <input
                    type="email"
                    id="memEmail"
                    name="memEmail"
                    value={editFormData.memEmail}
                    onChange={handleEditFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="memPhoneNumber">Phone Number</label>
                  <input
                    type="tel"
                    id="memPhoneNumber"
                    name="memPhoneNumber"
                    value={editFormData.memPhoneNumber}
                    onChange={handleEditFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="memAddress">Address</label>
                  <textarea
                    id="memAddress"
                    name="memAddress"
                    value={editFormData.memAddress}
                    onChange={handleEditFormChange}
                    rows="3"
                  />
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="active"
                      checked={editFormData.active}
                      onChange={handleEditFormChange}
                    />
                    Active Member
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeEditModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMembers;