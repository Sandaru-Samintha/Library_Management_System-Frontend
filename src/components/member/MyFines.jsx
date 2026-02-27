import React, { useState, useEffect } from 'react';
import { useAlert } from '../../context/AlertContext';
import fineService from '../../services/fineService';
import LoadingSpinner from '../common/LoadingSpinner';
import { FiDollarSign, FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi';
import './MyFines.css';

const MyFines = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, PAID, UNPAID
  const [selectedFine, setSelectedFine] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    try {
      setLoading(true);
      const response = await fineService.getMyFines();
      
      if (response.code === '00') {
        setFines(response.content || []);
      } else {
        showError(response.message || 'Failed to load fines');
      }
    } catch (error) {
      showError('Error loading fines');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayFine = async (fineId) => {
    if (!window.confirm('Are you sure you want to mark this fine as paid?')) {
      return;
    }

    try {
      setProcessingId(fineId);
      const response = await fineService.payFine(fineId);
      
      if (response.code === '00') {
        showSuccess('Fine paid successfully!');
        fetchFines(); // Refresh the list
      } else {
        showError(response.message || 'Failed to pay fine');
      }
    } catch (error) {
      showError('Error paying fine');
      console.error('Error:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewDetails = (fine) => {
    setSelectedFine(fine);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedFine(null);
  };

  const getFilteredFines = () => {
    if (filter === 'ALL') return fines;
    return fines.filter(fine => fine.status === filter);
  };

  const calculateTotalFines = () => {
    return fines
      .filter(fine => fine.status === 'UNPAID')
      .reduce((sum, fine) => sum + (fine.amount || 0), 0);
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
    return `Rs. ${amount?.toFixed(2) || '0.00'}`;
  };

  const calculateDaysOverdue = (dueDate, returnDate) => {
    if (!dueDate) return 'N/A';
    
    const due = new Date(dueDate);
    const end = returnDate ? new Date(returnDate) : new Date();
    
    if (end > due) {
      const diffTime = Math.abs(end - due);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const filteredFines = getFilteredFines();
  const totalUnpaid = calculateTotalFines();

  return (
    <div className="fines-container">
      <div className="fines-header">
        <h1 className="fines-title">My Fines</h1>
        <p className="fines-subtitle">View and manage your library fines</p>
      </div>

      {/* Summary Cards */}
      <div className="fines-summary">
        <div className="summary-card total">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <h3>Total Unpaid</h3>
            <p className="summary-value">{formatCurrency(totalUnpaid)}</p>
          </div>
        </div>
        
        <div className="summary-card count">
          <div className="summary-icon">📋</div>
          <div className="summary-content">
            <h3>Total Fines</h3>
            <p className="summary-value">{fines.length}</p>
          </div>
        </div>
        
        <div className="summary-card unpaid">
          <div className="summary-icon">⏳</div>
          <div className="summary-content">
            <h3>Unpaid</h3>
            <p className="summary-value">{fines.filter(f => f.status === 'UNPAID').length}</p>
          </div>
        </div>
        
        <div className="summary-card paid">
          <div className="summary-icon">✅</div>
          <div className="summary-content">
            <h3>Paid</h3>
            <p className="summary-value">{fines.filter(f => f.status === 'PAID').length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="fines-filters">
        <button 
          className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          All Fines
        </button>
        <button 
          className={`filter-btn ${filter === 'UNPAID' ? 'active' : ''}`}
          onClick={() => setFilter('UNPAID')}
        >
          Unpaid
        </button>
        <button 
          className={`filter-btn ${filter === 'PAID' ? 'active' : ''}`}
          onClick={() => setFilter('PAID')}
        >
          Paid
        </button>
      </div>

      {/* Fines Table */}
      {filteredFines.length > 0 ? (
        <div className="table-container">
          <table className="fines-table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Fine Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Days Overdue</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFines.map((fine) => {
                const daysOverdue = calculateDaysOverdue(fine.dueDate, fine.returnDate);
                
                return (
                  <tr key={fine.fineId} className={fine.status === 'UNPAID' ? 'unpaid-row' : 'paid-row'}>
                    <td className="book-info">
                      <strong>{fine.bookTitle || 'Unknown Book'}</strong>
                      {fine.borrowId && (
                        <small className="borrow-id">ID: {fine.borrowId}</small>
                      )}
                    </td>
                    <td>{formatDate(fine.fineDate)}</td>
                    <td>{formatDate(fine.dueDate)}</td>
                    <td>{fine.returnDate ? formatDate(fine.returnDate) : 'Not Returned'}</td>
                    <td>
                      {daysOverdue > 0 ? (
                        <span className="days-badge">{daysOverdue} days</span>
                      ) : (
                        <span className="days-badge zero">0 days</span>
                      )}
                    </td>
                    <td className={`amount ${fine.status === 'UNPAID' ? 'unpaid' : 'paid'}`}>
                      {formatCurrency(fine.amount)}
                    </td>
                    <td>
                      <span className={`status-badge ${fine.status.toLowerCase()}`}>
                        {fine.status === 'PAID' ? <FiCheckCircle /> : <FiXCircle />}
                        {fine.status}
                      </span>
                    </td>
                    <td className="actions">
                      <button 
                        className="btn-icon view"
                        onClick={() => handleViewDetails(fine)}
                        title="View Details"
                      >
                        <FiEye />
                      </button>
                      {fine.status === 'UNPAID' && (
                        <button 
                          className="btn-icon pay"
                          onClick={() => handlePayFine(fine.fineId)}
                          disabled={processingId === fine.fineId}
                          title="Mark as Paid"
                        >
                          {processingId === fine.fineId ? '...' : <FiDollarSign />}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-fines">
          <h3>No Fines Found</h3>
          <p>You don't have any fines at the moment. Keep up the good work!</p>
        </div>
      )}

      {/* Fine Details Modal */}
      {showDetails && selectedFine && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Fine Details</h2>
              <button className="close-btn" onClick={handleCloseDetails}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3>Book Information</h3>
                <p><strong>Title:</strong> {selectedFine.bookTitle || 'N/A'}</p>
                <p><strong>Borrow ID:</strong> {selectedFine.borrowId || 'N/A'}</p>
                {selectedFine.bookAuthor && (
                  <p><strong>Author:</strong> {selectedFine.bookAuthor}</p>
                )}
              </div>

              <div className="detail-section">
                <h3>Fine Information</h3>
                <p><strong>Fine ID:</strong> {selectedFine.fineId}</p>
                <p><strong>Fine Date:</strong> {formatDate(selectedFine.fineDate)}</p>
                <p><strong>Amount:</strong> {formatCurrency(selectedFine.amount)}</p>
                <p><strong>Status:</strong> 
                  <span className={`status-badge ${selectedFine.status.toLowerCase()} ml-2`}>
                    {selectedFine.status}
                  </span>
                </p>
              </div>

              <div className="detail-section">
                <h3>Borrow Details</h3>
                <p><strong>Borrow Date:</strong> {formatDate(selectedFine.borrowDate)}</p>
                <p><strong>Due Date:</strong> {formatDate(selectedFine.dueDate)}</p>
                {selectedFine.returnDate && (
                  <p><strong>Return Date:</strong> {formatDate(selectedFine.returnDate)}</p>
                )}
                <p><strong>Days Overdue:</strong> {
                  calculateDaysOverdue(selectedFine.dueDate, selectedFine.returnDate)
                } days</p>
              </div>

              {selectedFine.status === 'UNPAID' && (
                <div className="detail-section action-section">
                  <button 
                    className="pay-now-btn"
                    onClick={() => {
                      handlePayFine(selectedFine.fineId);
                      handleCloseDetails();
                    }}
                    disabled={processingId === selectedFine.fineId}
                  >
                    {processingId === selectedFine.fineId ? 'Processing...' : 'Mark as Paid'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFines;