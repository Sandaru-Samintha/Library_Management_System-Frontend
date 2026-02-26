import api from './api';

const fineService = {
  getMyFines: async () => {
    const response = await api.get('/fines/my-fines');
    return response.data;
  },

  payFine: async (fineId) => {
    const response = await api.post(`/fines/pay/${fineId}`);
    return response.data;
  },

  getAllFines: async () => {
    const response = await api.get('/fines/admin/all');
    return response.data;
  },

  getFinesByStatus: async (status) => {
    const response = await api.get(`/fines/admin/status/${status}`);
    return response.data;
  },

  getMemberFines: async (memberId) => {
    const response = await api.get(`/fines/admin/member/${memberId}`);
    return response.data;
  },

  waiveFine: async (fineId) => {
    const response = await api.put(`/fines/admin/waive/${fineId}`);
    return response.data;
  }
};

export default fineService;