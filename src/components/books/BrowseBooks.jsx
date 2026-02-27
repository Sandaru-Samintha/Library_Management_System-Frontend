import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import bookService from '../../services/bookService';
import borrowService from '../../services/borrowService';
import { FiSearch, FiFilter, FiBook, FiUser, FiCalendar, FiGrid, FiList, FiX, FiClock, FiCheckCircle } from 'react-icons/fi';
import LoadingSpinner from '../common/LoadingSpinner';
import './BrowseBooks.css';

const BrowseBooks = () => {
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [selectedView, setSelectedView] = useState('all'); // 'all', 'available', 'borrowed'
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [actionId, setActionId] = useState(null);
  
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

  // Get unique genres from books
  const genres = ['all', ...new Set(books.map(book => book.bookGenre).filter(Boolean))];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchTerm, selectedGenre, selectedAvailability, selectedView, books, borrowedBooks]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all books
      const booksResponse = await bookService.getAllBooks();
      
      // Fetch member's borrowed books
      const borrowedResponse = await borrowService.getMyBorrowedBooks();
      
      if (booksResponse.code === '00') {
        setBooks(booksResponse.content);
      }
      
      if (borrowedResponse.code === '00') {
        setBorrowedBooks(borrowedResponse.content);
      }
      
    } catch (error) {
      showError('Error loading data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = [...books];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(book => 
        book.bookTitle?.toLowerCase().includes(term) ||
        book.bookAuthor?.toLowerCase().includes(term) ||
        book.bookGenre?.toLowerCase().includes(term) ||
        book.bookIsbn?.toLowerCase().includes(term)
      );
    }

    // Genre filter
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(book => book.bookGenre === selectedGenre);
    }

    // Availability filter
    if (selectedAvailability === 'available') {
      filtered = filtered.filter(book => book.bookAvailable && book.availableCopies > 0);
    } else if (selectedAvailability === 'unavailable') {
      filtered = filtered.filter(book => !book.bookAvailable || book.availableCopies === 0);
    }

    // View filter (all, available, borrowed)
    if (selectedView === 'borrowed') {
      const borrowedBookIds = borrowedBooks.map(b => b.bookId);
      filtered = filtered.filter(book => borrowedBookIds.includes(book.bookId));
    } else if (selectedView === 'available') {
      filtered = filtered.filter(book => book.bookAvailable && book.availableCopies > 0);
    }

    setFilteredBooks(filtered);
  };

  const handleBorrow = async (bookId) => {
    try {
      setActionId(bookId);
      const response = await borrowService.borrowBook(bookId);
      
      if (response.code === '00') {
        showSuccess('Book borrowed successfully!');
        // Refresh data
        await fetchData();
      } else {
        showError(response.message || 'Failed to borrow book');
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Error borrowing book');
    } finally {
      setActionId(null);
    }
  };

  const handleReturn = async (borrowId) => {
    try {
      setActionId(borrowId);
      const response = await borrowService.returnBook(borrowId);
      
      if (response.code === '00') {
        showSuccess('Book returned successfully!');
        // Refresh data
        await fetchData();
      } else {
        showError(response.message || 'Failed to return book');
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Error returning book');
    } finally {
      setActionId(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGenre('all');
    setSelectedAvailability('all');
    setSelectedView('all');
  };

  const isBookBorrowed = (bookId) => {
    return borrowedBooks.some(b => b.bookId === bookId);
  };

  const getBorrowedBookId = (bookId) => {
    const borrowed = borrowedBooks.find(b => b.bookId === bookId);
    return borrowed?.borrowId;
  };

  const getDueDate = (bookId) => {
    const borrowed = borrowedBooks.find(b => b.bookId === bookId);
    return borrowed?.dueDate;
  };

  const isOverdue = (bookId) => {
    const borrowed = borrowedBooks.find(b => b.bookId === bookId);
    if (!borrowed) return false;
    
    const today = new Date();
    const dueDate = new Date(borrowed.dueDate);
    return dueDate < today;
  };

  const BookCard = ({ book }) => {
    const borrowed = isBookBorrowed(book.bookId);
    const borrowId = getBorrowedBookId(book.bookId);
    const dueDate = getDueDate(book.bookId);
    const overdue = isOverdue(book.bookId);

    return (
      <div className={`book-card ${borrowed ? 'borrowed' : ''} ${overdue ? 'overdue' : ''}`}>
        <div className="book-image">
          {book.bookImageUrl ? (
            <img 
              src={`${process.env.REACT_APP_IMAGE_URL || 'http://localhost:8080/images'}${book.bookImageUrl}`} 
              alt={book.bookTitle}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/200x250?text=No+Cover';
              }}
            />
          ) : (
            <div className="no-image">
              <FiBook className="no-image-icon" />
            </div>
          )}
          {borrowed && (
            <div className="book-badge borrowed">
              {overdue ? '⚠️ Overdue' : '📖 Borrowed'}
            </div>
          )}
        </div>
        
        <div className="book-details">
          <h3 className="book-title">{book.bookTitle}</h3>
          <p className="book-author">
            <FiUser className="icon" /> {book.bookAuthor || 'Unknown Author'}
          </p>
          {book.bookGenre && (
            <p className="book-genre">
              <FiBook className="icon" /> {book.bookGenre}
            </p>
          )}
          <p className="book-isbn">ISBN: {book.bookIsbn || 'N/A'}</p>
          
          {borrowed && dueDate && (
            <div className="book-due-date">
              <FiCalendar className="icon" />
              <span className={overdue ? 'overdue-text' : ''}>
                Due: {new Date(dueDate).toLocaleDateString()}
                {overdue && ' (Overdue)'}
              </span>
            </div>
          )}
          
          <div className="book-stats">
            <span className={`availability ${book.bookAvailable && book.availableCopies > 0 ? 'available' : 'unavailable'}`}>
              {book.bookAvailable && book.availableCopies > 0 ? 'Available' : 'Not Available'}
            </span>
            <span className="copies">
              {book.availableCopies || 0} / {book.totalCopies || 0} copies
            </span>
          </div>

          {borrowed ? (
            <button 
              className="return-btn"
              onClick={() => handleReturn(borrowId)}
              disabled={actionId === borrowId}
            >
              {actionId === borrowId ? 'Returning...' : 'Return Book'}
            </button>
          ) : (
            <button 
              className={`borrow-btn ${!book.bookAvailable || book.availableCopies === 0 ? 'disabled' : ''}`}
              onClick={() => handleBorrow(book.bookId)}
              disabled={!book.bookAvailable || book.availableCopies === 0 || actionId === book.bookId}
            >
              {actionId === book.bookId ? 'Borrowing...' : 'Borrow Book'}
            </button>
          )}
        </div>
      </div>
    );
  };

  const BookListItem = ({ book }) => {
    const borrowed = isBookBorrowed(book.bookId);
    const borrowId = getBorrowedBookId(book.bookId);
    const dueDate = getDueDate(book.bookId);
    const overdue = isOverdue(book.bookId);

    return (
      <div className={`book-list-item ${borrowed ? 'borrowed' : ''} ${overdue ? 'overdue' : ''}`}>
        <div className="list-item-image">
          {book.bookImageUrl ? (
            <img 
              src={`${process.env.REACT_APP_IMAGE_URL || 'http://localhost:8080/images'}${book.bookImageUrl}`} 
              alt={book.bookTitle}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/60x80?text=No+Cover';
              }}
            />
          ) : (
            <div className="no-image-small">
              <FiBook />
            </div>
          )}
        </div>
        
        <div className="list-item-details">
          <h3 className="list-item-title">{book.bookTitle}</h3>
          <p className="list-item-author">
            <FiUser className="icon" /> {book.bookAuthor || 'Unknown Author'}
          </p>
          <div className="list-item-meta">
            {book.bookGenre && <span className="list-item-genre">{book.bookGenre}</span>}
            <span className={`list-item-availability ${book.bookAvailable && book.availableCopies > 0 ? 'available' : 'unavailable'}`}>
              {book.availableCopies || 0} copies available
            </span>
          </div>
          {borrowed && dueDate && (
            <div className="list-item-due">
              <FiCalendar className="icon" />
              <span className={overdue ? 'overdue-text' : ''}>
                Due: {new Date(dueDate).toLocaleDateString()}
                {overdue && ' (Overdue)'}
              </span>
            </div>
          )}
        </div>

        {borrowed ? (
          <button 
            className="list-item-return-btn"
            onClick={() => handleReturn(borrowId)}
            disabled={actionId === borrowId}
          >
            {actionId === borrowId ? 'Returning...' : 'Return'}
          </button>
        ) : (
          <button 
            className={`list-item-borrow-btn ${!book.bookAvailable || book.availableCopies === 0 ? 'disabled' : ''}`}
            onClick={() => handleBorrow(book.bookId)}
            disabled={!book.bookAvailable || book.availableCopies === 0 || actionId === book.bookId}
          >
            {actionId === book.bookId ? 'Borrowing...' : 'Borrow'}
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const borrowedCount = borrowedBooks.length;
  const availableCount = books.filter(b => b.bookAvailable && b.availableCopies > 0).length;

  return (
    <div className="browse-books-container">
      <div className="browse-header">
        <h1 className="browse-title">Browse Library Books</h1>
        <p className="browse-subtitle">Discover your next great read</p>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-item">
          <span className="stat-label">Total Books</span>
          <span className="stat-value">{books.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Available</span>
          <span className="stat-value available">{availableCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Borrowed by You</span>
          <span className="stat-value borrowed">{borrowedCount}</span>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by title, author, genre, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <FiX />
            </button>
          )}
        </div>

        <div className="filter-actions">
          <button 
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> Filters
          </button>
          
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <FiGrid />
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <FiList />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>View</label>
            <select 
              value={selectedView} 
              onChange={(e) => setSelectedView(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Books</option>
              <option value="available">Available Books</option>
              <option value="borrowed">Books You've Borrowed</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Genre</label>
            <select 
              value={selectedGenre} 
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="filter-select"
            >
              {genres.map(genre => (
                <option key={genre} value={genre}>
                  {genre === 'all' ? 'All Genres' : genre}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Availability</label>
            <select 
              value={selectedAvailability} 
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Books</option>
              <option value="available">Available Only</option>
              <option value="unavailable">Not Available</option>
            </select>
          </div>

          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>
      )}

      {/* Results Info */}
      <div className="results-info">
        <p>Showing {filteredBooks.length} of {books.length} books</p>
        {borrowedCount > 0 && (
          <p className="borrowed-info">
            You have {borrowedCount} borrowed book{borrowedCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Books Display */}
      {filteredBooks.length === 0 ? (
        <div className="no-results">
          <FiBook className="no-results-icon" />
          <h3>No books found</h3>
          <p>Try adjusting your search or filters</p>
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className={`books-container ${viewMode}`}>
          {filteredBooks.map(book => (
            viewMode === 'grid' ? 
              <BookCard key={book.bookId} book={book} /> : 
              <BookListItem key={book.bookId} book={book} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseBooks;