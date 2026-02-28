import api from './api';

const bookService = {
  // Public endpoints
  getAllBooks: async () => {
    try {
      const response = await api.get('/books/public/all');
      return response.data;
    } catch (error) {
      console.error('Error in getAllBooks:', error);
      throw error;
    }
  },

  getBookById: async (bookId) => {
    try {
      const response = await api.get(`/books/public/${bookId}`);
      return response.data;
    } catch (error) {
      console.error('Error in getBookById:', error);
      throw error;
    }
  },

  searchBooks: async (keyword) => {
    try {
      const response = await api.get(`/books/public/search?keyword=${keyword}`);
      return response.data;
    } catch (error) {
      console.error('Error in searchBooks:', error);
      throw error;
    }
  },

  getAvailableBooks: async () => {
    try {
      const response = await api.get('/books/public/available');
      return response.data;
    } catch (error) {
      console.error('Error in getAvailableBooks:', error);
      throw error;
    }
  },

  getBooksByGenre: async (genre) => {
    try {
      const response = await api.get(`/books/public/genre/${genre}`);
      return response.data;
    } catch (error) {
      console.error('Error in getBooksByGenre:', error);
      throw error;
    }
  },

  getBooksByAuthor: async (author) => {
    try {
      const response = await api.get(`/books/public/author/${author}`);
      return response.data;
    } catch (error) {
      console.error('Error in getBooksByAuthor:', error);
      throw error;
    }
  },

  // Admin endpoints
  addBook: async (bookData) => {
    try {
      const formData = new FormData();
      Object.keys(bookData).forEach(key => {
        if (bookData[key] !== null && bookData[key] !== undefined) {
          formData.append(key, bookData[key]);
        }
      });
      
      // Log FormData contents for debugging
      console.log('Adding book with data:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      const response = await api.post('/books/admin/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error in addBook:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      throw error;
    }
  },

  updateBook: async (bookData) => {
    try {
      const formData = new FormData();
      Object.keys(bookData).forEach(key => {
        if (bookData[key] !== null && bookData[key] !== undefined) {
          formData.append(key, bookData[key]);
        }
      });
      
      // Log FormData contents for debugging
      console.log('Updating book with data:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      const response = await api.put('/books/admin/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error in updateBook:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      throw error;
    }
  },

  updateBookAvailability: async (bookId, totalCopies) => {
    try {
      console.log(`Updating availability for book ${bookId} to ${totalCopies} copies`);
      const response = await api.put(`/books/admin/${bookId}/availability?totalCopies=${totalCopies}`);
      return response.data;
    } catch (error) {
      console.error('Error in updateBookAvailability:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      throw error;
    }
  },

  deleteBook: async (bookId) => {
    try {
      console.log(`Deleting book ${bookId}`);
      const response = await api.delete(`/books/admin/delete/${bookId}`);
      return response.data;
    } catch (error) {
      console.error('Error in deleteBook:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      throw error;
    }
  }
};

export default bookService;