import api from './api';

const borrowService = {
  // Member endpoints
  borrowBook: async (bookId) => {
    try {
      const response = await api.post(`/borrow/book/${bookId}`);
      return response.data;
    } catch (error) {
      console.error('Error in borrowBook:', error);
      throw error;
    }
  },

  returnBook: async (borrowId) => {
    try {
      const response = await api.put(`/borrow/return/${borrowId}`);
      return response.data;
    } catch (error) {
      console.error('Error in returnBook:', error);
      throw error;
    }
  },

  getMyBorrowedBooks: async () => {
    try {
      const response = await api.get('/borrow/my-books');
      return response.data;
    } catch (error) {
      console.error('Error in getMyBorrowedBooks:', error);
      throw error;
    }
  },

  getMyBorrowHistory: async () => {
    try {
      const response = await api.get('/borrow/my-history');
      return response.data;
    } catch (error) {
      console.error('Error in getMyBorrowHistory:', error);
      throw error;
    }
  },

  getCurrentBorrows: async () => {
    try {
      const response = await api.get('/borrow/current');
      return response.data;
    } catch (error) {
      console.error('Error in getCurrentBorrows:', error);
      throw error;
    }
  },

  checkOverdue: async () => {
    try {
      const response = await api.get('/borrow/overdue');
      return response.data;
    } catch (error) {
      console.error('Error in checkOverdue:', error);
      throw error;
    }
  },

  // Admin endpoints
  getAllBorrowRecords: async () => {
    try {
      const response = await api.get('/borrow/admin/all');
      return response.data;
    } catch (error) {
      console.error('Error in getAllBorrowRecords:', error);
      throw error;
    }
  },

  getBorrowsByStatus: async (status) => {
    try {
      const response = await api.get(`/borrow/admin/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Error in getBorrowsByStatus:', error);
      throw error;
    }
  },

  getMemberBorrowHistory: async (memberId) => {
    try {
      const response = await api.get(`/borrow/admin/member/${memberId}`);
      return response.data;
    } catch (error) {
      console.error('Error in getMemberBorrowHistory:', error);
      throw error;
    }
  },

  getBookBorrowHistory: async (bookId) => {
    try {
      const response = await api.get(`/borrow/admin/book/${bookId}`);
      return response.data;
    } catch (error) {
      console.error('Error in getBookBorrowHistory:', error);
      throw error;
    }
  },

  extendDueDate: async (borrowId, additionalDays = 7) => {
    try {
      const response = await api.put(`/borrow/admin/${borrowId}/extend?additionalDays=${additionalDays}`);
      return response.data;
    } catch (error) {
      console.error('Error in extendDueDate:', error);
      throw error;
    }
  },

  checkOverdueBooks: async () => {
    try {
      const response = await api.post('/borrow/admin/check-overdue');
      return response.data;
    } catch (error) {
      console.error('Error in checkOverdueBooks:', error);
      throw error;
    }
  },

  getActiveBorrows: async () => {
    try {
      const response = await api.get('/borrow/admin/active');
      return response.data;
    } catch (error) {
      console.error('Error in getActiveBorrows:', error);
      throw error;
    }
  },

  getOverdueBooks: async () => {
    try {
      const response = await api.get('/borrow/admin/overdue');
      return response.data;
    } catch (error) {
      console.error('Error in getOverdueBooks:', error);
      throw error;
    }
  },

  getTodayReturns: async () => {
    try {
      const response = await api.get('/borrow/admin/today-returns');
      return response.data;
    } catch (error) {
      console.error('Error in getTodayReturns:', error);
      throw error;
    }
  },

  getBorrowingStats: async () => {
    try {
      const response = await api.get('/borrow/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error in getBorrowingStats:', error);
      throw error;
    }
  }
};

export default borrowService;