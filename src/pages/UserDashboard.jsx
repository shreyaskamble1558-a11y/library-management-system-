import { useEffect, useMemo, useState } from 'react'
import { BookOpen, GraduationCap, History, LogOut, Search } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Modal from '../components/Modal'
import BookCover from '../components/BookCover'
import ImageWithFallback from '../components/ImageWithFallback'
import ProfileAvatar from '../components/ProfileAvatar'
import ScrollReveal from '../components/ScrollReveal'
import { useLibrary } from '../context/LibraryContext'

const tabs = [
  { label: 'Search Books', path: '/user/dashboard' },
  { label: 'My Books', path: '/user/my-books' },
  { label: 'My History', path: '/user/history' },
]

function getDaysRemaining(dateValue) {
  const [year, month, day] = dateValue.slice(0, 10).split('-').map(Number)
  const due = Date.UTC(year, month - 1, day)
  const now = new Date()
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.ceil((due - today) / 86400000)
}

function formatDate(dateValue) {
  return dateValue ? new Date(`${dateValue.slice(0, 10)}T00:00:00`).toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
}

function getLoanState(transaction) {
  if (transaction.status === 'Returned') return 'Returned'
  const remaining = getDaysRemaining(transaction.expectedReturnDate)
  if (transaction.status === 'Overdue' || remaining < 0) return 'Overdue'
  if (remaining <= 2) return 'Due soon'
  return 'Issued'
}

function remainingLabel(transaction) {
  if (transaction.status === 'Returned') return 'Complete'
  const remaining = getDaysRemaining(transaction.expectedReturnDate)
  if (remaining < 0 || transaction.status === 'Overdue') {
    const daysOverdue = Math.max(1, Math.abs(remaining))
    return `${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'} overdue`
  }
  if (remaining === 0) return 'Due today'
  return `${remaining} ${remaining === 1 ? 'day' : 'days'} remaining`
}

export default function UserDashboard() {
  const { user: sessionUser, fetchUserDashboard, logout } = useLibrary()
  const navigate = useNavigate()
  const location = useLocation()
  const [tab, setTab] = useState('Search Books')
  const [query, setQuery] = useState('')
  const [data, setData] = useState({ user: sessionUser, books: [], transactions: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedTransaction, setSelectedTransaction] = useState(null)

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      setData(await fetchUserDashboard())
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== 'visible') return
      fetchUserDashboard().then((nextData) => {
        setData(nextData)
        setError('')
      }).catch((requestError) => setError(requestError.message))
    }
    const interval = window.setInterval(refresh, 10000)
    window.addEventListener('focus', refresh)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  useEffect(() => {
    if (location.pathname === '/user/my-books') setTab('My Books')
    else if (location.pathname === '/user/history') setTab('My History')
    else if (location.pathname === '/user/dashboard') setTab('Search Books')
  }, [location.pathname])

  const filteredBooks = useMemo(() => {
    const search = query.trim().toLowerCase()
    return data.books.filter((book) => `${book.title} ${book.author} ${book.category} ${book.isbn}`.toLowerCase().includes(search))
  }, [data.books, query])

  const activeTransactions = data.transactions.filter((transaction) => getLoanState(transaction) !== 'Returned')
  const historyTransactions = data.transactions.filter((transaction) => ['Returned', 'Overdue'].includes(getLoanState(transaction)))
  const dueSoonCount = activeTransactions.filter((transaction) => getLoanState(transaction) === 'Due soon').length
  const overdueCount = activeTransactions.filter((transaction) => getLoanState(transaction) === 'Overdue').length

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="user-page">
      <header className="user-topbar">
        <Link to="/user/dashboard" className="user-brand"><span><BookOpen size={21} /></span><strong>LIBRARY SYSTEM</strong></Link>
        <div className="user-topbar-right"><span className="user-greeting"><ProfileAvatar alt={`${data.user?.name || sessionUser?.name || 'Reader'} profile illustration`} className="user-greeting-avatar" /> {data.user?.name || sessionUser?.name}</span><button className="button button-quiet" type="button" onClick={handleLogout}><LogOut size={15} /> Sign out</button></div>
      </header>

      <div className="user-content">
        <section className="user-welcome">
          <div><span className="user-eyebrow">READER PORTAL</span><h1>Welcome, {data.user?.name || sessionUser?.name} <span aria-hidden="true">👋</span></h1><p>Roll number: {data.user?.memberId || sessionUser?.memberId || '—'} · Discover and manage your library books.</p></div>
          <div className="user-welcome-icon"><GraduationCap size={32} /></div>
        </section>

        <nav className="user-tabs" aria-label="Reader dashboard">
          {tabs.map((item) => <Link key={item.path} to={item.path} className={tab === item.label ? 'user-tab user-tab-active' : 'user-tab'}>{item.label}</Link>)}
          <button type="button" className={tab === 'Profile' ? 'user-tab user-tab-active' : 'user-tab'} onClick={() => setTab('Profile')}>Profile</button>
        </nav>

        {error && <div className="user-error" role="alert"><span>{error}</span><button className="button button-quiet" type="button" onClick={loadDashboard}>Try again</button></div>}
        {loading ? <div className="user-loading" role="status" aria-label="Loading library data">
          <div className="skeleton-summary">{[0, 1, 2].map((item) => <span className="skeleton skeleton-stat" key={item} />)}</div>
          <div className="skeleton-book-grid">{[0, 1, 2].map((item) => <span className="skeleton skeleton-book-card" key={item} />)}</div>
          <span className="skeleton-loading-label"><span className="login-spinner" /> Loading your library...</span>
        </div> : (
          <>
            {tab === 'Search Books' && <>
              <section className="user-loan-stats" aria-label="Current loan summary">
                <article><span>Books Issued</span><strong>{activeTransactions.length}</strong><BookOpen size={18} /></article>
                <article className="user-stat-due"><span>Due Soon</span><strong>{dueSoonCount}</strong><span className="user-stat-mark">!</span></article>
                <article className="user-stat-overdue"><span>Overdue</span><strong>{overdueCount}</strong><History size={18} /></article>
              </section>
              <ScrollReveal as="section" className="user-section user-current-section">
                <div className="user-section-heading"><div><span className="user-eyebrow">YOUR READING</span><h2>My Current Books</h2></div><Link to="/user/my-books" className="user-section-link">View all</Link></div>
                {activeTransactions.length ? <div className="user-current-grid">{activeTransactions.map((transaction, index) => {
                  const state = getLoanState(transaction)
                  return <ScrollReveal as="article" delay={Math.min(index, 5) * 45} className="user-current-card" key={transaction._id}>
                    <BookCover src={transaction.book?.coverImage} title={transaction.book?.title} category={transaction.book?.category} className="user-cover-current" />
                    <h3>{transaction.book?.title || 'Book details unavailable'}</h3>
                    <p>{transaction.book?.author || ''}</p>
                    <strong className={`user-current-remaining ${state === 'Overdue' ? 'overdue' : state === 'Due soon' ? 'due-soon' : ''}`}>{remainingLabel(transaction)}</strong>
                    <button type="button" className="user-inline-button" onClick={() => setSelectedTransaction(transaction)}>View Details</button>
                  </ScrollReveal>
                })}</div> : <div className="user-empty"><ImageWithFallback src="/assets/empty-books.svg" fallback="/assets/book-placeholder.svg" alt="Blue bookshelf illustration" className="user-empty-illustration" /><strong>No books currently issued</strong><span>Your currently borrowed books will appear here.</span></div>}
              </ScrollReveal>
              <ScrollReveal as="section" className="user-section user-search-section">
                <div className="user-section-heading"><div><span className="user-eyebrow">THE COLLECTION</span><h2>Search Books</h2></div><label className="search-field user-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, author, ISBN..." aria-label="Search books" /></label></div>
                {filteredBooks.length ? <div className="user-book-grid">{filteredBooks.map((book, index) => <ScrollReveal as="article" delay={Math.min(index, 5) * 45} className="user-book-card" key={book._id}>
                  <BookCover src={book.coverImage} title={book.title} category={book.category} /><div className="user-book-category">{book.category}</div><h3>{book.title}</h3><p>{book.author}</p><span className={`user-stock ${book.availableQuantity > 0 ? '' : 'user-stock-none'}`}>{book.availableQuantity > 0 ? `${book.availableQuantity} available` : 'Currently unavailable'}</span>
                  <button type="button" className="user-inline-button" onClick={() => setSelectedBook(book)}>View Details</button>
                </ScrollReveal>)}</div> : <div className="user-empty"><ImageWithFallback src="/assets/empty-books.svg" fallback="/assets/book-placeholder.svg" alt="Blue bookshelf illustration" className="user-empty-illustration" /><strong>{data.books.length ? 'No matching books' : 'The collection is waiting to grow'}</strong><span>{data.books.length ? 'Try another title, author or category.' : 'No books have been added to the library yet.'}</span></div>}
              </ScrollReveal>
            </>}

            {tab === 'My Books' && <ScrollReveal as="section" className="user-section">
              <div className="user-section-heading"><div><span className="user-eyebrow">YOUR READING</span><h2>My Books</h2></div><span className="user-book-count">{activeTransactions.length} current {activeTransactions.length === 1 ? 'book' : 'books'}</span></div>
              {activeTransactions.length ? <div className="user-loan-list">{activeTransactions.map((transaction, index) => {
                const state = getLoanState(transaction)
                return <ScrollReveal as="article" delay={Math.min(index, 5) * 35} className="user-loan-row" key={transaction._id}>
                  <BookCover src={transaction.book?.coverImage} title={transaction.book?.title} category={transaction.book?.category} className="user-cover-loan" />
                  <div className="user-loan-title"><strong>{transaction.book?.title || 'Book details unavailable'}</strong><span>{transaction.book?.author || ''}</span></div>
                  <div className="user-loan-date"><span>Issue date</span><strong>{formatDate(transaction.issueDate)}</strong></div>
                  <div className="user-loan-date"><span>Return date</span><strong>{formatDate(transaction.expectedReturnDate)}</strong></div>
                  <div className="user-loan-remaining"><span>Days remaining</span><strong className={state === 'Overdue' ? 'overdue' : state === 'Due soon' ? 'due-soon' : ''}>{remainingLabel(transaction)}</strong></div>
                  <span className={`user-loan-status ${state === 'Overdue' ? 'overdue' : state === 'Due soon' ? 'due-soon' : ''}`}>{state}</span>
                  <button type="button" className="user-inline-button" onClick={() => setSelectedTransaction(transaction)}>Details</button>
                </ScrollReveal>
              })}</div> : <div className="user-empty"><ImageWithFallback src="/assets/empty-books.svg" fallback="/assets/book-placeholder.svg" alt="Blue bookshelf illustration" className="user-empty-illustration" /><strong>No books on your account yet</strong><span>Books issued to you will appear here.</span></div>}
            </ScrollReveal>}

            {tab === 'My History' && <ScrollReveal as="section" className="user-section">
              <div className="user-section-heading"><div><span className="user-eyebrow">YOUR READING RECORD</span><h2>My History</h2></div><span className="user-book-count">{historyTransactions.length} records</span></div>
              {historyTransactions.length ? <div className="user-loan-list">{historyTransactions.map((transaction, index) => {
                const state = getLoanState(transaction)
                return <ScrollReveal as="article" delay={Math.min(index, 5) * 35} className="user-loan-row" key={transaction._id}>
                  <BookCover src={transaction.book?.coverImage} title={transaction.book?.title} category={transaction.book?.category} className="user-cover-loan" />
                  <div className="user-loan-title"><strong>{transaction.book?.title || 'Book details unavailable'}</strong><span>{transaction.book?.author || ''}</span></div>
                  <div className="user-loan-date"><span>Issue date</span><strong>{formatDate(transaction.issueDate)}</strong></div>
                  <div className="user-loan-date"><span>Expected return</span><strong>{formatDate(transaction.expectedReturnDate)}</strong></div>
                  <div className="user-loan-date"><span>Actual returned</span><strong>{formatDate(transaction.returnDate)}</strong></div>
                  <span className={`user-loan-status ${state === 'Overdue' ? 'overdue' : state === 'Returned' ? 'returned' : ''}`}>{state}</span>
                </ScrollReveal>
              })}</div> : <div className="user-empty"><ImageWithFallback src="/assets/empty-transactions.svg" fallback="/assets/book-placeholder.svg" alt="Empty library history illustration" className="user-empty-illustration" /><strong>No book history yet</strong><span>Your past loans will appear here.</span></div>}
            </ScrollReveal>}

            {tab === 'Profile' && <ScrollReveal as="section" className="user-section">
              <div className="user-section-heading"><div><span className="user-eyebrow">ACCOUNT DETAILS</span><h2>My Profile</h2></div></div>
              <div className="user-profile-portrait-wrap"><ProfileAvatar alt={`${data.user?.name || 'Reader'} profile illustration`} className="user-profile-portrait" /><div><strong>{data.user?.name || sessionUser?.name}</strong><span>Library member</span></div></div>
              <div className="user-profile-details">
                <div><span>FULL NAME</span><strong>{data.user?.name}</strong></div>
                <div><span>ROLL NUMBER</span><strong>{data.user?.memberId}</strong></div>
                <div><span>EMAIL ADDRESS</span><strong>{data.user?.email}</strong></div>
                <div><span>COURSE</span><strong>{data.user?.course || '—'}</strong></div>
                <div><span>YEAR</span><strong>{data.user?.year || '—'}</strong></div>
                <div><span>DEPARTMENT</span><strong>{data.user?.department || '—'}</strong></div>
                <div><span>MEMBERSHIP STATUS</span><strong>{data.user?.status}</strong></div>
              </div>
              <h3 className="user-current-heading">Currently Issued Books</h3>
              {activeTransactions.length ? <div className="user-profile-current">{activeTransactions.map((transaction) => <div key={transaction._id}><strong>{transaction.book?.title || 'Book details unavailable'}</strong><span>Issue: {formatDate(transaction.issueDate)} · Return: {formatDate(transaction.expectedReturnDate)} · {remainingLabel(transaction)} · {getLoanState(transaction)}</span></div>)}</div> : <div className="user-empty user-empty-compact">No books currently issued.</div>}
            </ScrollReveal>}
          </>
        )}
      </div>

      <footer className="user-footer">Library Management System <span>·</span> Reader portal</footer>
      {selectedTransaction && <Modal title="Book loan details" onClose={() => setSelectedTransaction(null)}>
        <div className="book-detail-visual"><BookCover src={selectedTransaction.book?.coverImage} title={selectedTransaction.book?.title} category={selectedTransaction.book?.category} className="book-detail-cover" /><div className="detail-list">
          <div><span>Book</span><strong>{selectedTransaction.book?.title}</strong></div>
          <div><span>Author</span><strong>{selectedTransaction.book?.author}</strong></div>
          <div><span>Category</span><strong>{selectedTransaction.book?.category}</strong></div>
          <div><span>ISBN</span><strong>{selectedTransaction.book?.isbn}</strong></div>
          <div><span>Description</span><strong>{selectedTransaction.book?.description || '—'}</strong></div>
          <div><span>Issued to</span><strong>{data.user?.name}</strong></div>
          <div><span>Roll number</span><strong>{data.user?.memberId}</strong></div>
          <div><span>Issue date</span><strong>{formatDate(selectedTransaction.issueDate)}</strong></div>
          <div><span>Return date</span><strong>{formatDate(selectedTransaction.expectedReturnDate)}</strong></div>
          <div><span>Days remaining</span><strong>{remainingLabel(selectedTransaction)}</strong></div>
          <div><span>Status</span><strong>{getLoanState(selectedTransaction)}</strong></div>
        </div></div>
      </Modal>}
      {selectedBook && <Modal title="Book details" onClose={() => setSelectedBook(null)}>
        <div className="book-detail-visual"><BookCover src={selectedBook.coverImage} title={selectedBook.title} category={selectedBook.category} className="book-detail-cover" />
        <div className="detail-list">
          <div><span>Title</span><strong>{selectedBook.title}</strong></div>
          <div><span>Author</span><strong>{selectedBook.author}</strong></div>
          <div><span>Category</span><strong>{selectedBook.category}</strong></div>
          <div><span>ISBN</span><strong>{selectedBook.isbn}</strong></div>
          <div><span>Published year</span><strong>{selectedBook.publishedYear || '—'}</strong></div>
          <div><span>Description</span><strong>{selectedBook.description || '—'}</strong></div>
          <div><span>Availability</span><strong>{selectedBook.availableQuantity} of {selectedBook.quantity} available</strong></div>
        </div>
        </div>
      </Modal>}
    </main>
  )
}
