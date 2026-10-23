import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const initialState = {
  title: '',
  author: '',
  category: 'Fiction',
  isbn: '',
  quantity: 1,
  publishedYear: new Date().getFullYear(),
  description: '',
  coverImage: '',
};

export default function AddBook() {
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
      await api.post('/books', form);
      if (window.showToast) window.showToast('Book added successfully', 'success');
      navigate('/books');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <div className="panel form-panel">
        <div className="panel__header"><h3>Add Book</h3></div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field"><span>Book Title</span><input name="title" value={form.title} onChange={handleChange} required /></label>
          <label className="field"><span>Author</span><input name="author" value={form.author} onChange={handleChange} required /></label>
          <label className="field"><span>Category</span><select name="category" value={form.category} onChange={handleChange}><option value="Fiction">Fiction</option><option value="Science">Science</option><option value="Technology">Technology</option><option value="History">History</option><option value="Fantasy">Fantasy</option></select></label>
          <label className="field"><span>ISBN</span><input name="isbn" value={form.isbn} onChange={handleChange} required /></label>
          <label className="field"><span>Quantity</span><input type="number" min="1" name="quantity" value={form.quantity} onChange={handleChange} required /></label>
          <label className="field"><span>Published Year</span><input type="number" name="publishedYear" value={form.publishedYear} onChange={handleChange} /></label>
          <label className="field field--full"><span>Cover Image URL</span><input name="coverImage" value={form.coverImage} onChange={handleChange} /></label>
          <label className="field field--full"><span>Description</span><textarea rows="4" name="description" value={form.description} onChange={handleChange} /></label>
          {error && <div className="alert alert-error field field--full">{error}</div>}
          <div className="form-actions field field--full">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/books')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Add Book'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
