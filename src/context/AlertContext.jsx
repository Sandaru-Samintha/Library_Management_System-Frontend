import React, { createContext, useContext } from 'react';
import toast from 'react-hot-toast';
import { IoWarningOutline } from "react-icons/io5";

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const showSuccess = (message) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#4caf50',
        color: '#fff',
      },
    });
  };

  const showError = (message) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#f44336',
        color: '#fff',
      },
    });
  };

  const showInfo = (message) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: <IoWarningOutline />,
    });
  };

  const value = {
    showSuccess,
    showError,
    showInfo
  };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};