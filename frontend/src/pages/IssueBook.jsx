import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const initialState = {
  memberId: '',
  bookId: '',
  issueDate: new Date().toISOString().slice(0, 10),
  expectedReturnDate: '',
};

export default function IssueBook() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [booksRes, membersRes] = await Promise.all([
          api.get('/books', { params: { page: 1, limit: 100 } }),
          api.get('/members', { params: { page: 1, limit: 100 } }),
        ]);
        setBooks((booksRes.data.books || []).filter((book) => book.availableQuantity > 0));
        setMembers((membersRes.data.members || []).filter((member) => member.status === 'Active'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/transactions/issue', form);
      if (window.showToast) window.showToast('Book issued successfully', 'success');
      navigate('/transactions');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to issue book');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="panel"><div className="loading-wrap"><div className="spinner" /></div></div>;

  return (
    <div className="page-stack">
      <div className="panel form-panel">
        <div className="panel__header"><h3>Issue Book</h3></div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field"><span>Select Member</span><select name="memberId" value={form.memberId} onChange={handleChange} required>
            <option value="">Choose member</option>
            {members.map((member) => <option key={member._id} value={member._id}>{member.name} ({member.memberId})</option>)}
          </select></label>
          <label className="field"><span>Select Book</span><select name="bookId" value={form.bookId} onChange={handleChange} required>
            <option value="">Choose book</option>
            {books.map((book) => <option key={book._id} value={book._id}>{book.title}</option>)}
          </select></label>
          <label className="field"><span>Issue Date</span><input type="date" name="issueDate" value={form.issueDate} onChange={handleChange} required /></label>
          <label className="field"><span>Expected Return Date</span><input type="date" name="expectedReturnDate" value={form.expectedReturnDate} onChange={handleChange} required /></label>
          {error && <div className="alert alert-error field field--full">{error}</div>}
          <div className="form-actions field field--full">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Issuing...' : 'Issue Book'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
