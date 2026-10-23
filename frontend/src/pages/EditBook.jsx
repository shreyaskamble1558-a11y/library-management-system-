import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../components/Loading';
import api from '../services/api';

export default function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await api.get(`/books/${id}`);
        setForm({
          title: response.data.book.title,
          author: response.data.book.author,
          category: response.data.book.category,
          isbn: response.data.book.isbn,
          quantity: response.data.book.quantity,
          publishedYear: response.data.book.publishedYear || new Date().getFullYear(),
          description: response.data.book.description || '',
          coverImage: response.data.book.coverImage || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Book not found');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await api.put(`/books/${id}`, form);
      if (window.showToast) window.showToast('Book updated successfully', 'success');
      navigate('/books');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update book');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading text="Loading book..." />;
  if (!form) return <div className="alert alert-error">{error || 'Book not found'}</div>;

  return (
    <div className="page-stack">
      <div className="panel form-panel">
        <div className="panel__header"><h3>Edit Book</h3></div>
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
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
