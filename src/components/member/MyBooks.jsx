import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import borrowService from '../../services/borrowService';
import { FiBook, FiUser, FiCalendar, FiClock, FiAlertCircle, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import LoadingSpinner from '../common/LoadingSpinner';
import BookImage from '../common/BookImage';
import './MyBooks.css';

const MyBooks = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true);
      const response = await borrowService.getMyBorrowHistory();
      
      if (response.code === '00') {
        setBorrowedBooks(response.content);
      } else {
        showError('Failed to load borrowed books');
      }
    } catch (error) {
      showError('Error loading borrowed books');
      console.error('Error fetching borrowed books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (borrowId) => {
    try {
      setReturningId(borrowId);
      const response = await borrowService.returnBook(borrowId);
      
      if (response.code === '00') {
        showSuccess('Book returned successfully!');
        await fetchBorrowedBooks();
      } else {
        showError(response.message || 'Failed to return book');
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Error returning book');
    } finally {
      setReturningId(null);
    }
  };

  const filterAndSortBooks = () => {
    let filtered = [...borrowedBooks];
    
    // Apply filter
    switch (filter) {
      case 'current':
        filtered = filtered.filter(book => book.status === 'BORROWED');
        break;
      case 'returned':
        filtered = filtered.filter(book => book.status === 'RETURNED');
        break;
      case 'overdue':
        filtered = filtered.filter(book => {
          if (book.status !== 'BORROWED') return false;
          const today = new Date();
          const dueDate = new Date(book.dueDate);
          return dueDate < today;
        });
        break;
      default:
        break;
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'borrowDate':
          if (!a.borrowDate) return 1;
          if (!b.borrowDate) return -1;
          return new Date(b.borrowDate) - new Date(a.borrowDate);
        case 'title':
          return (a.bookTitle || '').localeCompare(b.bookTitle || '');
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const getStatusBadge = (book) => {
    if (book.status === 'RETURNED') {
      return <span className="mybooks-status-badge mybooks-status-returned"><FiCheckCircle /> Returned</span>;
    }
    
    if (book.status === 'OVERDUE') {
      return <span className="mybooks-status-badge mybooks-status-overdue"><FiAlertCircle /> Overdue</span>;
    }
    
    const today = new Date();
    const dueDate = new Date(book.dueDate);
    const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return <span className="mybooks-status-badge mybooks-status-overdue"><FiAlertCircle /> Overdue</span>;
    } else if (daysLeft <= 3) {
      return <span className="mybooks-status-badge mybooks-status-warning"><FiClock /> {daysLeft} days left</span>;
    } else {
      return <span className="mybooks-status-badge mybooks-status-active"><FiBook /> Borrowed</span>;
    }
  };

  const calculateFine = (book) => {
    if (book.status === 'RETURNED' && book.fineAmount > 0) {
      return book.fineAmount;
    }
    
    if (book.status === 'BORROWED' || book.status === 'OVERDUE') {
      const today = new Date();
      const dueDate = new Date(book.dueDate);
      if (dueDate < today) {
        const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
        return daysOverdue * 10;
      }
    }
    
    return 0;
  };

  const filteredAndSortedBooks = filterAndSortBooks();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="mybooks-container">
      <div className="mybooks-header">
        <h1 className="mybooks-title">My Books</h1>
        <p className="mybooks-subtitle">Manage your borrowed books</p>
      </div>

      {/* Filters Section */}
      <div className="mybooks-filters">
        <div className="mybooks-filter-group">
          <label className="mybooks-filter-label">Filter by:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="mybooks-filter-select"
          >
            <option value="all">All Books</option>
            <option value="current">Currently Borrowed</option>
            <option value="overdue">Overdue</option>
            <option value="returned">Returned</option>
          </select>
        </div>

        <div className="mybooks-filter-group">
          <label className="mybooks-filter-label">Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="mybooks-filter-select"
          >
            <option value="dueDate">Due Date (Earliest)</option>
            <option value="borrowDate">Borrow Date (Latest)</option>
            <option value="title">Book Title</option>
          </select>
        </div>

        <button className="mybooks-refresh-btn" onClick={fetchBorrowedBooks}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {/* Books List */}
      {filteredAndSortedBooks.length > 0 ? (
        <div className="mybooks-list">
          {filteredAndSortedBooks.map(book => {
            const fine = calculateFine(book);
            const isActive = book.status !== 'RETURNED';
            const isOverdue = book.status === 'OVERDUE' || 
              (book.status === 'BORROWED' && new Date(book.dueDate) < new Date());
            
            return (
              <div 
                key={book.borrowId} 
                className={`mybooks-item ${isActive ? 'mybooks-item-active' : 'mybooks-item-returned'} ${isOverdue ? 'mybooks-item-overdue' : ''}`}
              >
                <div className="mybooks-item-image">
                  <BookImage 
                    imageUrl={book.bookImageUrl} 
                    title={book.bookTitle} 
                    size={100}
                  />
                </div>

                <div className="mybooks-item-content">
                  <div className="mybooks-item-header">
                    <h3 className="mybooks-item-title">{book.bookTitle}</h3>
                    <p className="mybooks-item-author">
                      <FiUser className="mybooks-icon" /> {book.bookAuthor || 'Unknown Author'}
                    </p>
                  </div>
                  
                  <div className="mybooks-item-dates">
                    <div className="mybooks-date-row">
                      <FiCalendar className="mybooks-icon" />
                      <span>Borrowed: {new Date(book.borrowDate).toLocaleDateString()}</span>
                    </div>
                    
                    {isActive ? (
                      <div className="mybooks-date-row">
                        <FiClock className="mybooks-icon" />
                        <span className={isOverdue ? 'mybooks-overdue-text' : ''}>
                          Due: {new Date(book.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <div className="mybooks-date-row">
                        <FiCheckCircle className="mybooks-icon" />
                        <span>Returned: {new Date(book.returnDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {fine > 0 && (
                    <div className="mybooks-fine">
                      <span className="mybooks-fine-label">Fine:</span>
                      <span className="mybooks-fine-amount">Rs. {fine.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="mybooks-item-actions">
                  <div className="mybooks-status">
                    {getStatusBadge(book)}
                  </div>
                  
                  {isActive ? (
                    <button 
                      className="mybooks-return-btn"
                      onClick={() => handleReturn(book.borrowId)}
                      disabled={returningId === book.borrowId}
                    >
                      {returningId === book.borrowId ? 'Returning...' : 'Return Book'}
                    </button>
                  ) : fine > 0 ? (
                    <button 
                      className="mybooks-fine-btn"
                      onClick={() => navigate('/member/fines')}
                    >
                      View Fine
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mybooks-empty">
          <FiBook className="mybooks-empty-icon" />
          <h3>No books found</h3>
          <p>You haven't borrowed any books matching your filters</p>
          {filter !== 'all' && (
            <button 
              className="mybooks-clear-filter"
              onClick={() => setFilter('all')}
            >
              Clear Filters
            </button>
          )}
          <button 
            className="mybooks-browse-btn"
            onClick={() => navigate('/member/books/browse')}
          >
            Browse Books
          </button>
        </div>
      )}
    </div>
  );
};

export default MyBooks;