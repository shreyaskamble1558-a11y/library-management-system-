import { useMemo, useState } from 'react'
import { BookPlus, Plus, Search, SlidersHorizontal } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import BookTable from '../components/BookTable'
import Modal from '../components/Modal'
import PageHeading from '../components/PageHeading'
import { useLibrary } from '../context/LibraryContext'
import BookCover from '../components/BookCover'
import ScrollReveal from '../components/ScrollReveal'

export default function Books() {
  const { books, deleteBook } = useLibrary()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All categories')
  const [selected, setSelected] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const categories = [...new Set(books.map((book) => book.category))].sort()
  const filtered = useMemo(() => books.filter((book) => {
    const haystack = `${book.title} ${book.author} ${book.id} ${book.isbn}`.toLowerCase()
    return haystack.includes(query.toLowerCase()) && (category === 'All categories' || book.category === category)
  }), [books, query, category])

  return <>
    <PageHeading eyebrow="COLLECTION" title="Books" description="Manage titles, track availability, and keep your shelves up to date."><Link to="/books/add" className="button button-primary"><Plus size={16} /> Add new book</Link></PageHeading>
    <ScrollReveal as="section" className="content-panel list-panel">
      <div className="list-toolbar"><div className="list-count"><strong>{filtered.length}</strong> {filtered.length === 1 ? 'title' : 'titles'} <span>in your collection</span></div><div className="toolbar-controls"><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, author, ISBN..." aria-label="Search books" /></label><label className="select-filter"><SlidersHorizontal size={15} /><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category"><option>All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div></div>
      <BookTable books={filtered} onView={setSelected} onEdit={(book) => navigate(`/books/edit/${book.id}`)} onDelete={setPendingDelete} />
      <div className="table-footer"><span>Showing {filtered.length} of {books.length} titles</span><span className="table-footer-mark"><BookPlus size={14} /> Collection</span></div>
    </ScrollReveal>
    {selected && <Modal title="Book details" onClose={() => setSelected(null)}><div className="book-detail-visual"><BookCover src={selected.coverImage} title={selected.title} category={selected.category} className="book-detail-cover" /><div className="detail-list"><div><span>Title</span><strong>{selected.title}</strong></div><div><span>Author</span><strong>{selected.author}</strong></div><div><span>Book ID</span><strong>{selected.id}</strong></div><div><span>Category</span><strong>{selected.category}</strong></div><div><span>ISBN</span><strong>{selected.isbn}</strong></div><div><span>Copies</span><strong>{selected.availableQuantity} available of {selected.quantity}</strong></div></div></div></Modal>}
    {pendingDelete && <Modal title="Delete this book?" danger confirmLabel="Delete book" onClose={() => setPendingDelete(null)} onConfirm={() => { deleteBook(pendingDelete.id); setPendingDelete(null) }}><p><strong>{pendingDelete.title}</strong> will be removed from your collection. This action cannot be undone.</p></Modal>}
  </>
}
