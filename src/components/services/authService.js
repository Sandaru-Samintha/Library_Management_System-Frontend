import React from 'react'
import api from "./api";

const authService = {
  register:async(userData)=>{
    const formData = new FormData();
    Object.keys(userData).forEach(key =>{
      if(userData[key] !== null && userData[key] !== undefined){
        formData.append(key,userData[key]);
      }
    });

    const response = await api.post("/auth/register",formData,{
      headers :{'content-Type': 'multipart/form-data'}
    });
    return response.data;
  },

  login : async(credentials)=>{
    const response = await api.post('/auth/login',credentials);
    if(response.data.jwtToken){
      localStorage.setItem('token',response.data.jwtToken);
      localStorage.setItem('user',JSON.stringify(response.data.content));
      localStorage.setItem('role',response.data.content?.role || credentials.role);
    }
    return response.data;
  },

  logout:()=>{
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  },

  getCurrentUser:()=>{
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getUserRole : ()=>{
    return localStorage.getItem('role');
  },

  isAuthenticated:()=>{
    return !!localStorage.getItem('token');
  },

  isAdmin : ()=>{
    return localStorage.getItem('role') === 'ADMIN';
  },

  isMember : ()=>{
    return localStorage.getItem('role')=== 'MEMBER';
  }
};


export default authService;