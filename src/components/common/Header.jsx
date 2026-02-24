import React from 'react'
import { Link } from 'react-router-dom';
import { FiBook, FiLogOut, FiUser } from 'react-icons/fi';

const Header = () => {

  
  
  return (
    <header className="header">
      <nav className="nav-container">
        <Link to="/" className='logo'>
          <FiBook className='logo-icon'/>
            <span>Library Management System</span>
        </Link>

        <div className="nav-links">
          <Link to="/member/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/member/books/search" className="nav-link">Browse Books</Link>
          <Link to="/member/borrowed" className="nav-link">My Books</Link>
          <Link to="/member/fines" className="nav-link">Fines</Link>

          <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/admin/members" className="nav-link">Members</Link>
          <Link to="/admin/books" className="nav-link">Books</Link>
          <Link to="/admin/borrows" className="nav-link">Borrows</Link>



          <div className="user-menu">
                <button className="user-menu-button">
                  <FiUser />
                  <span>{user?.memFullName || user?.adminFullName || 'User'}</span>
                </button>
                <div className="dropdown-menu">
                  <Link to="/member/profile" className="dropdown-item">Profile</Link>
                  <Link to="/admin/profile" className="dropdown-item">Profile</Link>
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <FiLogOut /> Logout
                  </button>
                </div>
              </div>
    
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="register-btn">Register</Link>
            
    
        </div>

      </nav>
    </header>
  )
};

export default Header;