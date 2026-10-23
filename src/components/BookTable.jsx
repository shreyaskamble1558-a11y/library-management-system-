import { Eye, Pencil, Trash2 } from 'lucide-react'
import BookCover from './BookCover'
import ImageWithFallback from './ImageWithFallback'
import ScrollReveal from './ScrollReveal'

export default function BookTable({ books, onView, onEdit, onDelete }) {
  if (!books.length) return <div className="empty-state"><ImageWithFallback src="/assets/empty-books.svg" fallback="/assets/book-placeholder.svg" className="empty-state-illustration" alt="Illustration of a small blue bookshelf" /><h3>No books found</h3><p>Try a different search or add a title to the collection.</p></div>
  return (
    <div className="table-scroll"><table className="data-table"><thead><tr><th>Book</th><th>Book ID</th><th>Category</th><th>ISBN</th><th>Copies</th><th>Availability</th><th><span className="sr-only">Actions</span></th></tr></thead>
      <tbody>{books.map((book, index) => <ScrollReveal as="tr" delay={Math.min(index, 5) * 45} key={book.id}>
        <td data-label="Book"><div className="book-cell"><BookCover src={book.coverImage} title={book.title} category={book.category} className="book-table-cover" /><span><strong>{book.title}</strong><small>{book.author}</small></span></div></td>
        <td data-label="Book ID"><span className="id-text">{book.id}</span></td><td data-label="Category"><span className="category-text">{book.category}</span></td><td data-label="ISBN"><span className="muted-text">{book.isbn}</span></td>
        <td data-label="Copies"><span className="quantity-text">{book.quantity}</span></td><td data-label="Availability"><span className={`availability-pill ${book.availableQuantity === 0 ? 'availability-out' : book.availableQuantity <= 2 ? 'availability-low' : ''}`}><i />{book.availableQuantity === 0 ? 'Out of stock' : `${book.availableQuantity} available`}</span></td>
        <td data-label="Actions"><div className="row-actions"><button className="icon-button" aria-label={`View ${book.title}`} title="View" onClick={() => onView(book)}><Eye size={16} /></button><button className="icon-button" aria-label={`Edit ${book.title}`} title="Edit" onClick={() => onEdit(book)}><Pencil size={15} /></button><button className="icon-button icon-button-danger" aria-label={`Delete ${book.title}`} title="Delete" onClick={() => onDelete(book)}><Trash2 size={15} /></button></div></td>
      </ScrollReveal>)}</tbody></table></div>
  )
}
