import { useEffect, useState } from 'react';
import { FiBook, FiCopy, FiEdit, FiEye, FiGrid, FiSearch, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAlert } from '../../context/AlertContext';
import bookService from '../../services/bookService';
import borrowService from '../../services/borrowService';
import LoadingSpinner from '../common/LoadingSpinner';
import BookImage from '../common/BookImage';
import './ManageBooks.css';

const ManageBooks = () => {
  const { showSuccess, showError } = useAlert();
  
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookDetails, setBookDetails] = useState(null);
  const [bookBorrows, setBookBorrows] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [filterGenre, setFilterGenre] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all'); // all, available, borrowed
  
  const [genres, setGenres] = useState([]);
  
  const [editFormData, setEditFormData] = useState({
    bookId: '',
    bookTitle: '',
    bookAuthor: '',
    bookGenre: '',
    bookIsbn: '',
    bookPublisher: '',
    bookPublicationYear: '',
    bookPrice: '',
    bookDescription: '',
    shelfLocation: '',
    totalCopies: 1,
    availableCopies: 1,
    bookAvailable: true,
    bookImage: null
  });

  const [addFormData, setAddFormData] = useState({
    bookTitle: '',
    bookAuthor: '',
    bookGenre: '',
    bookIsbn: '',
    bookPublisher: '',
    bookPublicationYear: '',
    bookPrice: '',
    bookDescription: '',
    shelfLocation: '',
    totalCopies: 1,
    bookImage: null
  });

  const [availabilityData, setAvailabilityData] = useState({
    totalCopies: 1
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [addImagePreview, setAddImagePreview] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchTerm, filterGenre, filterAvailability, books]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getAllBooks();
      if (response.code === '00') {
        setBooks(response.content || []);
        setFilteredBooks(response.content || []);
        
        // Extract unique genres
        const uniqueGenres = [...new Set(response.content.map(book => book.bookGenre).filter(Boolean))];
        setGenres(uniqueGenres);
      } else {
        showError('Failed to fetch books');
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      showError('Error fetching books');
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = [...books];
    
    // Apply genre filter
    if (filterGenre !== 'all') {
      filtered = filtered.filter(book => book.bookGenre === filterGenre);
    }
    
    // Apply availability filter
    if (filterAvailability !== 'all') {
      if (filterAvailability === 'available') {
        filtered = filtered.filter(book => book.bookAvailable && book.availableCopies > 0);
      } else if (filterAvailability === 'borrowed') {
        filtered = filtered.filter(book => !book.bookAvailable || book.availableCopies === 0);
      }
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(book => 
        book.bookTitle?.toLowerCase().includes(term) ||
        book.bookAuthor?.toLowerCase().includes(term) ||
        book.bookIsbn?.toLowerCase().includes(term) ||
        book.bookGenre?.toLowerCase().includes(term)
      );
    }
    
    setFilteredBooks(filtered);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleGenreFilterChange = (genre) => {
    setFilterGenre(genre);
  };

  const handleAvailabilityFilterChange = (filter) => {
    setFilterAvailability(filter);
  };

  const handleViewBook = async (book) => {
    setSelectedBook(book);
    setShowDetailsModal(true);
    
    try {
      // Fetch book details
      const detailsResponse = await bookService.getBookById(book.bookId);
      if (detailsResponse.code === '00') {
        setBookDetails(detailsResponse.content);
      }
      
      // Fetch book borrow history
      const borrowsResponse = await borrowService.getBookBorrowHistory(book.bookId);
      if (borrowsResponse.code === '00') {
        setBookBorrows(borrowsResponse.content || []);
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
      showError('Failed to load book details');
    }
  };

  const handleEditBook = (book) => {
    setSelectedBook(book);
    setEditFormData({
      bookId: book.bookId,
      bookTitle: book.bookTitle || '',
      bookAuthor: book.bookAuthor || '',
      bookGenre: book.bookGenre || '',
      bookIsbn: book.bookIsbn || '',
      bookPublisher: book.bookPublisher || '',
      bookPublicationYear: book.bookPublicationYear || '',
      bookPrice: book.bookPrice || '',
      bookDescription: book.bookDescription || '',
      shelfLocation: book.shelfLocation || '',
      totalCopies: book.totalCopies || 1,
      availableCopies: book.availableCopies || 1,
      bookAvailable: book.bookAvailable,
      bookImage: null
    });
    
    // Set image preview if exists
    if (book.bookImageUrl) {
      const baseUrl = process.env.REACT_APP_IMAGE_URL || 'http://localhost:8080';
      setImagePreview(`${baseUrl}${book.bookImageUrl}`);
    } else {
      setImagePreview(null);
    }
    
    setShowEditModal(true);
  };

  const handleAddBook = () => {
    setAddFormData({
      bookTitle: '',
      bookAuthor: '',
      bookGenre: '',
      bookIsbn: '',
      bookPublisher: '',
      bookPublicationYear: '',
      bookPrice: '',
      bookDescription: '',
      shelfLocation: '',
      totalCopies: 1,
      bookImage: null
    });
    setAddImagePreview(null);
    setShowAddModal(true);
  };

  const handleAvailabilityClick = (book) => {
    setSelectedBook(book);
    setAvailabilityData({
      totalCopies: book.totalCopies || 1
    });
    setShowAvailabilityModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      setEditFormData({
        ...editFormData,
        bookImage: file
      });
      
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setEditFormData({
        ...editFormData,
        [name]: value
      });
    }
  };

  const handleAddFormChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      setAddFormData({
        ...addFormData,
        bookImage: file
      });
      
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAddImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setAddFormData({
        ...addFormData,
        [name]: value
      });
    }
  };

  const handleAvailabilityChange = (e) => {
    const { name, value } = e.target;
    setAvailabilityData({
      ...availabilityData,
      [name]: parseInt(value) || 1
    });
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    
    try {
      const response = await bookService.updateBook(editFormData);
      if (response.code === '00') {
        showSuccess('Book updated successfully');
        fetchBooks();
        setShowEditModal(false);
      } else {
        showError(response.message || 'Failed to update book');
      }
    } catch (error) {
      console.error('Error updating book:', error);
      showError('Failed to update book');
    }
  };

  const handleAddNewBook = async (e) => {
    e.preventDefault();
    
    try {
      const response = await bookService.addBook(addFormData);
      if (response.code === '00') {
        showSuccess('Book added successfully');
        fetchBooks();
        setShowAddModal(false);
      } else {
        showError(response.message || 'Failed to add book');
      }
    } catch (error) {
      console.error('Error adding book:', error);
      showError('Failed to add book');
    }
  };

  const handleUpdateAvailability = async (e) => {
    e.preventDefault();
    
    try {
      const response = await bookService.updateBookAvailability(
        selectedBook.bookId, 
        availabilityData.totalCopies
      );
      if (response.code === '00') {
        showSuccess('Book availability updated successfully');
        fetchBooks();
        setShowAvailabilityModal(false);
      } else {
        showError(response.message || 'Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      showError('Failed to update availability');
    }
  };

  const handleDeleteBook = async (bookId, bookTitle) => {
    if (window.confirm(`Are you sure you want to delete "${bookTitle}"? This action cannot be undone.`)) {
      try {
        const response = await bookService.deleteBook(bookId);
        if (response.code === '00') {
          showSuccess('Book deleted successfully');
          fetchBooks();
        } else {
          showError(response.message || 'Failed to delete book');
        }
      } catch (error) {
        console.error('Error deleting book:', error);
        showError('Failed to delete book');
      }
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedBook(null);
    setBookDetails(null);
    setBookBorrows([]);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedBook(null);
    setImagePreview(null);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddImagePreview(null);
  };

  const closeAvailabilityModal = () => {
    setShowAvailabilityModal(false);
    setSelectedBook(null);
  };

  const calculateBorrowedCopies = (book) => {
    return (book.totalCopies || 0) - (book.availableCopies || 0);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="manage-books">
      <div className="page-header">
        <h1>Manage Books</h1>
        <div className="header-actions">
          <button onClick={handleAddBook} className="book-btn book-btn-primary">
            + Add New Book
          </button>
          <Link to="/admin/dashboard" className="book-btn book-btn-secondary">
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
            placeholder="Search by title, author, ISBN, or genre..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <div className="filter-label">
            <FiGrid /> Genre:
          </div>
          <select 
            value={filterGenre} 
            onChange={(e) => handleGenreFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Genres</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <div className="filter-label">
            <FiBook /> Availability:
          </div>
          <select 
            value={filterAvailability} 
            onChange={(e) => handleAvailabilityFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Books</option>
            <option value="available">Available Only</option>
            <option value="borrowed">Borrowed Only</option>
          </select>
        </div>
      </div>

      {/* Books Grid */}
      <div className="books-grid">
        {filteredBooks.length > 0 ? (
          filteredBooks.map(book => (
            <div key={book.bookId} className="book-card">
              <BookImage 
                imageUrl={book.bookImageUrl} 
                title={book.bookTitle} 
                size={200}
              />
              
              <div className="book-info">
                <h3 className="book-title">{book.bookTitle}</h3>
                <p className="book-author">by {book.bookAuthor}</p>
                {book.bookGenre && (
                  <span className="book-genre">{book.bookGenre}</span>
                )}
                
                <div className="book-details">
                  <p><strong>ISBN:</strong> {book.bookIsbn || 'N/A'}</p>
                  <p><strong>Publisher:</strong> {book.bookPublisher || 'N/A'}</p>
                  <p><strong>Year:</strong> {book.bookPublicationYear || 'N/A'}</p>
                  <p><strong>Price:</strong> Rs. {book.bookPrice || 'N/A'}</p>
                  <p><strong>Location:</strong> {book.shelfLocation || 'N/A'}</p>
                </div>
                
                <div className="book-copies">
                  <span className={`copies-badge ${book.availableCopies > 0 ? 'available' : 'unavailable'}`}>
                    Available: {book.availableCopies || 0}/{book.totalCopies || 0}
                  </span>
                  <span className={`status-badge ${book.bookAvailable ? 'active' : 'inactive'}`}>
                    {book.bookAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
              
              <div className="book-actions">
                <button 
                  className="action-btn view"
                  onClick={() => handleViewBook(book)}
                  title="View Details"
                >
                  <FiEye />
                </button>
                <button 
                  className="action-btn edit"
                  onClick={() => handleEditBook(book)}
                  title="Edit Book"
                >
                  <FiEdit />
                </button>
                <button 
                  className="action-btn copies"
                  onClick={() => handleAvailabilityClick(book)}
                  title="Update Copies"
                >
                  <FiCopy />
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => handleDeleteBook(book.bookId, book.bookTitle)}
                  title="Delete Book"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">
            <p>No books found</p>
          </div>
        )}
      </div>

      {/* Book Details Modal */}
      {showDetailsModal && selectedBook && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-content book-details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Book Details</h2>
              <button className="close-btn" onClick={closeDetailsModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="details-layout">
                <div className="details-image">
                  <BookImage 
                    imageUrl={selectedBook.bookImageUrl} 
                    title={selectedBook.bookTitle} 
                    size={250}

                  />
                </div>
                
                <div className="details-info">
                  <h3>{selectedBook.bookTitle}</h3>
                  <p className="author">by {selectedBook.bookAuthor}</p>
                  
                  <div className="info-grid">
                    <div className="info-item">
                      <label>ISBN:</label>
                      <span>{selectedBook.bookIsbn || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Genre:</label>
                      <span>{selectedBook.bookGenre || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Publisher:</label>
                      <span>{selectedBook.bookPublisher || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Year:</label>
                      <span>{selectedBook.bookPublicationYear || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Price:</label>
                      <span>Rs. {selectedBook.bookPrice || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Location:</label>
                      <span>{selectedBook.shelfLocation || 'N/A'}</span>
                    </div>
                  </div>
                  
                  {selectedBook.bookDescription && (
                    <div className="description">
                      <label>Description:</label>
                      <p>{selectedBook.bookDescription}</p>
                    </div>
                  )}
                  
                  <div className="copies-info">
                    <div className="copies-stat">
                      <span>Total Copies</span>
                      <strong>{selectedBook.totalCopies || 0}</strong>
                    </div>
                    <div className="copies-stat">
                      <span>Available</span>
                      <strong className="available">{selectedBook.availableCopies || 0}</strong>
                    </div>
                    <div className="copies-stat">
                      <span>Borrowed</span>
                      <strong className="borrowed">{calculateBorrowedCopies(selectedBook)}</strong>
                    </div>
                  </div>
                  
                  <div className="status-display">
                    <span className={`status-badge-large ${selectedBook.bookAvailable ? 'active' : 'inactive'}`}>
                      {selectedBook.bookAvailable ? 'Available for Borrowing' : 'Not Available'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Borrow History */}
              {bookBorrows.length > 0 && (
                <div className="borrow-history">
                  <h4>Borrow History</h4>
                  <div className="history-list">
                    {bookBorrows.slice(0, 10).map(borrow => (
                      <div key={borrow.borrowId} className="history-item">
                        <div>
                          <span className="member-name">{borrow.memberName}</span>
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditModal && selectedBook && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content edit-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Book</h2>
              <button className="close-btn" onClick={closeEditModal}>×</button>
            </div>
            
            <form onSubmit={handleUpdateBook}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="bookTitle">Title *</label>
                    <input
                      type="text"
                      id="bookTitle"
                      name="bookTitle"
                      value={editFormData.bookTitle}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bookAuthor">Author *</label>
                    <input
                      type="text"
                      id="bookAuthor"
                      name="bookAuthor"
                      value={editFormData.bookAuthor}
                      onChange={handleEditFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="bookGenre">Genre</label>
                    <input
                      type="text"
                      id="bookGenre"
                      name="bookGenre"
                      value={editFormData.bookGenre}
                      onChange={handleEditFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bookIsbn">ISBN</label>
                    <input
                      type="text"
                      id="bookIsbn"
                      name="bookIsbn"
                      value={editFormData.bookIsbn}
                      onChange={handleEditFormChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="bookPublisher">Publisher</label>
                    <input
                      type="text"
                      id="bookPublisher"
                      name="bookPublisher"
                      value={editFormData.bookPublisher}
                      onChange={handleEditFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bookPublicationYear">Publication Year</label>
                    <input
                      type="number"
                      id="bookPublicationYear"
                      name="bookPublicationYear"
                      value={editFormData.bookPublicationYear}
                      onChange={handleEditFormChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="bookPrice">Price (Rs.)</label>
                    <input
                      type="number"
                      id="bookPrice"
                      name="bookPrice"
                      step="0.01"
                      value={editFormData.bookPrice}
                      onChange={handleEditFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="shelfLocation">Shelf Location</label>
                    <input
                      type="text"
                      id="shelfLocation"
                      name="shelfLocation"
                      value={editFormData.shelfLocation}
                      onChange={handleEditFormChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="totalCopies">Total Copies</label>
                    <input
                      type="number"
                      id="totalCopies"
                      name="totalCopies"
                      min="1"
                      value={editFormData.totalCopies}
                      onChange={handleEditFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="availableCopies">Available Copies</label>
                    <input
                      type="number"
                      id="availableCopies"
                      name="availableCopies"
                      min="0"
                      value={editFormData.availableCopies}
                      onChange={handleEditFormChange}
                      readOnly
                      className="readonly"
                    />
                    <small>Auto-calculated based on borrows</small>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bookDescription">Description</label>
                  <textarea
                    id="bookDescription"
                    name="bookDescription"
                    value={editFormData.bookDescription}
                    onChange={handleEditFormChange}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bookImage">Book Cover Image</label>
                  <input
                    type="file"
                    id="bookImage"
                    name="bookImage"
                    accept="image/*"
                    onChange={handleEditFormChange}
                  />
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  )}
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="bookAvailable"
                      checked={editFormData.bookAvailable}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        bookAvailable: e.target.checked
                      })}
                    />
                    Available for Borrowing
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeEditModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal-content edit-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Book</h2>
              <button className="close-btn" onClick={closeAddModal}>×</button>
            </div>
            
            <form onSubmit={handleAddNewBook}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="bookTitle">Title *</label>
                    <input
                      type="text"
                      id="bookTitle"
                      name="bookTitle"
                      value={addFormData.bookTitle}
                      onChange={handleAddFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bookAuthor">Author *</label>
                    <input
                      type="text"
                      id="bookAuthor"
                      name="bookAuthor"
                      value={addFormData.bookAuthor}
                      onChange={handleAddFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="bookGenre">Genre</label>
                    <input
                      type="text"
                      id="bookGenre"
                      name="bookGenre"
                      value={addFormData.bookGenre}
                      onChange={handleAddFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bookIsbn">ISBN</label>
                    <input
                      type="text"
                      id="bookIsbn"
                      name="bookIsbn"
                      value={addFormData.bookIsbn}
                      onChange={handleAddFormChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="bookPublisher">Publisher</label>
                    <input
                      type="text"
                      id="bookPublisher"
                      name="bookPublisher"
                      value={addFormData.bookPublisher}
                      onChange={handleAddFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bookPublicationYear">Publication Year</label>
                    <input
                      type="number"
                      id="bookPublicationYear"
                      name="bookPublicationYear"
                      value={addFormData.bookPublicationYear}
                      onChange={handleAddFormChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="bookPrice">Price (Rs.)</label>
                    <input
                      type="number"
                      id="bookPrice"
                      name="bookPrice"
                      step="0.01"
                      value={addFormData.bookPrice}
                      onChange={handleAddFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="shelfLocation">Shelf Location</label>
                    <input
                      type="text"
                      id="shelfLocation"
                      name="shelfLocation"
                      value={addFormData.shelfLocation}
                      onChange={handleAddFormChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="totalCopies">Total Copies</label>
                  <input
                    type="number"
                    id="totalCopies"
                    name="totalCopies"
                    min="1"
                    value={addFormData.totalCopies}
                    onChange={handleAddFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bookDescription">Description</label>
                  <textarea
                    id="bookDescription"
                    name="bookDescription"
                    value={addFormData.bookDescription}
                    onChange={handleAddFormChange}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bookImage">Book Cover Image</label>
                  <input
                    type="file"
                    id="bookImage"
                    name="bookImage"
                    accept="image/*"
                    onChange={handleAddFormChange}
                  />
                  {addImagePreview && (
                    <div className="image-preview">
                      <img src={addImagePreview} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeAddModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Availability Modal */}
      {showAvailabilityModal && selectedBook && (
        <div className="modal-overlay" onClick={closeAvailabilityModal}>
          <div className="modal-content availability-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Book Copies</h2>
              <button className="close-btn" onClick={closeAvailabilityModal}>×</button>
            </div>
            
            <form onSubmit={handleUpdateAvailability}>
              <div className="modal-body">
                <p className="book-title-modal">{selectedBook.bookTitle}</p>
                
                <div className="current-copies">
                  <div className="copy-stat">
                    <span>Current Total:</span>
                    <strong>{selectedBook.totalCopies}</strong>
                  </div>
                  <div className="copy-stat">
                    <span>Available:</span>
                    <strong>{selectedBook.availableCopies}</strong>
                  </div>
                  <div className="copy-stat">
                    <span>Borrowed:</span>
                    <strong>{calculateBorrowedCopies(selectedBook)}</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="totalCopies">New Total Copies</label>
                  <input
                    type="number"
                    id="totalCopies"
                    name="totalCopies"
                    min={calculateBorrowedCopies(selectedBook)}
                    value={availabilityData.totalCopies}
                    onChange={handleAvailabilityChange}
                    required
                  />
                  <small>Minimum: {calculateBorrowedCopies(selectedBook)} (currently borrowed)</small>
                </div>

                <div className="warning-message">
                  <p>⚠️ After update, available copies will be: {availabilityData.totalCopies - calculateBorrowedCopies(selectedBook)}</p>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeAvailabilityModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Copies
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBooks;