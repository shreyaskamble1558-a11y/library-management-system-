import { useNavigate } from 'react-router-dom'
import BookForm from '../components/BookForm'
import PageHeading from '../components/PageHeading'
import { useLibrary } from '../context/LibraryContext'

export default function AddBook() {
  const { saveBook } = useLibrary()
  const navigate = useNavigate()
  return <><PageHeading eyebrow="COLLECTION / NEW TITLE" title="Add a book" description="Add a new title to your library collection." /><BookForm onSave={async (book) => { const result = await saveBook(book); if (result.ok) navigate('/books'); return result }} /></>
}
