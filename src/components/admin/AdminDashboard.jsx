import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAlert } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import borrowService from '../../services/borrowService';
import fineService from '../../services/fineService';
import LoadingSpinner from '../common/LoadingSpinner';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showError, showSuccess } = useAlert();
  
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    totalMembers: 0,
    activeMembers: 0,
    currentBorrows: 0,
    overdueBorrows: 0,
    totalFinesCollected: 0,
    pendingFines: 0,
    todayBorrows: 0,
    todayReturns: 0
  });
  
  const [recentMembers, setRecentMembers] = useState([]);
  const [recentBorrows, setRecentBorrows] = useState([]);
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [todayReturns, setTodayReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await adminService.getDashboardStats();
      console.log('Stats response:', statsResponse);
      
      if (statsResponse.code === '00') {
        setStats(statsResponse.content);
      }

      // Fetch recent members (last 5)
      const membersResponse = await adminService.getAllMembers();
      if (membersResponse.code === '00') {
        const members = membersResponse.content || [];
        setRecentMembers(members.slice(0, 5));
      }

      // Fetch overdue books
      const overdueResponse = await borrowService.getOverdueBooks();
      if (overdueResponse.code === '00') {
        setOverdueBooks(overdueResponse.content || []);
      }

      // Fetch today's returns
      const todayReturnsResponse = await borrowService.getTodayReturns();
      if (todayReturnsResponse.code === '00') {
        setTodayReturns(todayReturnsResponse.content || []);
      }

      // Fetch recent borrows
      const borrowsResponse = await borrowService.getAllBorrowRecords();
      if (borrowsResponse.code === '00') {
        const borrows = borrowsResponse.content || [];
        setRecentBorrows(borrows.slice(0, 5));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    showSuccess('Dashboard refreshed');
  };

  const handleCheckOverdue = async () => {
    try {
      const response = await borrowService.checkOverdueBooks();
      if (response.code === '00') {
        showSuccess('Overdue books checked and updated');
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      showError('Failed to check overdue books');
    }
  };

  // Handle marking a book as returned
  const handleMarkReturned = async (borrowId) => {
    try {
      const response = await borrowService.returnBook(borrowId);
      if (response.code === '00') {
        showSuccess('Book marked as returned successfully');
        fetchDashboardData(); // Refresh data
      } else {
        showError(response.message || 'Failed to mark book as returned');
      }
    } catch (error) {
      console.error('Error marking book as returned:', error);
      showError('Failed to mark book as returned');
    }
  };

  // Handle sending reminder for overdue book
  const handleSendReminder = async (borrowId) => {
    try {
      // You can implement an email notification service here
      // For now, we'll just show a success message
      showSuccess('Reminder sent to member');
      
      // Optional: You could extend the due date automatically
      // const extendResponse = await borrowService.extendDueDate(borrowId, 3);
      // if (extendResponse.code === '00') {
      //   showSuccess('Due date extended by 3 days');
      //   fetchDashboardData();
      // }
    } catch (error) {
      console.error('Error sending reminder:', error);
      showError('Failed to send reminder');
    }
  };

  // Handle deactivating a member
  const handleDeactivateMember = async (memberId) => {
    if (window.confirm('Are you sure you want to deactivate this member?')) {
      try {
        const response = await adminService.updateMemberStatus(memberId, false);
        if (response.code === '00') {
          showSuccess('Member deactivated successfully');
          fetchDashboardData(); // Refresh data
        } else {
          showError(response.message || 'Failed to deactivate member');
        }
      } catch (error) {
        console.error('Error deactivating member:', error);
        showError('Failed to deactivate member');
      }
    }
  };

  // Handle activating a member
  const handleActivateMember = async (memberId) => {
    try {
      const response = await adminService.updateMemberStatus(memberId, true);
      if (response.code === '00') {
        showSuccess('Member activated successfully');
        fetchDashboardData(); // Refresh data
      } else {
        showError(response.message || 'Failed to activate member');
      }
    } catch (error) {
      console.error('Error activating member:', error);
      showError('Failed to activate member');
    }
  };

  // Handle waiving a fine
  const handleWaiveFine = async (fineId) => {
    if (window.confirm('Are you sure you want to waive this fine?')) {
      try {
        const response = await fineService.waiveFine(fineId);
        if (response.code === '00') {
          showSuccess('Fine waived successfully');
          fetchDashboardData(); // Refresh data
        } else {
          showError(response.message || 'Failed to waive fine');
        }
      } catch (error) {
        console.error('Error waiving fine:', error);
        showError('Failed to waive fine');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <div className="header-actions">
          <button 
            onClick={handleRefresh} 
            className="btn btn-secondary"
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : '↻ Refresh'}
          </button>
          <button 
            onClick={handleCheckOverdue} 
            className="btn btn-warning"
          >
            Check Overdue Books
          </button>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="welcome-section">
        <h2>Welcome, {user?.adminFullName || 'Admin'}!</h2>
        <p>Here's what's happening in your library today.</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📚</div>
          <div className="stat-content">
            <h3>Total Books</h3>
            <p className="stat-value">{stats.totalBooks}</p>
            <p className="stat-sub">Available: {stats.availableBooks}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">👥</div>
          <div className="stat-content">
            <h3>Total Members</h3>
            <p className="stat-value">{stats.totalMembers}</p>
            <p className="stat-sub">Active: {stats.activeMembers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">📖</div>
          <div className="stat-content">
            <h3>Current Borrows</h3>
            <p className="stat-value">{stats.currentBorrows}</p>
            <p className="stat-sub">Overdue: {stats.overdueBorrows}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">💰</div>
          <div className="stat-content">
            <h3>Fines Collected</h3>
            <p className="stat-value">Rs. {stats.totalFinesCollected?.toFixed(2)}</p>
            <p className="stat-sub">Pending: Rs. {stats.pendingFines?.toFixed(2)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teal">📅</div>
          <div className="stat-content">
            <h3>Today's Activity</h3>
            <p className="stat-value">{stats.todayBorrows} Borrowed</p>
            <p className="stat-sub">{stats.todayReturns} Returned</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/admin/books/add" className="action-btn">
            <span className="action-icon">➕</span>
            Add New Book
          </Link>
          <Link to="/admin/members" className="action-btn">
            <span className="action-icon">👥</span>
            Manage Members
          </Link>
          <Link to="/admin/borrows" className="action-btn">
            <span className="action-icon">📋</span>
            View All Borrows
          </Link>
          <Link to="/admin/overdue" className="action-btn warning">
            <span className="action-icon">⚠️</span>
            Overdue Books ({overdueBooks.length})
          </Link>
          <Link to="/admin/today-returns" className="action-btn success">
            <span className="action-icon">↩️</span>
            Today's Returns ({todayReturns.length})
          </Link>
          <Link to="/admin/stats" className="action-btn">
            <span className="action-icon">📊</span>
            Detailed Statistics
          </Link>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="grid-column">
          {/* Recent Members */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Recent Members</h3>
              <Link to="/admin/members" className="view-all">View All →</Link>
            </div>
            <div className="member-list">
              {recentMembers.length > 0 ? (
                recentMembers.map(member => (
                  <div key={member.memId} className="member-item">
                    <div className="member-avatar">
                      {member.profileImageUrl ? (
                        <img src={`${process.env.REACT_APP_IMAGE_URL || 'http://localhost:8080'}${member.profileImageUrl}`} />
                      ) : (
                        <div className="avatar-placeholder">
                          {member.memFullName?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="member-info">
                      <h4>{member.memFullName}</h4>
                      <p>{member.memEmail}</p>
                    </div>
                    <div className="member-status">
                      <span className={`status-badge ${member.active ? 'active' : 'inactive'}`}>
                        {member.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-message">No members found</p>
              )}
            </div>
          </div>

          {/* Today's Returns */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Due Today</h3>
              <Link to="/admin/today-returns" className="view-all">View All →</Link>
            </div>
            <div className="returns-list">
              {todayReturns.length > 0 ? (
                todayReturns.map(borrow => (
                  <div key={borrow.borrowId} className="return-item">
                    <div className="return-info">
                      <h4>{borrow.bookTitle}</h4>
                      <p>Borrowed by: {borrow.memberName}</p>
                      <p className="due-date">Due: {borrow.dueDate}</p>
                    </div>
                    <button 
                      className="btn-small btn-success"
                      onClick={() => handleMarkReturned(borrow.borrowId)}
                    >
                      Mark Returned
                    </button>
                  </div>
                ))
              ) : (
                <p className="empty-message">No books due today</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="grid-column">
          {/* Recent Borrows */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Recent Borrows</h3>
              <Link to="/admin/borrows" className="view-all">View All →</Link>
            </div>
            <div className="borrows-list">
              {recentBorrows.length > 0 ? (
                recentBorrows.map(borrow => (
                  <div key={borrow.borrowId} className="borrow-item">
                    <div className="borrow-info">
                      <h4>{borrow.bookTitle}</h4>
                      <p>Member: {borrow.memberName}</p>
                      <p className="borrow-date">Borrowed: {borrow.borrowDate}</p>
                    </div>
                    <span className={`status-badge ${borrow.status?.toLowerCase()}`}>
                      {borrow.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="empty-message">No recent borrows</p>
              )}
            </div>
          </div>

          {/* Overdue Books */}
          <div className="dashboard-card warning-card">
            <div className="card-header">
              <h3>Overdue Books</h3>
              <Link to="/admin/overdue" className="view-all">View All →</Link>
            </div>
            <div className="overdue-list">
              {overdueBooks.length > 0 ? (
                overdueBooks.map(borrow => (
                  <div key={borrow.borrowId} className="overdue-item">
                    <div className="overdue-info">
                      <h4>{borrow.bookTitle}</h4>
                      <p>Member: {borrow.memberName}</p>
                      <p className="due-date">Due: {borrow.dueDate}</p>
                      <p className="fine-amount">Fine: Rs. {borrow.fineAmount || 0}</p>
                    </div>
                    <div className="overdue-actions">
                      <button 
                        className="btn-small btn-warning"
                        onClick={() => handleSendReminder(borrow.borrowId)}
                      >
                        Send Reminder
                      </button>
                      {borrow.fineId && (
                        <button 
                          className="btn-small btn-secondary"
                          onClick={() => handleWaiveFine(borrow.fineId)}
                        >
                          Waive Fine
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-message">No overdue books</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;