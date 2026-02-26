import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {  FiLogOut, FiUser, FiShield, FiHome } from 'react-icons/fi';
import { FaBook } from "react-icons/fa";
import './Header.css';

const Header = () => {
  const { isAuthenticated, isAdmin, isMember, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <nav className="nav-container">
        <Link to={isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/member/dashboard') : '/'} className="logo">
          <FaBook className="logo-icon" />
          <span>Library Management System</span>
        </Link>

        <div className="nav-links">
          {isAuthenticated ? (
            <>
              {isMember && (
                <>
                  <Link to="/member/dashboard" className="nav-link">
                    Dashboard
                  </Link>
                  <Link to="/member/books/search" className="nav-link">
                    Browse Books
                  </Link>
                  <Link to="/member/borrowed" className="nav-link">
                    My Books
                  </Link>
                  <Link to="/member/fines" className="nav-link">
                    Fines
                  </Link>
                </>
              )}
              
              {isAdmin && (
                <>
                  <Link to="/admin/dashboard" className="nav-link">
                    Dashboard
                  </Link>
                  <Link to="/admin/members" className="nav-link">
                    Members
                  </Link>
                  <Link to="/admin/books" className="nav-link">
                    Books
                  </Link>
                  <Link to="/admin/borrows" className="nav-link">
                    Borrows
                  </Link>
                  <Link to="/admin/create" className="nav-link admin-create">
                    New Admin
                  </Link>
                </>
              )}

              <div className="user-menu">
                <button className="user-menu-button">
                  {isAdmin ? <FiShield size={30}color='blue' /> : <FiUser size={30}color='blue' />}
                  <span>{user?.memFullName || user?.adminFullName || 'User'}</span>
                </button>
                <div className="dropdown-menu">
                  {isMember && (
                    <Link to="/member/profile" className="dropdown-item">
                      <FiUser /> Profile
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to="/admin/profile" className="dropdown-item">
                      <FiShield /> Profile
                    </Link>
                  )}
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <FiLogOut /> Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="register-btn">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;