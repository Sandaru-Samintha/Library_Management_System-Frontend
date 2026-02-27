import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import borrowService from '../../services/borrowService';
import { FiBook, FiUser, FiCalendar, FiClock, FiAlertCircle, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import LoadingSpinner from '../common/LoadingSpinner';
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
      return <span className="status-badge returned"><FiCheckCircle /> Returned</span>;
    }
    
    if (book.status === 'OVERDUE') {
      return <span className="status-badge overdue"><FiAlertCircle /> Overdue</span>;
    }
    
    const today = new Date();
    const dueDate = new Date(book.dueDate);
    const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return <span className="status-badge overdue"><FiAlertCircle /> Overdue</span>;
    } else if (daysLeft <= 3) {
      return <span className="status-badge warning"><FiClock /> {daysLeft} days left</span>;
    } else {
      return <span className="status-badge active"><FiBook /> Borrowed</span>;
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

  // Separate books into borrowed (active) and returned
  const activeBooks = borrowedBooks.filter(book => book.status !== 'RETURNED');
  const returnedBooks = borrowedBooks.filter(book => book.status === 'RETURNED');

  const filteredActiveBooks = filterAndSortBooks().filter(book => book.status !== 'RETURNED');
  const filteredReturnedBooks = filterAndSortBooks().filter(book => book.status === 'RETURNED');

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
      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Books</option>
            <option value="current">Currently Borrowed</option>
            <option value="overdue">Overdue</option>
            <option value="returned">Returned</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="dueDate">Due Date (Earliest)</option>
            <option value="borrowDate">Borrow Date (Latest)</option>
            <option value="title">Book Title</option>
          </select>
        </div>

        <button className="refresh-btn" onClick={fetchBorrowedBooks}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {/* Active Books Section (Borrowed) - Always on top */}
      {filteredActiveBooks.length > 0 && (
        <div className="books-section">
          <h2 className="section-title">
            Currently Borrowed Books 
            <span className="section-count">({filteredActiveBooks.length})</span>
          </h2>
          <div className="books-list">
            {filteredActiveBooks.map(book => {
              const fine = calculateFine(book);
              const isOverdue = book.status === 'OVERDUE' || 
                (book.status === 'BORROWED' && new Date(book.dueDate) < new Date());
              
              return (
                <div key={book.borrowId} className={`book-item ${book.status.toLowerCase()} ${isOverdue ? 'overdue' : ''}`}>
                  <div className="book-item-image">
                    {book.bookImageUrl ? (
                      <img 
                        src={`${process.env.REACT_APP_IMAGE_URL || 'http://localhost:8080/images'}${book.bookImageUrl}`} 
                        alt={book.bookTitle}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/80x100?text=No+Cover';
                        }}
                      />
                    ) : (
                      <div className="no-image">
                        <FiBook />
                      </div>
                    )}
                  </div>

                  <div className="book-item-details">
                    <h3 className="book-item-title">{book.bookTitle}</h3>
                    <p className="book-item-author">
                      <FiUser /> {book.bookAuthor || 'Unknown Author'}
                    </p>
                    
                    <div className="book-item-meta">
                      <div className="meta-row">
                        <FiCalendar />
                        <span>Borrowed: {new Date(book.borrowDate).toLocaleDateString()}</span>
                      </div>
                      <div className="meta-row">
                        <FiClock />
                        <span className={isOverdue ? 'overdue-text' : ''}>
                          Due: {new Date(book.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {fine > 0 && (
                      <div className="fine-info">
                        <span className="fine-label">Fine:</span>
                        <span className="fine-amount">Rs. {fine.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="book-item-status">
                    {getStatusBadge(book)}
                    
                    <button 
                      className="return-action-btn"
                      onClick={() => handleReturn(book.borrowId)}
                      disabled={returningId === book.borrowId}
                    >
                      {returningId === book.borrowId ? 'Returning...' : 'Return Book'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Returned Books Section - Always at bottom */}
      {filteredReturnedBooks.length > 0 && (
        <div className="books-section returned-section">
          <h2 className="section-title">
            Returned Books 
            <span className="section-count">({filteredReturnedBooks.length})</span>
          </h2>
          <div className="books-list">
            {filteredReturnedBooks.map(book => {
              const fine = calculateFine(book);
              
              return (
                <div key={book.borrowId} className="book-item returned">
                  <div className="book-item-image">
                    {book.bookImageUrl ? (
                      <img 
                        src={`${process.env.REACT_APP_IMAGE_URL || 'http://localhost:8080/images'}${book.bookImageUrl}`} 
                        alt={book.bookTitle}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/80x100?text=No+Cover';
                        }}
                      />
                    ) : (
                      <div className="no-image">
                        <FiBook />
                      </div>
                    )}
                  </div>

                  <div className="book-item-details">
                    <h3 className="book-item-title">{book.bookTitle}</h3>
                    <p className="book-item-author">
                      <FiUser /> {book.bookAuthor || 'Unknown Author'}
                    </p>
                    
                    <div className="book-item-meta">
                      <div className="meta-row">
                        <FiCalendar />
                        <span>Borrowed: {new Date(book.borrowDate).toLocaleDateString()}</span>
                      </div>
                      <div className="meta-row">
                        <FiCheckCircle />
                        <span>Returned: {new Date(book.returnDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {fine > 0 && (
                      <div className="fine-info">
                        <span className="fine-label">Fine Paid:</span>
                        <span className="fine-amount">Rs. {fine.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="book-item-status">
                    {getStatusBadge(book)}
                    
                    {fine > 0 && (
                      <button 
                        className="pay-fine-btn"
                        onClick={() => navigate('/member/fines')}
                      >
                        View Fine
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Books State */}
      {borrowedBooks.length === 0 && (
        <div className="no-books">
          <FiBook className="no-books-icon" />
          <h3>No books found</h3>
          <p>You haven't borrowed any books yet</p>
          <button 
            className="browse-btn"
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