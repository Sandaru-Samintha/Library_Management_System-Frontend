import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAlert } from '../../context/AlertContext';
import borrowService from '../../services/borrowService';
import fineService from '../../services/fineService';
import LoadingSpinner from '../common/LoadingSpinner';
import { 
  FiAlertCircle, FiMail, FiDollarSign, FiCalendar, 
  FiUser, FiBook, FiRefreshCw, FiEye, FiClock,
  FiCheckCircle, FiXCircle, FiDownload
} from 'react-icons/fi';
import './OverdueBooks.css';

const OverdueBooks = () => {
  const { showSuccess, showError } = useAlert();
  
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [filteredOverdue, setFilteredOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOverdue, setSelectedOverdue] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showWaiveModal, setShowWaiveModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [stats, setStats] = useState({
    totalOverdue: 0,
    totalFines: 0,
    totalMembers: 0,
    avgDaysOverdue: 0
  });

  useEffect(() => {
    fetchOverdueBooks();
  }, []);

  useEffect(() => {
    filterOverdue();
  }, [searchTerm, overdueBooks]);

  const fetchOverdueBooks = async () => {
    try {
      setLoading(true);
      const response = await borrowService.getOverdueBooks();
      console.log('Overdue books response:', response);
      
      if (response.code === '00') {
        const overdue = response.content || [];
        setOverdueBooks(overdue);
        setFilteredOverdue(overdue);
        
        // Calculate statistics
        const totalFines = overdue.reduce((sum, book) => sum + (book.fineAmount || 0), 0);
        const uniqueMembers = new Set(overdue.map(book => book.memberId)).size;
        const totalDaysOverdue = overdue.reduce((sum, book) => sum + calculateDaysOverdue(book.dueDate), 0);
        
        setStats({
          totalOverdue: overdue.length,
          totalFines: totalFines,
          totalMembers: uniqueMembers,
          avgDaysOverdue: overdue.length > 0 ? Math.round(totalDaysOverdue / overdue.length) : 0
        });
      } else {
        showError('Failed to fetch overdue books');
      }
    } catch (error) {
      console.error('Error fetching overdue books:', error);
      showError('Error fetching overdue books');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOverdueBooks();
    setRefreshing(false);
    showSuccess('Overdue list refreshed');
  };

  const handleCheckOverdue = async () => {
    try {
      const response = await borrowService.checkOverdueBooks();
      console.log('Check overdue response:', response);
      
      if (response.code === '00') {
        showSuccess('Overdue books checked and updated');
        fetchOverdueBooks();
      } else {
        showError(response.message || 'Failed to check overdue books');
      }
    } catch (error) {
      console.error('Error checking overdue:', error);
      showError(error.response?.data?.message || 'Failed to check overdue books');
    }
  };

  const filterOverdue = () => {
    if (!searchTerm.trim()) {
      setFilteredOverdue(overdueBooks);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = overdueBooks.filter(book => 
      book.bookTitle?.toLowerCase().includes(term) ||
      book.memberName?.toLowerCase().includes(term) ||
      book.memberEmail?.toLowerCase().includes(term) ||
      book.borrowId?.toString().includes(term)
    );
    
    setFilteredOverdue(filtered);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewDetails = (overdue) => {
    setSelectedOverdue(overdue);
    setShowDetailsModal(true);
  };

  const handleWaiveFine = (overdue) => {
    setSelectedOverdue(overdue);
    setShowWaiveModal(true);
  };

  const handleSendReminder = (overdue) => {
    setSelectedOverdue(overdue);
    setReminderMessage(`Dear ${overdue.memberName}, this is a reminder that the book "${overdue.bookTitle}" was due on ${formatDate(overdue.dueDate)}. Please return it as soon as possible to avoid additional fines.`);
    setShowReminderModal(true);
  };

  const confirmWaiveFine = async () => {
    try {
      // You'll need to implement this endpoint or use fineService.waiveFine
      const response = await fineService.waiveFine(selectedOverdue.fineId);
      console.log('Waive fine response:', response);
      
      if (response.code === '00') {
        showSuccess('Fine waived successfully');
        fetchOverdueBooks();
        setShowWaiveModal(false);
      } else {
        showError(response.message || 'Failed to waive fine');
      }
    } catch (error) {
      console.error('Error waiving fine:', error);
      showError(error.response?.data?.message || 'Failed to waive fine');
    }
  };

  const sendReminder = async () => {
    try {
      // You can implement email sending here
      console.log('Sending reminder to:', selectedOverdue.memberEmail);
      console.log('Reminder message:', reminderMessage);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccess(`Reminder sent to ${selectedOverdue.memberName}`);
      setShowReminderModal(false);
    } catch (error) {
      console.error('Error sending reminder:', error);
      showError('Failed to send reminder');
    }
  };

  const handleMarkReturned = async (borrowId) => {
    if (window.confirm('Are you sure you want to mark this book as returned?')) {
      try {
        const response = await borrowService.returnBook(borrowId);
        console.log('Return response:', response);
        
        if (response.code === '00') {
          showSuccess('Book marked as returned successfully');
          fetchOverdueBooks();
        } else {
          showError(response.message || 'Failed to mark as returned');
        }
      } catch (error) {
        console.error('Error marking as returned:', error);
        showError(error.response?.data?.message || 'Failed to mark as returned');
      }
    }
  };

  const handleExtendDueDate = async (borrowId) => {
    const days = prompt('Enter number of days to extend (max 14):', '7');
    if (days) {
      const extendDays = parseInt(days);
      if (extendDays > 0 && extendDays <= 14) {
        try {
          const response = await borrowService.extendDueDate(borrowId, extendDays);
          console.log('Extend response:', response);
          
          if (response.code === '00') {
            showSuccess(`Due date extended by ${extendDays} days`);
            fetchOverdueBooks();
          } else {
            showError(response.message || 'Failed to extend due date');
          }
        } catch (error) {
          console.error('Error extending due date:', error);
          showError(error.response?.data?.message || 'Failed to extend due date');
        }
      } else {
        showError('Please enter a valid number between 1 and 14');
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Borrow ID', 'Book Title', 'Member Name', 'Member Email', 'Due Date', 'Days Overdue', 'Fine Amount'];
    const csvData = filteredOverdue.map(book => [
      book.borrowId,
      book.bookTitle,
      book.memberName,
      book.memberEmail,
      formatDate(book.dueDate),
      calculateDaysOverdue(book.dueDate),
      book.fineAmount || 0
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overdue-books-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showSuccess('Report exported successfully');
  };

  const calculateDaysOverdue = (dueDate) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedOverdue(null);
  };

  const closeWaiveModal = () => {
    setShowWaiveModal(false);
    setSelectedOverdue(null);
  };

  const closeReminderModal = () => {
    setShowReminderModal(false);
    setSelectedOverdue(null);
    setReminderMessage('');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="overdue-books-container">
      <div className="overdue-books-header">
        <h1 className="overdue-books-title">Overdue Books Management</h1>
        <div className="overdue-books-actions">
          <button 
            onClick={handleCheckOverdue} 
            className="overdue-books-btn overdue-books-btn-warning"
          >
            <FiAlertCircle /> Check Overdue
          </button>
          <button 
            onClick={handleRefresh} 
            className="overdue-books-btn overdue-books-btn-secondary"
            disabled={refreshing}
          >
            <FiRefreshCw className={refreshing ? 'overdue-books-spin' : ''} /> 
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          {/* <button 
            onClick={exportToCSV} 
            className="overdue-books-btn overdue-books-btn-success"
            disabled={filteredOverdue.length === 0}
          >
            <FiDownload /> Export Report
          </button> */}
          <Link to="/admin/dashboard" className="overdue-books-btn overdue-books-btn-secondary">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="overdue-books-stats">
        <div className="overdue-books-stat-card">
          <div className="overdue-books-stat-icon overdue-books-stat-icon-red">
            <FiAlertCircle />
          </div>
          <div className="overdue-books-stat-content">
            <h3>Total Overdue</h3>
            <p className="overdue-books-stat-value">{stats.totalOverdue}</p>
          </div>
        </div>

        <div className="overdue-books-stat-card">
          <div className="overdue-books-stat-icon overdue-books-stat-icon-orange">
            <FiDollarSign />
          </div>
          <div className="overdue-books-stat-content">
            <h3>Total Fines</h3>
            <p className="overdue-books-stat-value">{formatCurrency(stats.totalFines)}</p>
          </div>
        </div>

        <div className="overdue-books-stat-card">
          <div className="overdue-books-stat-icon overdue-books-stat-icon-blue">
            <FiUser />
          </div>
          <div className="overdue-books-stat-content">
            <h3>Members Affected</h3>
            <p className="overdue-books-stat-value">{stats.totalMembers}</p>
          </div>
        </div>

        <div className="overdue-books-stat-card">
          <div className="overdue-books-stat-icon overdue-books-stat-icon-purple">
            <FiClock />
          </div>
          <div className="overdue-books-stat-content">
            <h3>Avg Days Overdue</h3>
            <p className="overdue-books-stat-value">{stats.avgDaysOverdue} days</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="overdue-books-search">
        <input
          type="text"
          placeholder="Search by book title, member name, email, or borrow ID..."
          value={searchTerm}
          onChange={handleSearch}
          className="overdue-books-search-input"
        />
      </div>

      {/* Overdue Books Table */}
      <div className="overdue-books-table-container">
        {filteredOverdue.length > 0 ? (
          <table className="overdue-books-table">
            <thead>
              <tr>
                <th>Borrow ID</th>
                <th>Book Details</th>
                <th>Member Details</th>
                <th>Due Date</th>
                <th>Days Overdue</th>
                <th>Fine Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOverdue.map(book => {
                const daysOverdue = calculateDaysOverdue(book.dueDate);
                return (
                  <tr key={book.borrowId} className="overdue-books-row">
                    <td className="overdue-books-id">#{book.borrowId}</td>
                    <td>
                      <div className="overdue-books-book-cell">
                        <FiBook className="overdue-books-book-icon" />
                        <div>
                          <div className="overdue-books-book-title">{book.bookTitle}</div>
                          <small>ID: {book.bookId}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="overdue-books-member-cell">
                        <FiUser className="overdue-books-member-icon" />
                        <div>
                          <div className="overdue-books-member-name">{book.memberName}</div>
                          <small>{book.memberEmail}</small>
                        </div>
                      </div>
                    </td>
                    <td className="overdue-books-due-date">
                      {formatDate(book.dueDate)}
                    </td>
                    <td>
                      <span className={`overdue-books-days-badge ${
                        daysOverdue > 14 ? 'overdue-books-days-critical' :
                        daysOverdue > 7 ? 'overdue-books-days-warning' :
                        'overdue-books-days-normal'
                      }`}>
                        {daysOverdue} days
                      </span>
                    </td>
                    <td className="overdue-books-fine">
                      {book.fineAmount > 0 ? (
                        <span className="overdue-books-fine-amount">
                          {formatCurrency(book.fineAmount)}
                        </span>
                      ) : (
                        <span className="overdue-books-fine-none">-</span>
                      )}
                    </td>
                    <td>
                      <div className="overdue-books-action-buttons">
                        <button
                          className="overdue-books-action-btn overdue-books-action-view"
                          onClick={() => handleViewDetails(book)}
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                        <button
                          className="overdue-books-action-btn overdue-books-action-reminder"
                          onClick={() => handleSendReminder(book)}
                          title="Send Reminder"
                        >
                          <FiMail />
                        </button>
                        <button
                          className="overdue-books-action-btn overdue-books-action-return"
                          onClick={() => handleMarkReturned(book.borrowId)}
                          title="Mark as Returned"
                        >
                          <FiCheckCircle />
                        </button>
                        <button
                          className="overdue-books-action-btn overdue-books-action-extend"
                          onClick={() => handleExtendDueDate(book.borrowId)}
                          title="Extend Due Date"
                        >
                          <FiCalendar />
                        </button>
                        {book.fineAmount > 0 && (
                          <button
                            className="overdue-books-action-btn overdue-books-action-waive"
                            onClick={() => handleWaiveFine(book)}
                            title="Waive Fine"
                          >
                            <FiXCircle />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="overdue-books-empty">
            <FiCheckCircle className="overdue-books-empty-icon" />
            <h3>No Overdue Books</h3>
            <p>All books have been returned on time. Great job!</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedOverdue && (
        <div className="overdue-books-modal-overlay" onClick={closeDetailsModal}>
          <div className="overdue-books-modal" onClick={e => e.stopPropagation()}>
            <div className="overdue-books-modal-header">
              <h2>Overdue Book Details</h2>
              <button className="overdue-books-modal-close" onClick={closeDetailsModal}>×</button>
            </div>
            
            <div className="overdue-books-modal-body">
              <div className="overdue-books-details-grid">
                <div className="overdue-books-details-section">
                  <h3>Borrow Information</h3>
                  <div className="overdue-books-details-item">
                    <span className="overdue-books-details-label">Borrow ID:</span>
                    <span className="overdue-books-details-value">#{selectedOverdue.borrowId}</span>
                  </div>
                  <div className="overdue-books-details-item">
                    <span className="overdue-books-details-label">Borrow Date:</span>
                    <span className="overdue-books-details-value">{formatDate(selectedOverdue.borrowDate)}</span>
                  </div>
                  <div className="overdue-books-details-item">
                    <span className="overdue-books-details-label">Due Date:</span>
                    <span className="overdue-books-details-value overdue-books-text-danger">
                      {formatDate(selectedOverdue.dueDate)}
                    </span>
                  </div>
                  <div className="overdue-books-details-item">
                    <span className="overdue-books-details-label">Days Overdue:</span>
                    <span className="overdue-books-details-value overdue-books-text-danger">
                      {calculateDaysOverdue(selectedOverdue.dueDate)} days
                    </span>
                  </div>
                </div>

                <div className="overdue-books-details-section">
                  <h3>Book Information</h3>
                  <div className="overdue-books-details-item">
                    <span className="overdue-books-details-label">Book ID:</span>
                    <span className="overdue-books-details-value">{selectedOverdue.bookId}</span>
                  </div>
                  <div className="overdue-books-details-item">
                    <span className="overdue-books-details-label">Title:</span>
                    <span className="overdue-books-details-value">{selectedOverdue.bookTitle}</span>
                  </div>
                  <div className="overdue-books-details-item">
                    <span className="overdue-books-details-label">Author:</span>
                    <span className="overdue-books-details-value">{selectedOverdue.bookAuthor || 'N/A'}</span>
                  </div>
                </div>

                <div className="overdue-books-details-section">
                  <h3>Member Information</h3>
                  <div className="overdue-books-details-item">
                    <span className="overdue-books-details-label">Member ID:</span>
                    <span className="overdue-books-details-value">{selectedOverdue.memberId}</span>
                  </div>
                  <div className="overdue-books-details-item">
                    <span className="overdue-books-details-label">Name:</span>
                    <span className="overdue-books-details-value">{selectedOverdue.memberName}</span>
                  </div>
                  <div className="overdue-books-details-item">
                    <span className="overdue-books-details-label">Email:</span>
                    <span className="overdue-books-details-value">{selectedOverdue.memberEmail}</span>
                  </div>
                </div>

                <div className="overdue-books-details-section">
                  <h3>Fine Information</h3>
                  <div className="overdue-books-details-item">
                    <span className="overdue-books-details-label">Fine Amount:</span>
                    <span className="overdue-books-details-value overdue-books-fine-amount">
                      {formatCurrency(selectedOverdue.fineAmount)}
                    </span>
                  </div>
                  {selectedOverdue.fineId && (
                    <div className="overdue-books-details-item">
                      <span className="overdue-books-details-label">Fine ID:</span>
                      <span className="overdue-books-details-value">#{selectedOverdue.fineId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="overdue-books-modal-footer">
              <button className="overdue-books-btn overdue-books-btn-secondary" onClick={closeDetailsModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waive Fine Modal */}
      {showWaiveModal && selectedOverdue && (
        <div className="overdue-books-modal-overlay" onClick={closeWaiveModal}>
          <div className="overdue-books-modal overdue-books-modal-small" onClick={e => e.stopPropagation()}>
            <div className="overdue-books-modal-header">
              <h2>Waive Fine</h2>
              <button className="overdue-books-modal-close" onClick={closeWaiveModal}>×</button>
            </div>
            
            <div className="overdue-books-modal-body">
              <p className="overdue-books-waive-message">
                Are you sure you want to waive the fine of <strong>{formatCurrency(selectedOverdue.fineAmount)}</strong> for <strong>{selectedOverdue.memberName}</strong>?
              </p>
              <p className="overdue-books-waive-warning">
                This action cannot be undone.
              </p>
            </div>

            <div className="overdue-books-modal-footer">
              <button className="overdue-books-btn overdue-books-btn-secondary" onClick={closeWaiveModal}>
                Cancel
              </button>
              <button className="overdue-books-btn overdue-books-btn-danger" onClick={confirmWaiveFine}>
                Waive Fine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Reminder Modal */}
      {showReminderModal && selectedOverdue && (
        <div className="overdue-books-modal-overlay" onClick={closeReminderModal}>
          <div className="overdue-books-modal" onClick={e => e.stopPropagation()}>
            <div className="overdue-books-modal-header">
              <h2>Send Reminder</h2>
              <button className="overdue-books-modal-close" onClick={closeReminderModal}>×</button>
            </div>
            
            <div className="overdue-books-modal-body">
              <div className="overdue-books-reminder-info">
                <p><strong>To:</strong> {selectedOverdue.memberName} ({selectedOverdue.memberEmail})</p>
                <p><strong>Subject:</strong> Overdue Book Reminder</p>
              </div>
              
              <div className="overdue-books-form-group">
                <label htmlFor="reminderMessage">Message:</label>
                <textarea
                  id="reminderMessage"
                  rows="6"
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  className="overdue-books-textarea"
                />
              </div>
            </div>

            <div className="overdue-books-modal-footer">
              <button className="overdue-books-btn overdue-books-btn-secondary" onClick={closeReminderModal}>
                Cancel
              </button>
              <button className="overdue-books-btn overdue-books-btn-primary" onClick={sendReminder}>
                Send Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverdueBooks;