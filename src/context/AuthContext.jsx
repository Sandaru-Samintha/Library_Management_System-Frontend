import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const loadUser = () => {
      const currentUser = authService.getCurrentUser();
      const currentRole = authService.getUserRole();
      const authenticated = authService.isAuthenticated();
      
      console.log('Loading user from storage:', { currentUser, currentRole, authenticated });
      
      if (authenticated && currentRole && currentUser) {
        setUser(currentUser);
        setRole(currentRole);
        setIsAuthenticated(true);
      } else {
        authService.logout();
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };
    
    loadUser();
  }, []);

  const login = async (credentials) => {
    console.log('AuthContext login called with:', credentials);
    
    try {
      const response = await authService.login(credentials);
      console.log('AuthService login response:', response);
      
      if (response.code === '00') {
        const userData = response.content;
        const userRole = userData?.role;
        
        console.log('User data from response:', userData);
        console.log('User role:', userRole);
        console.log('Selected role:', credentials.role);
        
        if (userRole && userRole === credentials.role) {
          setUser(userData);
          setRole(userRole);
          setIsAuthenticated(true);
          console.log('Login successful, user set in context');
          return response;
        } else {
          console.error('Role mismatch in AuthContext');
          authService.logout();
          throw new Error('Role mismatch');
        }
      }
      
      return response;
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('Logging out');
    authService.logout();
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  const register = async (userData) => {
    return await authService.register(userData);
  };

  const value = {
    user,
    role,
    loading,
    isAuthenticated,
    isAdmin: role === 'ADMIN',
    isMember: role === 'MEMBER',
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};