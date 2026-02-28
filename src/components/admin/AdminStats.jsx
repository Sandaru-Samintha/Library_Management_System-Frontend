import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAlert } from '../../context/AlertContext';
import borrowService from '../../services/borrowService';
import LoadingSpinner from '../common/LoadingSpinner';
import { 
  FiBook, FiClock, FiCheckCircle, FiAlertCircle, 
  FiCalendar, FiTrendingUp, FiRefreshCw, FiArrowLeft,
  FiBarChart2, FiPieChart
} from 'react-icons/fi';
import './AdminStats.css';

const AdminStats = () => {
  const { showSuccess, showError } = useAlert();
  
  const [stats, setStats] = useState({
    totalBorrows: 0,
    activeBorrows: 0,
    overdueBorrows: 0,
    returnedBorrows: 0,
    todayBorrows: 0,
    todayReturns: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await borrowService.getBorrowingStats();
      console.log('Stats response:', response);
      
      if (response.code === '00') {
        setStats(response.content);
      } else {
        showError('Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      showError('Error fetching statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
    showSuccess('Statistics refreshed');
  };

  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="admin-stats-container">
      <div className="admin-stats-header">
        <h1 className="admin-stats-title">Library Statistics</h1>
        <div className="admin-stats-actions">
          <button 
            onClick={handleRefresh} 
            className="admin-stats-btn admin-stats-btn-secondary"
            disabled={refreshing}
          >
            <FiRefreshCw className={refreshing ? 'admin-stats-spin' : ''} /> 
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link to="/admin/dashboard" className="admin-stats-btn admin-stats-btn-secondary">
            <FiArrowLeft /> Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stats-card admin-stats-card-blue">
          <div className="admin-stats-card-icon">
            <FiBook />
          </div>
          <div className="admin-stats-card-content">
            <h3>Total Borrows</h3>
            <p className="admin-stats-card-value">{stats.totalBorrows}</p>
            <p className="admin-stats-card-label">All time</p>
          </div>
        </div>

        <div className="admin-stats-card admin-stats-card-green">
          <div className="admin-stats-card-icon">
            <FiClock />
          </div>
          <div className="admin-stats-card-content">
            <h3>Active Borrows</h3>
            <p className="admin-stats-card-value">{stats.activeBorrows}</p>
            <p className="admin-stats-card-label">Currently borrowed</p>
          </div>
        </div>

        <div className="admin-stats-card admin-stats-card-red">
          <div className="admin-stats-card-icon">
            <FiAlertCircle />
          </div>
          <div className="admin-stats-card-content">
            <h3>Overdue</h3>
            <p className="admin-stats-card-value">{stats.overdueBorrows}</p>
            <p className="admin-stats-card-label">Need attention</p>
          </div>
        </div>

        <div className="admin-stats-card admin-stats-card-purple">
          <div className="admin-stats-card-icon">
            <FiCheckCircle />
          </div>
          <div className="admin-stats-card-content">
            <h3>Returned</h3>
            <p className="admin-stats-card-value">{stats.returnedBorrows}</p>
            <p className="admin-stats-card-label">Completed</p>
          </div>
        </div>
      </div>

      {/* Today's Activity Cards */}
      <div className="admin-stats-today-grid">
        <div className="admin-stats-today-card">
          <FiCalendar className="admin-stats-today-icon admin-stats-today-icon-blue" />
          <div className="admin-stats-today-content">
            <span className="admin-stats-today-label">Today's Borrows</span>
            <span className="admin-stats-today-value">{stats.todayBorrows}</span>
          </div>
        </div>
        <div className="admin-stats-today-card">
          <FiCheckCircle className="admin-stats-today-icon admin-stats-today-icon-green" />
          <div className="admin-stats-today-content">
            <span className="admin-stats-today-label">Today's Returns</span>
            <span className="admin-stats-today-value">{stats.todayReturns}</span>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="admin-stats-details">
        <h2 className="admin-stats-details-title">Borrowing Overview</h2>
        
        <div className="admin-stats-progress-list">
          <div className="admin-stats-progress-item">
            <div className="admin-stats-progress-header">
              <span>Active Borrows</span>
              <span>{stats.activeBorrows} / {stats.totalBorrows}</span>
            </div>
            <div className="admin-stats-progress-bar">
              <div 
                className="admin-stats-progress-fill admin-stats-progress-blue" 
                style={{ width: `${calculatePercentage(stats.activeBorrows, stats.totalBorrows)}%` }}
              ></div>
            </div>
          </div>

          <div className="admin-stats-progress-item">
            <div className="admin-stats-progress-header">
              <span>Returned Books</span>
              <span>{stats.returnedBorrows} / {stats.totalBorrows}</span>
            </div>
            <div className="admin-stats-progress-bar">
              <div 
                className="admin-stats-progress-fill admin-stats-progress-green" 
                style={{ width: `${calculatePercentage(stats.returnedBorrows, stats.totalBorrows)}%` }}
              ></div>
            </div>
          </div>

          <div className="admin-stats-progress-item">
            <div className="admin-stats-progress-header">
              <span>Overdue Books</span>
              <span>{stats.overdueBorrows} / {stats.activeBorrows}</span>
            </div>
            <div className="admin-stats-progress-bar">
              <div 
                className="admin-stats-progress-fill admin-stats-progress-red" 
                style={{ width: `${calculatePercentage(stats.overdueBorrows, stats.activeBorrows)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="admin-stats-numbers-grid">
          <div className="admin-stats-number-card">
            <FiBarChart2 className="admin-stats-number-icon" />
            <div>
              <span className="admin-stats-number-label">Completion Rate</span>
              <span className="admin-stats-number-value">
                {calculatePercentage(stats.returnedBorrows, stats.totalBorrows)}%
              </span>
            </div>
          </div>

          <div className="admin-stats-number-card">
            <FiTrendingUp className="admin-stats-number-icon" />
            <div>
              <span className="admin-stats-number-label">Active Rate</span>
              <span className="admin-stats-number-value">
                {calculatePercentage(stats.activeBorrows, stats.totalBorrows)}%
              </span>
            </div>
          </div>

          <div className="admin-stats-number-card">
            <FiPieChart className="admin-stats-number-icon" />
            <div>
              <span className="admin-stats-number-label">Overdue Rate</span>
              <span className="admin-stats-number-value">
                {calculatePercentage(stats.overdueBorrows, stats.activeBorrows)}%
              </span>
            </div>
          </div>
        </div>

        {/* Today's Summary */}
        <div className="admin-stats-today-summary">
          <h3>Today's Summary</h3>
          <div className="admin-stats-today-summary-grid">
            <div className="admin-stats-summary-item">
              <span className="admin-stats-summary-label">Books Borrowed Today</span>
              <span className="admin-stats-summary-value">{stats.todayBorrows}</span>
            </div>
            <div className="admin-stats-summary-item">
              <span className="admin-stats-summary-label">Books Returned Today</span>
              <span className="admin-stats-summary-value">{stats.todayReturns}</span>
            </div>
            <div className="admin-stats-summary-item">
              <span className="admin-stats-summary-label">Net Change</span>
              <span className={`admin-stats-summary-value ${
                stats.todayBorrows - stats.todayReturns > 0 ? 'positive' : 
                stats.todayBorrows - stats.todayReturns < 0 ? 'negative' : ''
              }`}>
                {stats.todayBorrows - stats.todayReturns > 0 ? '+' : ''}
                {stats.todayBorrows - stats.todayReturns}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Table */}
        <div className="admin-stats-table">
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Borrows</td>
                <td>{stats.totalBorrows}</td>
                <td>100%</td>
              </tr>
              <tr>
                <td>Active Borrows</td>
                <td>{stats.activeBorrows}</td>
                <td>{calculatePercentage(stats.activeBorrows, stats.totalBorrows)}%</td>
              </tr>
              <tr>
                <td>Returned</td>
                <td>{stats.returnedBorrows}</td>
                <td>{calculatePercentage(stats.returnedBorrows, stats.totalBorrows)}%</td>
              </tr>
              <tr>
                <td>Overdue</td>
                <td>{stats.overdueBorrows}</td>
                <td>{calculatePercentage(stats.overdueBorrows, stats.activeBorrows)}%</td>
              </tr>
              <tr>
                <td>Today's Borrows</td>
                <td>{stats.todayBorrows}</td>
                <td>-</td>
              </tr>
              <tr>
                <td>Today's Returns</td>
                <td>{stats.todayReturns}</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;