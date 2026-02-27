import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import borrowService from '../../services/borrowService';
import fineService from '../../services/fineService';
import bookService from '../../services/bookService';
import LoadingSpinner from '../common/LoadingSpinner';
import './MemberDashboard.css';

const MemberDashboard = () => {
  const { user } = useAuth();
  const { showError } = useAlert();

  const [stats, setStats] = useState({
    borrowedBooks: 0,
    overdueBooks: 0,
    totalFines: 0,
    availableBooks: 0
  });

  const [loading, setLoading] = useState(true);
  const [recentBorrows, setRecentBorrows] = useState([]);
  const [borrowHistory, setBorrowHistory] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 🚀 Load all APIs in parallel
      const [
        borrowedResponse,
        historyResponse,
        finesResponse,
        availableResponse
      ] = await Promise.all([
        borrowService.getMyBorrowedBooks(),
        borrowService.getMyBorrowHistory(),
        fineService.getMyFines(),
        bookService.getAvailableBooks()
      ]);

      const borrowedBooks =
        borrowedResponse?.code === '00'
          ? borrowedResponse.content
          : [];

      const history =
        historyResponse?.code === '00'
          ? historyResponse.content
          : [];

      const fines =
        finesResponse?.code === '00'
          ? finesResponse.content
          : [];

      const availableBooks =
        availableResponse?.code === '00'
          ? availableResponse.content
          : [];

      const overdue = borrowedBooks.filter(
        (book) => book.status === 'OVERDUE'
      );

      const totalFines = fines.reduce(
        (sum, fine) => sum + (fine.amount || 0),
        0
      );

      setStats({
        borrowedBooks: borrowedBooks.length,
        overdueBooks: overdue.length,
        totalFines,
        availableBooks: availableBooks.length
      });

      setRecentBorrows(borrowedBooks.slice(0, 5));
      setBorrowHistory(history.slice(0, 5));

    } catch (error) {
      console.error('Dashboard Error:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">
        Welcome, {user?.memFullName || 'Member'}!
      </h1>

      {/* ================= Stats Section ================= */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-icon blue">📚</div>
          <div className="dash-stat-content">
            <h3>Books Borrowed</h3>
            <p className="dash-stat-value">{stats.borrowedBooks}</p>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon green">📖</div>
          <div className="dash-stat-content">
            <h3>Available Books</h3>
            <p className="dash-stat-value">{stats.availableBooks}</p>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon red">⏰</div>
          <div className="dash-stat-content">
            <h3>Overdue Books</h3>
            <p className="dash-stat-value">{stats.overdueBooks}</p>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon yellow">💰</div>
          <div className="dash-stat-content">
            <h3>Total Fines</h3>
            <p className="dash-stat-value">
              Rs. {stats.totalFines.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* ================= Dashboard Cards ================= */}
      <div className="dashboard-grid">

        {/* Quick Actions */}
        <div className="dashboard-card">
          <h2 className="card-title">Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/member/books/search" className="action-link blue">
              📚 Browse & Borrow Books
            </Link>
            <Link to="/member/borrowed" className="action-link green">
              📖 View My Borrowed Books
            </Link>
            <Link to="/member/fines" className="action-link yellow">
              💰 View My Fines
            </Link>
            <Link to="/member/profile" className="action-link purple">
              👤 Update Profile
            </Link>
          </div>
        </div>

        {/* Recently Borrowed */}
        <div className="dashboard-card">
          <h2 className="card-title">Currently Borrowed</h2>

          {recentBorrows.length > 0 ? (
            <div className="recent-borrows">
              {recentBorrows.map((borrow) => (
                <div key={borrow.borrowId} className="borrow-item">
                  <div className="borrow-info">
                    <p className="borrow-title">
                      {borrow.bookTitle}
                    </p>
                    <p className="borrow-due">
                      Due: {borrow.dueDate}
                    </p>
                  </div>
                  <span
                    className={`dash-status-badge ${borrow.status.toLowerCase()}`}
                  >
                    {borrow.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">
              No books currently borrowed
            </p>
          )}
        </div>

        {/* Borrow History */}
        <div className="dashboard-card">
          <h2 className="card-title">Borrow History</h2>

          {borrowHistory.length > 0 ? (
            <div className="recent-borrows">
              {borrowHistory.map((borrow) => (
                <div key={borrow.borrowId} className="borrow-item">
                  <div className="borrow-info">
                    <p className="borrow-title">
                      {borrow.bookTitle}
                    </p>
                    <p className="borrow-due">
                      Borrowed: {borrow.borrowDate}
                    </p>
                  </div>
                  <span
                    className={`dash-status-badge ${borrow.status.toLowerCase()}`}
                  >
                    {borrow.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">
              No borrow history available
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default MemberDashboard;