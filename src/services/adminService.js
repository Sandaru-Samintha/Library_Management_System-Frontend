import api from './api';

const adminService = {
  createAdmin: async (adminData) => {
    const formData = new FormData();
    Object.keys(adminData).forEach(key => {
      if (adminData[key] !== null && adminData[key] !== undefined) {
        formData.append(key, adminData[key]);
      }
    });
    
    const response = await api.post('/admin/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getAdminProfile: async () => {
    const response = await api.get('/admin/profile');
    return response.data;
  },

  updateAdminProfile: async (profileData) => {
    const formData = new FormData();
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== null && profileData[key] !== undefined) {
        formData.append(key, profileData[key]);
      }
    });
    
    const response = await api.put('/admin/profile/update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  getAllMembers: async () => {
    const response = await api.get('/admin/members/all');
    return response.data;
  },

  getMemberById: async (memberId) => {
    const response = await api.get(`/admin/members/${memberId}`);
    return response.data;
  },

  searchMembers: async (keyword) => {
    const response = await api.get(`/admin/members/search?keyword=${keyword}`);
    return response.data;
  },

  updateMemberStatus: async (memberId, active) => {
    const response = await api.put(`/admin/members/${memberId}/status?active=${active}`);
    return response.data;
  }
};

export default adminService;