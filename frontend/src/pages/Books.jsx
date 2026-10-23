import { useEffect, useState } from 'react';
import { Eye, Pencil, Search, Trash2, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import api from '../services/api';

const defaultFilters = { search: '', category: '', availability: '' };

export default function Books() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchBooks = async (nextPage = 1, queryFilters = filters) => {
    setLoading(true);
    try {
      const response = await api.get('/books', {
        params: {
          page: nextPage,
          limit: 10,
          search: queryFilters.search,
          category: queryFilters.category,
          availability: queryFilters.availability,
        },
      });

      setBooks(response.data.books || []);
      setPagination(response.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);
    fetchBooks(1, nextFilters);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/books/${deleteTarget._id}`);
      if (window.showToast) window.showToast('Book deleted successfully', 'success');
      setDeleteTarget(null);
      fetchBooks();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <Loading text="Loading books..." />;

  return (
    <div className="page-stack">
      <div className="page-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input type="text" placeholder="Search title, author, ISBN" value={filters.search} name="search" onChange={handleFilterChange} />
        </div>
        <div className="toolbar-actions">
          <select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">All categories</option>
            <option value="Fiction">Fiction</option>
            <option value="Science">Science</option>
            <option value="Technology">Technology</option>
            <option value="History">History</option>
            <option value="Fantasy">Fantasy</option>
          </select>
          <select name="availability" value={filters.availability} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="available">Available</option>
            <option value="out">Out of stock</option>
          </select>
          <Link to="/books/add" className="btn btn-primary"><Plus size={16} /> Add Book</Link>
        </div>
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>ISBN</th>
                <th>Qty</th>
                <th>Available</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.length ? books.map((book) => (
                <tr key={book._id}>
                  <td><img src={book.coverImage || 'https://placehold.co/80x110?text=Book'} alt={book.title} className="thumb" onError={(e) => { e.target.src = 'https://placehold.co/80x110?text=Book'; }} /></td>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.category}</td>
                  <td>{book.isbn}</td>
                  <td>{book.quantity}</td>
                  <td>{book.availableQuantity}</td>
                  <td><span className={`badge badge--${book.availableQuantity > 0 ? 'success' : 'danger'}`}>{book.availableQuantity > 0 ? 'Available' : 'Out of Stock'}</span></td>
                  <td className="row-actions">
                    <button type="button" className="action-btn" onClick={() => navigate(`/books/edit/${book._id}`)}><Pencil size={15} /></button>
                    <button type="button" className="action-btn action-btn--danger" onClick={() => setDeleteTarget(book)}><Trash2 size={15} /></button>
                    <button type="button" className="action-btn" onClick={() => navigate(`/books/edit/${book._id}`)}><Eye size={15} /></button>
                  </td>
                </tr>
              )) : <tr><td colSpan="9" className="empty-cell">No books found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pagination">
        <button type="button" disabled={pagination.page <= 1} onClick={() => fetchBooks(pagination.page - 1)}>Previous</button>
        <span>Page {pagination.page} of {pagination.totalPages || 1}</span>
        <button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchBooks(pagination.page + 1)}>Next</button>
      </div>

      <Modal
        isOpen={Boolean(deleteTarget)}
        title="Delete book"
        confirmText="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      >
        <p>Are you sure you want to delete this book?</p>
      </Modal>
    </div>
  );
}
