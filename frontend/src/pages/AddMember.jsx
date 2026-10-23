import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const initialState = {
  memberId: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  membershipDate: new Date().toISOString().slice(0, 10),
  status: 'Active',
};

export default function AddMember() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/members', form);
      if (window.showToast) window.showToast('Member added successfully', 'success');
      navigate('/members');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <div className="panel form-panel">
        <div className="panel__header"><h3>Add Member</h3></div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field"><span>Member ID</span><input name="memberId" value={form.memberId} onChange={handleChange} required /></label>
          <label className="field"><span>Name</span><input name="name" value={form.name} onChange={handleChange} required /></label>
          <label className="field"><span>Email</span><input type="email" name="email" value={form.email} onChange={handleChange} required /></label>
          <label className="field"><span>Phone</span><input name="phone" value={form.phone} onChange={handleChange} required /></label>
          <label className="field"><span>Membership Date</span><input type="date" name="membershipDate" value={form.membershipDate} onChange={handleChange} required /></label>
          <label className="field"><span>Status</span><select name="status" value={form.status} onChange={handleChange}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></label>
          <label className="field field--full"><span>Address</span><textarea rows="3" name="address" value={form.address} onChange={handleChange} required /></label>
          {error && <div className="alert alert-error field field--full">{error}</div>}
          <div className="form-actions field field--full">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/members')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Add Member'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
