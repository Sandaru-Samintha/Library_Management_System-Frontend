import api from './api';

const borrowService = {
  // Member endpoints
  borrowBook: async (bookId) => {
    const response = await api.post(`/borrow/book/${bookId}`);
    return response.data;
  },

  returnBook: async (borrowId) => {
    const response = await api.put(`/borrow/return/${borrowId}`);
    return response.data;
  },

  getMyBorrowedBooks: async () => {
    const response = await api.get('/borrow/my-books');
    return response.data;
  },

  getMyBorrowHistory: async () => {
    const response = await api.get('/borrow/my-history');
    return response.data;
  },

  checkOverdue: async () => {
    const response = await api.get('/borrow/overdue');
    return response.data;
  },

  // Admin endpoints
  getAllBorrowRecords: async () => {
    const response = await api.get('/borrow/admin/all');
    return response.data;
  },

  getBorrowsByStatus: async (status) => {
    const response = await api.get(`/borrow/admin/status/${status}`);
    return response.data;
  },

  getMemberBorrowHistory: async (memberId) => {
    const response = await api.get(`/borrow/admin/member/${memberId}`);
    return response.data;
  },

  getBookBorrowHistory: async (bookId) => {
    const response = await api.get(`/borrow/admin/book/${bookId}`);
    return response.data;
  },

  extendDueDate: async (borrowId, additionalDays = 7) => {
    const response = await api.put(`/borrow/admin/${borrowId}/extend?additionalDays=${additionalDays}`);
    return response.data;
  },

  checkOverdueBooks: async () => {
    const response = await api.post('/borrow/admin/check-overdue');
    return response.data;
  },

  getActiveBorrows: async () => {
    const response = await api.get('/borrow/admin/active');
    return response.data;
  },

  getOverdueBooks: async () => {
    const response = await api.get('/borrow/admin/overdue');
    return response.data;
  },

  getTodayReturns: async () => {
    const response = await api.get('/borrow/admin/today-returns');
    return response.data;
  },

  getBorrowingStats: async () => {
    const response = await api.get('/borrow/admin/stats');
    return response.data;
  }
};

export default borrowService;