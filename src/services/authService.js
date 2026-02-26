import api from './api';

const authService = {
  register: async (userData) => {
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
      if (userData[key] !== null && userData[key] !== undefined) {
        formData.append(key, userData[key]);
      }
    });
    
    const response = await api.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  login: async (credentials) => {
    console.log('authService.login called with:', credentials);
    
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('Raw API response:', response);
      console.log('Response data:', response.data);
      
      if (response.data.code === '00' && response.data.jwtToken) {
        const userData = response.data.content;
        const userRole = userData?.role;
        
        console.log('Storing in localStorage - Role:', userRole);
        console.log('Storing in localStorage - User:', userData);
        
        // Store regardless of role match (validation happens in context)
        localStorage.setItem('token', response.data.jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('role', userRole);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login API error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  logout: () => {
    console.log('authService.logout called');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getUserRole: () => {
    return localStorage.getItem('role');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  isAdmin: () => {
    return localStorage.getItem('role') === 'ADMIN';
  },

  isMember: () => {
    return localStorage.getItem('role') === 'MEMBER';
  }
};

export default authService;