import { useEffect, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import api from '../services/api';

export default function Members() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchMembers = async (page = 1, nextFilters = filters) => {
    setLoading(true);
    try {
      const response = await api.get('/members', {
        params: { page, limit: 10, search: nextFilters.search, status: nextFilters.status },
      });
      setMembers(response.data.members || []);
      setPagination(response.data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);
    fetchMembers(1, nextFilters);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/members/${deleteTarget._id}`);
      if (window.showToast) window.showToast('Member deleted successfully', 'success');
      setDeleteTarget(null);
      fetchMembers();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <Loading text="Loading members..." />;

  return (
    <div className="page-stack">
      <div className="page-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input type="text" placeholder="Search member name or ID" value={filters.search} name="search" onChange={handleFilterChange} />
        </div>
        <div className="toolbar-actions">
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <Link to="/members/add" className="btn btn-primary"><Plus size={16} /> Add Member</Link>
        </div>
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length ? members.map((member) => (
                <tr key={member._id}>
                  <td>{member.memberId}</td>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.phone}</td>
                  <td><span className={`badge badge--${member.status === 'Active' ? 'success' : 'danger'}`}>{member.status}</span></td>
                  <td className="row-actions">
                    <button type="button" className="action-btn" onClick={() => navigate(`/members/edit/${member._id}`)}><Pencil size={15} /></button>
                    <button type="button" className="action-btn action-btn--danger" onClick={() => setDeleteTarget(member)}><Trash2 size={15} /></button>
                  </td>
                </tr>
              )) : <tr><td colSpan="6" className="empty-cell">No members found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pagination">
        <button type="button" disabled={pagination.page <= 1} onClick={() => fetchMembers(pagination.page - 1)}>Previous</button>
        <span>Page {pagination.page} of {pagination.totalPages || 1}</span>
        <button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchMembers(pagination.page + 1)}>Next</button>
      </div>

      <Modal isOpen={Boolean(deleteTarget)} title="Delete member" confirmText="Delete" onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}>
        <p>Are you sure you want to delete this member?</p>
      </Modal>
    </div>
  );
}
