import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAlert } from '../../context/AlertContext';
import borrowService from '../../services/borrowService';
import fineService from '../../services/fineService';
import LoadingSpinner from '../common/LoadingSpinner';
import { 
  FiSearch, FiBook, FiUser, FiCalendar, FiClock, 
  FiDollarSign, FiFilter, FiRefreshCw, FiEye, 
  FiCheckCircle, FiXCircle, FiAlertCircle 
} from 'react-icons/fi';
import './AllBorrowRecords.css';

const AllBorrowRecords = () => {
  const { showSuccess, showError } = useAlert();
  
  const [borrows, setBorrows] = useState([]);
  const [filteredBorrows, setFilteredBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedBorrow, setSelectedBorrow] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendDays, setExtendDays] = useState(7);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    overdue: 0,
    returned: 0
  });

  useEffect(() => {
    fetchBorrows();
  }, []);

  useEffect(() => {
    filterBorrows();
  }, [searchTerm, statusFilter, dateFilter, borrows]);

  const fetchBorrows = async () => {
    try {
      setLoading(true);
      const response = await borrowService.getAllBorrowRecords();
      console.log('Borrows response:', response);
      
      if (response.code === '00') {
        setBorrows(response.content || []);
        setFilteredBorrows(response.content || []);
        
        // Calculate stats
        const records = response.content || [];
        setStats({
          total: records.length,
          active: records.filter(b => b.status === 'BORROWED').length,
          overdue: records.filter(b => b.status === 'OVERDUE').length,
          returned: records.filter(b => b.status === 'RETURNED').length
        });
      } else {
        showError('Failed to fetch borrow records');
      }
    } catch (error) {
      console.error('Error fetching borrows:', error);
      showError('Error fetching borrow records');
    } finally {
      setLoading(false);
    }
  };

  const filterBorrows = () => {
    let filtered = [...borrows];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(borrow => 
        borrow.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      if (dateFilter === 'today') {
        filtered = filtered.filter(borrow => borrow.borrowDate === todayStr);
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
        filtered = filtered.filter(borrow => borrow.borrowDate >= weekAgo);
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0];
        filtered = filtered.filter(borrow => borrow.borrowDate >= monthAgo);
      }
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(borrow => 
        borrow.bookTitle?.toLowerCase().includes(term) ||
        borrow.memberName?.toLowerCase().includes(term) ||
        borrow.memberEmail?.toLowerCase().includes(term) ||
        borrow.borrowId?.toString().includes(term)
      );
    }
    
    setFilteredBorrows(filtered);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const handleDateFilter = (filter) => {
    setDateFilter(filter);
  };

  const handleViewBorrow = async (borrow) => {
    setSelectedBorrow(borrow);
    setShowDetailsModal(true);
    
    try {
      // Fetch fine details if exists
      if (borrow.fineAmount > 0) {
        const finesResponse = await fineService.getFineByBorrowId(borrow.borrowId);
        if (finesResponse.code === '00') {
          setSelectedBorrow(prev => ({
            ...prev,
            fineDetails: finesResponse.content
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching fine details:', error);
    }
  };

  const handleExtendClick = (borrow) => {
    setSelectedBorrow(borrow);
    setExtendDays(7);
    setShowExtendModal(true);
  };

  const handleExtendDueDate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await borrowService.extendDueDate(selectedBorrow.borrowId, extendDays);
      console.log('Extend response:', response);
      
      if (response.code === '00') {
        showSuccess(`Due date extended by ${extendDays} days successfully`);
        fetchBorrows();
        setShowExtendModal(false);
      } else {
        showError(response.message || 'Failed to extend due date');
      }
    } catch (error) {
      console.error('Error extending due date:', error);
      showError(error.response?.data?.message || 'Failed to extend due date');
    }
  };

  const handleMarkReturned = async (borrowId) => {
    if (window.confirm('Are you sure you want to mark this book as returned?')) {
      try {
        const response = await borrowService.returnBook(borrowId);
        console.log('Return response:', response);
        
        if (response.code === '00') {
          showSuccess('Book marked as returned successfully');
          fetchBorrows();
        } else {
          showError(response.message || 'Failed to mark as returned');
        }
      } catch (error) {
        console.error('Error marking as returned:', error);
        showError(error.response?.data?.message || 'Failed to mark as returned');
      }
    }
  };

  const handleCheckOverdue = async () => {
    try {
      const response = await borrowService.checkOverdueBooks();
      console.log('Check overdue response:', response);
      
      if (response.code === '00') {
        showSuccess('Overdue books checked and updated');
        fetchBorrows();
      } else {
        showError(response.message || 'Failed to check overdue books');
      }
    } catch (error) {
      console.error('Error checking overdue:', error);
      showError(error.response?.data?.message || 'Failed to check overdue books');
    }
  };

  const handleRefresh = () => {
    fetchBorrows();
    showSuccess('Records refreshed');
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedBorrow(null);
  };

  const closeExtendModal = () => {
    setShowExtendModal(false);
    setSelectedBorrow(null);
    setExtendDays(7);
  };

  const getStatusBadgeClass = (status) => {
    switch(status?.toUpperCase()) {
      case 'BORROWED':
        return 'status-badge borrowed';
      case 'RETURNED':
        return 'status-badge returned';
      case 'OVERDUE':
        return 'status-badge overdue';
      default:
        return 'status-badge';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateDaysOverdue = (dueDate) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="borrow-records">
      <div className="page-header">
        <h1>Borrow Records Management</h1>
        <div className="header-actions">
          <button onClick={handleCheckOverdue} className="btn btn-warning">
            <FiAlertCircle /> Check Overdue
          </button>
          <button onClick={handleRefresh} className="btn btn-secondary">
            <FiRefreshCw /> Refresh
          </button>
          <Link to="/admin/dashboard" className="btn btn-secondary">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FiBook />
          </div>
          <div className="stat-content">
            <h3>Total Borrows</h3>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <FiClock />
          </div>
          <div className="stat-content">
            <h3>Active</h3>
            <p className="stat-value">{stats.active}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <FiAlertCircle />
          </div>
          <div className="stat-content">
            <h3>Overdue</h3>
            <p className="stat-value">{stats.overdue}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <h3>Returned</h3>
            <p className="stat-value">{stats.returned}</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by book title, member name, email, or borrow ID..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <FiFilter className="filter-icon" />
          <select 
            value={statusFilter} 
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="borrowed">Borrowed</option>
            <option value="returned">Returned</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className="filter-group">
          <FiCalendar className="filter-icon" />
          <select 
            value={dateFilter} 
            onChange={(e) => handleDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Borrows Table */}
      <div className="table-container">
        <table className="borrows-table">
          <thead>
            <tr>
              <th>Borrow ID</th>
              <th>Book</th>
              <th>Member</th>
              <th>Borrow Date</th>
              <th>Due Date</th>
              <th>Return Date</th>
              <th>Status</th>
              <th>Fine</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBorrows.length > 0 ? (
              filteredBorrows.map(borrow => (
                <tr key={borrow.borrowId} className={borrow.status === 'OVERDUE' ? 'overdue-row' : ''}>
                  <td>ID: {borrow.borrowId}</td>
                  <td>
                    <div className="book-info-cell">
                      <FiBook className="book-icon" />
                      <div>
                        <div className="book-title">{borrow.bookTitle}</div>
                        <small>ID: {borrow.bookId}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="member-info-cell">
                      <FiUser className="member-icon" />
                      <div>
                        <div className="member-name">{borrow.memberName}</div>
                        <small>{borrow.memberEmail}</small>
                      </div>
                    </div>
                  </td>
                  <td>{formatDate(borrow.borrowDate)}</td>
                  <td className={borrow.status === 'OVERDUE' ? 'due-date-overdue' : ''}>
                    {formatDate(borrow.dueDate)}
                    {borrow.status === 'OVERDUE' && (
                      <div className="days-overdue">
                        {calculateDaysOverdue(borrow.dueDate)} days overdue
                      </div>
                    )}
                  </td>
                  <td>{borrow.returnDate ? formatDate(borrow.returnDate) : '-'}</td>
                  <td>
                    <span className={getStatusBadgeClass(borrow.status)}>
                      {borrow.status}
                    </span>
                  </td>
                  <td>
                    {borrow.fineAmount > 0 ? (
                      <span className="fine-amount">
                        <FiDollarSign /> Rs. {borrow.fineAmount}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn view"
                        onClick={() => handleViewBorrow(borrow)}
                        title="View Details"
                      >
                        <FiEye />
                      </button>
                      {borrow.status !== 'RETURNED' && (
                        <>
                          <button 
                            className="action-btn extend"
                            onClick={() => handleExtendClick(borrow)}
                            title="Extend Due Date"
                          >
                            <FiCalendar />
                          </button>
                          <button 
                            className="action-btn return"
                            onClick={() => handleMarkReturned(borrow.borrowId)}
                            title="Mark as Returned"
                          >
                            <FiCheckCircle />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-data">
                  No borrow records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Borrow Details Modal */}
      {showDetailsModal && selectedBorrow && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-content details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Borrow Details</h2>
              <button className="close-btn" onClick={closeDetailsModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-section">
                  <h3>Borrow Information</h3>
                  <div className="detail-item">
                    <span className="detail-label">Borrow ID:</span>
                    <span className="detail-value">{selectedBorrow.borrowId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={getStatusBadgeClass(selectedBorrow.status)}>
                      {selectedBorrow.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Borrow Date:</span>
                    <span className="detail-value">{formatDate(selectedBorrow.borrowDate)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Due Date:</span>
                    <span className={`detail-value ${selectedBorrow.status === 'OVERDUE' ? 'text-danger' : ''}`}>
                      {formatDate(selectedBorrow.dueDate)}
                      {selectedBorrow.status === 'OVERDUE' && (
                        <span className="badge-overdue">
                          {calculateDaysOverdue(selectedBorrow.dueDate)} days overdue
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Return Date:</span>
                    <span className="detail-value">
                      {selectedBorrow.returnDate ? formatDate(selectedBorrow.returnDate) : 'Not returned yet'}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Book Information</h3>
                  <div className="detail-item">
                    <span className="detail-label">Book ID:</span>
                    <span className="detail-value">{selectedBorrow.bookId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Title:</span>
                    <span className="detail-value">{selectedBorrow.bookTitle}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Author:</span>
                    <span className="detail-value">{selectedBorrow.bookAuthor || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Member Information</h3>
                  <div className="detail-item">
                    <span className="detail-label">Member ID:</span>
                    <span className="detail-value">{selectedBorrow.memberId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selectedBorrow.memberName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedBorrow.memberEmail}</span>
                  </div>
                </div>

                {selectedBorrow.adminName && (
                  <div className="detail-section">
                    <h3>Processed By</h3>
                    <div className="detail-item">
                      <span className="detail-label">Admin:</span>
                      <span className="detail-value">{selectedBorrow.adminName}</span>
                    </div>
                  </div>
                )}

                {selectedBorrow.fineAmount > 0 && (
                  <div className="detail-section fine-section">
                    <h3>Fine Information</h3>
                    <div className="detail-item">
                      <span className="detail-label">Fine Amount:</span>
                      <span className="detail-value fine-amount">
                        Rs. {selectedBorrow.fineAmount}
                      </span>
                    </div>
                    {selectedBorrow.fineDetails && (
                      <div className="detail-item">
                        <span className="detail-label">Fine Status:</span>
                        <span className={`status-badge ${selectedBorrow.fineDetails.status?.toLowerCase()}`}>
                          {selectedBorrow.fineDetails.status}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeDetailsModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Due Date Modal */}
      {showExtendModal && selectedBorrow && (
        <div className="modal-overlay" onClick={closeExtendModal}>
          <div className="modal-content extend-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Extend Due Date</h2>
              <button className="close-btn" onClick={closeExtendModal}>×</button>
            </div>
            
            <form onSubmit={handleExtendDueDate}>
              <div className="modal-body">
                <div className="book-info">
                  <p><strong>Book:</strong> {selectedBorrow.bookTitle}</p>
                  <p><strong>Member:</strong> {selectedBorrow.memberName}</p>
                  <p><strong>Current Due Date:</strong> {formatDate(selectedBorrow.dueDate)}</p>
                </div>

                <div className="form-group">
                  <label htmlFor="extendDays">Extend by (days)</label>
                  <input
                    type="number"
                    id="extendDays"
                    min="1"
                    max="30"
                    value={extendDays}
                    onChange={(e) => setExtendDays(parseInt(e.target.value) || 7)}
                    required
                  />
                  <small>Maximum 30 days extension</small>
                </div>

                <div className="new-due-date">
                  New Due Date: {
                    formatDate(new Date(new Date(selectedBorrow.dueDate).setDate(
                      new Date(selectedBorrow.dueDate).getDate() + extendDays
                    )).toISOString().split('T')[0])
                  }
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeExtendModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Extend Due Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllBorrowRecords;