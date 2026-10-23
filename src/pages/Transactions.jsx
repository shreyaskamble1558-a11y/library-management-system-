import { useMemo, useState } from 'react'
import { ArrowRight, RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import Modal from '../components/Modal'
import PageHeading from '../components/PageHeading'
import TransactionTable from '../components/TransactionTable'
import { useLibrary } from '../context/LibraryContext'
import ScrollReveal from '../components/ScrollReveal'
import BookCover from '../components/BookCover'

export default function Transactions() {
  const { transactions, books, members, returnBook } = useLibrary()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [selected, setSelected] = useState(null)
  const [pendingReturn, setPendingReturn] = useState(null)
  const filtered = useMemo(() => transactions.filter((transaction) => {
    const book = books.find((item) => item.id === transaction.bookId)
    const member = members.find((item) => item.id === transaction.memberId)
    const searchable = `${transaction.id} ${book?.title || ''} ${member?.name || ''} ${transaction.bookId} ${transaction.memberId}`.toLowerCase()
    const dueSoon = transaction.status === 'Issued' && transaction.daysRemaining >= 0 && transaction.daysRemaining <= 2
    const matchesStatus = status === 'All statuses'
      || transaction.status === status
      || (status === 'Due Soon' && dueSoon)
    return searchable.includes(query.toLowerCase()) && matchesStatus
  }), [transactions, books, members, query, status])
  const getBook = (transaction) => books.find((item) => item.id === transaction.bookId)
  const getMember = (transaction) => members.find((item) => item.id === transaction.memberId)

  return <>
    <PageHeading eyebrow="CIRCULATION" title="Transactions" description="Follow every book as it moves through your library."><Link to="/issue-book" className="button button-primary"><RotateCcw size={16} /> Issue a book</Link></PageHeading>
    <ScrollReveal as="section" className="content-panel list-panel">
      <div className="list-toolbar"><div className="list-count"><strong>{filtered.length}</strong> {filtered.length === 1 ? 'transaction' : 'transactions'} <span>on record</span></div><div className="toolbar-controls"><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search book, member, ID..." aria-label="Search transactions" /></label><label className="select-filter"><SlidersHorizontal size={15} /><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status"><option>All statuses</option><option>Issued</option><option>Due Soon</option><option>Overdue</option><option>Returned</option></select></label></div></div>
      <TransactionTable transactions={filtered} books={books} members={members} onView={setSelected} onReturn={setPendingReturn} />
      <div className="table-footer"><span>Showing {filtered.length} of {transactions.length} transactions</span><span className="table-footer-mark"><ArrowRight size={14} /> Live circulation</span></div>
    </ScrollReveal>
    {selected && <Modal title="Transaction details" onClose={() => setSelected(null)}><div className="book-detail-visual"><BookCover src={getBook(selected)?.coverImage} title={getBook(selected)?.title} category={getBook(selected)?.category} className="book-detail-cover" /><div className="detail-list"><div><span>Transaction ID</span><strong>{selected.id}</strong></div><div><span>User</span><strong>{getMember(selected)?.name || 'Member removed'}</strong></div><div><span>Roll number</span><strong>{getMember(selected)?.memberId || '—'}</strong></div><div><span>Book</span><strong>{getBook(selected)?.title || 'Book removed'}</strong></div><div><span>Issue date</span><strong>{selected.issueDate}</strong></div><div><span>Return date</span><strong>{selected.expectedReturnDate}</strong></div><div><span>Remaining</span><strong>{selected.status === 'Returned' ? '—' : selected.daysRemaining < 0 ? `${Math.abs(selected.daysRemaining)} days overdue` : selected.daysRemaining === 0 ? 'Due today' : `${selected.daysRemaining} days`}</strong></div><div><span>Status</span><strong>{selected.status}</strong></div>{selected.returnDate && <div><span>Actually returned</span><strong>{selected.returnDate}</strong></div>}</div></div></Modal>}
    {pendingReturn && <Modal title="Return this book?" confirmLabel="Confirm return" onClose={() => setPendingReturn(null)} onConfirm={() => { returnBook(pendingReturn); setPendingReturn(null) }}><p>Mark <strong>{getBook(pendingReturn)?.title || 'this book'}</strong> as returned by {getMember(pendingReturn)?.name || 'the member'}? Available inventory will be updated and their My Books history will reflect the return.</p></Modal>}
  </>
}
