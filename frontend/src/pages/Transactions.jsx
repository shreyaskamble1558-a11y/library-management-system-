import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import api from '../services/api';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [returnTarget, setReturnTarget] = useState(null);

  const fetchTransactions = async (page = 1, nextFilters = filters) => {
    setLoading(true);
    try {
      const response = await api.get('/transactions', {
        params: { page, limit: 10, search: nextFilters.search, status: nextFilters.status },
      });
      setTransactions(response.data.transactions || []);
      setPagination(response.data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);
    fetchTransactions(1, nextFilters);
  };

  const handleReturn = async () => {
    if (!returnTarget) return;
    try {
      await api.put(`/transactions/${returnTarget._id}/return`);
      if (window.showToast) window.showToast('Book returned successfully', 'success');
      setReturnTarget(null);
      fetchTransactions();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <Loading text="Loading transactions..." />;

  return (
    <div className="page-stack">
      <div className="page-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input type="text" placeholder="Search transaction or member" value={filters.search} name="search" onChange={handleFilterChange} />
        </div>
        <div className="toolbar-actions">
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All status</option>
            <option value="Issued">Issued</option>
            <option value="Returned">Returned</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Book</th>
                <th>Member</th>
                <th>Issue Date</th>
                <th>Expected Return</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length ? transactions.map((txn) => (
                <tr key={txn._id}>
                  <td>{txn.transactionId}</td>
                  <td>{txn.book?.title || '—'}</td>
                  <td>{txn.member?.name || '—'}</td>
                  <td>{new Date(txn.issueDate).toLocaleDateString()}</td>
                  <td>{new Date(txn.expectedReturnDate).toLocaleDateString()}</td>
                  <td>{txn.returnDate ? new Date(txn.returnDate).toLocaleDateString() : '—'}</td>
                  <td><span className={`badge badge--${txn.status.toLowerCase()}`}>{txn.status}</span></td>
                  <td>
                    {txn.status !== 'Returned' ? (
                      <button type="button" className="btn btn-secondary btn-small" onClick={() => setReturnTarget(txn)}>Return</button>
                    ) : <span>Completed</span>}
                  </td>
                </tr>
              )) : <tr><td colSpan="8" className="empty-cell">No transactions found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pagination">
        <button type="button" disabled={pagination.page <= 1} onClick={() => fetchTransactions(pagination.page - 1)}>Previous</button>
        <span>Page {pagination.page} of {pagination.totalPages || 1}</span>
        <button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchTransactions(pagination.page + 1)}>Next</button>
      </div>

      <Modal isOpen={Boolean(returnTarget)} title="Return book" confirmText="Return" onClose={() => setReturnTarget(null)} onConfirm={handleReturn}>
        <p>Are you sure you want to return this book?</p>
      </Modal>
    </div>
  );
}
