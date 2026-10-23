import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../components/Loading';
import api from '../services/api';

export default function EditMember() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await api.get(`/members/${id}`);
        setForm({
          name: response.data.member.name,
          email: response.data.member.email,
          phone: response.data.member.phone,
          address: response.data.member.address,
          status: response.data.member.status,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Member not found');
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await api.put(`/members/${id}`, form);
      if (window.showToast) window.showToast('Member updated successfully', 'success');
      navigate('/members');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update member');
    }
  };

  if (loading) return <Loading text="Loading member..." />;
  if (!form) return <div className="alert alert-error">{error || 'Member not found'}</div>;

  return (
    <div className="page-stack">
      <div className="panel form-panel">
        <div className="panel__header"><h3>Edit Member</h3></div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field"><span>Name</span><input name="name" value={form.name} onChange={handleChange} required /></label>
          <label className="field"><span>Email</span><input type="email" name="email" value={form.email} onChange={handleChange} required /></label>
          <label className="field"><span>Phone</span><input name="phone" value={form.phone} onChange={handleChange} required /></label>
          <label className="field"><span>Status</span><select name="status" value={form.status} onChange={handleChange}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></label>
          <label className="field field--full"><span>Address</span><textarea rows="3" name="address" value={form.address} onChange={handleChange} required /></label>
          {error && <div className="alert alert-error field field--full">{error}</div>}
          <div className="form-actions field field--full">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/members')}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
