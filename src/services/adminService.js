import api from './api';

const adminService = {
  // Get dashboard stats
  getDashboardStats: async () => {
    try {
      console.log('Calling /admin/dashboard/status endpoint...');
      const response = await api.get('/admin/dashboard/status'); // Changed from 'status' to 'stats'
      console.log('Raw response:', response);
      console.log('Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      throw error;
    }
  },

  // Get all members
  getAllMembers: async () => {
    try {
      const response = await api.get('/admin/members/all');
      return response.data;
    } catch (error) {
      console.error('Error in getAllMembers:', error);
      throw error;
    }
  },

  // Get member by ID
  getMemberById: async (memberId) => {
    try {
      const response = await api.get(`/admin/members/${memberId}`);
      return response.data;
    } catch (error) {
      console.error('Error in getMemberById:', error);
      throw error;
    }
  },

  // Search members
  searchMembers: async (keyword) => {
    try {
      const response = await api.get(`/admin/members/search?keyword=${keyword}`);
      return response.data;
    } catch (error) {
      console.error('Error in searchMembers:', error);
      throw error;
    }
  },

  // Update member status
  updateMemberStatus: async (memberId, active) => {
    try {
      const response = await api.put(`/admin/members/${memberId}/status?active=${active}`);
      return response.data;
    } catch (error) {
      console.error('Error in updateMemberStatus:', error);
      throw error;
    }
  },

  // Create admin
  createAdmin: async (adminData) => {
    try {
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
    } catch (error) {
      console.error('Error in createAdmin:', error);
      throw error;
    }
  },

  // Get admin profile
  getAdminProfile: async () => {
    try {
      const response = await api.get('/admin/profile');
      return response.data;
    } catch (error) {
      console.error('Error in getAdminProfile:', error);
      throw error;
    }
  },

  // Update admin profile
  updateAdminProfile: async (profileData) => {
    try {
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
    } catch (error) {
      console.error('Error in updateAdminProfile:', error);
      throw error;
    }
  }
};

export default adminService;