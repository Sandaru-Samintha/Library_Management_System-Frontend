import React, { Children, createContext, useContext, useEffect, useState } from 'react'


const AuthContext = createContext();


export const useAuth =()=>useContext(AuthContext);

export const AuthProvider= ({children})=>{
  const[user,setUser] =useState(null);
  const[loading,setLoading]=useState(true);
  const[isAuthenticated,setIsAuthenticated]=useState(false);
  const[role,setRole]=useState(null);


  useEffect(()=>{
    const loadUser = ()=>{
      const currentUser = authService.getCurrentUser();
      const currentRole =authService.getUserRole();
      const authenticated = authService.isAuthenticated();

      setUser(currentUser);
      setRole(currentRole);
      setIsAuthenticated(authenticated);
      setLoading(false);
    };
    loadUser();
  },[]);

  const login = async(credentials)=>{
    const response = await authService.login(credentials);
    if (response.code === '00') {
      setUser(response.content);
      setRole(response.role);
      setIsAuthenticated(true);
    }
    return response;
  }

  const logout = ()=>{
    authService.logout();
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  const register = async(userData)=>{
    return await authService.register(userData);
  };

  const value = {
    user,
    role,
    loading,
    isAuthenticated,
    isAdmin : role === 'ADMIN',
    isMember : role === 'MEMBER',
    login,
    logout,
    register,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

