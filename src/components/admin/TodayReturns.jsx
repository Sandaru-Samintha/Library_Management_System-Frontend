import React, { useState, useEffect } from 'react';
import { useAlert } from '../../context/AlertContext';
import borrowService from '../../services/borrowService';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  FiCheckCircle,
  FiUser,
  FiBook,
  FiDollarSign,
  FiRefreshCw,
  FiDownload,
  FiEye
} from 'react-icons/fi';
import './TodayReturns.css';

const TodayReturns = () => {
  const { showSuccess, showError } = useAlert();

  const [returns, setReturns] = useState([]);
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [stats, setStats] = useState({
    totalReturns: 0,
    totalFines: 0,
    totalMembers: 0
  });

  useEffect(() => {
    fetchTodayReturns();
  }, []);

  useEffect(() => {
    filterReturns();
  }, [searchTerm, returns]);

  const fetchTodayReturns = async () => {
    try {
      setLoading(true);
      const response = await borrowService.getTodayReturns();

      if (response.code === '00') {
        const data = response.content || [];
        setReturns(data);
        setFilteredReturns(data);

        const totalFines = data.reduce((sum, r) => sum + (r.fineAmount || 0), 0);
        const uniqueMembers = new Set(data.map(r => r.memberId)).size;

        setStats({
          totalReturns: data.length,
          totalFines,
          totalMembers: uniqueMembers
        });
      } else {
        showError('Failed to fetch today returns');
      }
    } catch (error) {
      showError('Error fetching today returns');
    } finally {
      setLoading(false);
    }
  };

  const filterReturns = () => {
    if (!searchTerm.trim()) {
      setFilteredReturns(returns);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = returns.filter(r =>
      r.bookTitle?.toLowerCase().includes(term) ||
      r.memberName?.toLowerCase().includes(term) ||
      r.borrowId?.toString().includes(term)
    );

    setFilteredReturns(filtered);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount || 0);
  };

  const exportToCSV = () => {
    const headers = ['Borrow ID', 'Book Title', 'Member', 'Return Date', 'Fine'];

    const rows = filteredReturns.map(r => [
      r.borrowId,
      r.bookTitle,
      r.memberName,
      formatDate(r.returnDate),
      r.fineAmount || 0
    ]);

    const csv = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `today-returns-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showSuccess('Report exported successfully');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="today-returns-container">

      <div className="today-returns-header">
        <h1>Today Returns</h1>
        <div className="today-returns-actions">
          <button onClick={fetchTodayReturns}>
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="today-returns-stats">
        <div className="today-stat-card">
          <FiCheckCircle />
          <div>
            <h3>Total Returns</h3>
            <p>{stats.totalReturns}</p>
          </div>
        </div>

        <div className="today-stat-card">
          <FiDollarSign />
          <div>
            <h3>Total Fines</h3>
            <p>{formatCurrency(stats.totalFines)}</p>
          </div>
        </div>

        <div className="today-stat-card">
          <FiUser />
          <div>
            <h3>Members</h3>
            <p>{stats.totalMembers}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by book, member, borrow ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="today-returns-search"
      />

      {/* Table */}
      <div className="table-container">
        {filteredReturns.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Borrow ID</th>
                <th>Book</th>
                <th>Member</th>
                <th>Return Date</th>
                <th>Fine</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.map(r => (
                <tr key={r.borrowId}>
                  <td>#{r.borrowId}</td>
                  <td><FiBook /> {r.bookTitle}</td>
                  <td>{r.memberName}</td>
                  <td>{formatDate(r.returnDate)}</td>
                  <td>{r.fineAmount > 0 ? formatCurrency(r.fineAmount) : '-'}</td>
                  <td>
                    <button onClick={() => {
                      setSelectedReturn(r);
                      setShowModal(true);
                    }}>
                      <FiEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">
            <FiCheckCircle size={50} />
            <h3>No Returns Today</h3>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedReturn && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Return Details</h2>
            <p><strong>Borrow ID:</strong> #{selectedReturn.borrowId}</p>
            <p><strong>Book:</strong> {selectedReturn.bookTitle}</p>
            <p><strong>Member:</strong> {selectedReturn.memberName}</p>
            <p><strong>Return Date:</strong> {formatDate(selectedReturn.returnDate)}</p>
            <p><strong>Fine:</strong> {formatCurrency(selectedReturn.fineAmount)}</p>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default TodayReturns;