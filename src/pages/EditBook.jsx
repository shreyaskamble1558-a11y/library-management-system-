import { Link, useNavigate, useParams } from 'react-router-dom'
import BookForm from '../components/BookForm'
import PageHeading from '../components/PageHeading'
import { useLibrary } from '../context/LibraryContext'

export default function EditBook() {
  const { id } = useParams()
  const { books, saveBook } = useLibrary()
  const navigate = useNavigate()
  const book = books.find((item) => item.id === id)
  if (!book) return <div className="not-found"><h1>Book not found</h1><p>This title may have been removed from the collection.</p><Link to="/books" className="button button-primary">Back to books</Link></div>
  return <><PageHeading eyebrow={`COLLECTION / ${book.id}`} title="Edit book" description="Update the details and stock levels for this title." /><BookForm mode="edit" initialValues={book} onSave={async (updated) => { const result = await saveBook(updated); if (result.ok) navigate('/books'); return result }} /></>
}
