import { ArrowRight, BookCopy, BookOpen, CalendarDays, CircleUserRound, Clock3, Plus, RotateCcw, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeading from '../components/PageHeading'
import StatCard from '../components/StatCard'
import TransactionTable from '../components/TransactionTable'
import { useLibrary } from '../context/LibraryContext'
import ImageWithFallback from '../components/ImageWithFallback'
import ScrollReveal from '../components/ScrollReveal'

export default function Dashboard() {
  const { books, members, transactions } = useLibrary()
  const today = new Date()
  const dateLabel = today.toLocaleDateString('en', { weekday: 'long', month: 'long', day: '2-digit' }).toUpperCase()
  const totalCopies = books.reduce((sum, book) => sum + Number(book.quantity || 0), 0)
  const availableCopies = books.reduce((sum, book) => sum + Number(book.availableQuantity || 0), 0)
  const activeLoans = transactions.filter((item) => item.status === 'Issued').length
  const returned = transactions.filter((item) => item.status === 'Returned').length
  const upcoming = transactions.filter((item) => item.status === 'Issued').sort((a, b) => a.expectedReturnDate.localeCompare(b.expectedReturnDate)).slice(0, 3)
  const findBook = (id) => books.find((book) => book.id === id)
  const findMember = (id) => members.find((member) => member.id === id)

  return <>
    <ScrollReveal className="dashboard-heading"><PageHeading eyebrow={dateLabel} title="Good morning, librarian" description="Here's what's happening across your library today.">
      <Link to="/issue-book" className="button button-primary"><Plus size={16} /> Issue a book</Link>
    </PageHeading></ScrollReveal>
    <ScrollReveal as="section" className="dashboard-banner" delay={70}>
      <ImageWithFallback src="/assets/library-shelves.jpg" fallback="/assets/library-interior.jpg" alt="Tall shelves filled with books in a bright college library" className="dashboard-banner-image" />
      <div className="dashboard-banner-shade" />
      <div className="dashboard-banner-copy"><span>YOUR CAMPUS COLLECTION</span><h2>A space to discover more.</h2><p>Make every visit to the library a new beginning.</p></div>
      <Link to="/books" className="dashboard-banner-link">Explore collection <ArrowRight size={15} /></Link>
    </ScrollReveal>
    <ScrollReveal as="section" className="stats-grid" aria-label="Library statistics">
      <StatCard label="Total books" value={totalCopies.toLocaleString()} note={`${books.length} unique titles`} icon={BookOpen} tone="sage" trend={<TrendingUp size={13} />} />
      <StatCard label="Total members" value={members.length.toLocaleString()} note="Registered readers" icon={CircleUserRound} tone="peach" />
      <StatCard label="Issued books" value={activeLoans.toLocaleString()} note="Currently checked out" icon={BookCopy} tone="blue" />
      <StatCard label="Returned books" value={returned.toLocaleString()} note="Completed transactions" icon={RotateCcw} tone="yellow" />
      <StatCard label="Available books" value={availableCopies.toLocaleString()} note="Ready to be borrowed" icon={BookOpen} tone="sage" />
    </ScrollReveal>
    <div className="dashboard-grid">
      <ScrollReveal as="section" className="content-panel recent-panel">
        <div className="panel-heading"><div><div className="panel-eyebrow">THE LATEST</div><h2>Recent transactions</h2></div><Link className="text-link" to="/transactions">View all <ArrowRight size={15} /></Link></div>
        <TransactionTable transactions={transactions.slice(0, 5)} books={books} members={members} compact />
      </ScrollReveal>
      <ScrollReveal as="section" className="content-panel due-panel" delay={80}>
        <div className="panel-heading"><div><div className="panel-eyebrow">KEEP AN EYE ON</div><h2>Coming due</h2></div><span className="due-icon"><CalendarDays size={17} /></span></div>
        {upcoming.length ? <div className="due-list">{upcoming.map((transaction) => {
          const book = findBook(transaction.bookId)
          const member = findMember(transaction.memberId)
          return <div className="due-item" key={transaction.id}><div className="due-date"><span>{new Date(`${transaction.expectedReturnDate}T00:00:00`).toLocaleDateString('en', { day: '2-digit' })}</span><small>{new Date(`${transaction.expectedReturnDate}T00:00:00`).toLocaleDateString('en', { month: 'short' })}</small></div><div className="due-detail"><strong>{book?.title || 'Book removed'}</strong><span>{member?.name || 'Member removed'}</span></div><Clock3 size={15} className="due-clock" /></div>
        })}</div> : <div className="due-empty">No books are currently checked out.</div>}
        <Link to="/transactions" className="due-footer">Manage circulation <ArrowRight size={15} /></Link>
      </ScrollReveal>
    </div>
    <ScrollReveal as="section" className="content-panel dashboard-books-panel">
      <div className="panel-heading"><div><div className="panel-eyebrow">FRESH ON THE SHELVES</div><h2>Recently added books</h2></div><Link className="text-link" to="/books">Browse collection <ArrowRight size={15} /></Link></div>
      {books.length ? <div className="dashboard-book-grid">{books.slice(0, 3).map((book, index) => <ScrollReveal as="article" delay={index * 55} className="dashboard-book-card" key={book.id}>
        <ImageWithFallback src={book.coverImage || (index === 0 ? '/assets/book-cover-literature.svg' : index === 1 ? '/assets/book-cover-technology.svg' : '/assets/book-cover-general.svg')} fallback="/assets/book-placeholder.svg" alt={`Cover artwork for ${book.title}`} className="dashboard-book-cover" />
        <div><span>{book.category}</span><strong>{book.title}</strong><small>{book.author}</small></div>
      </ScrollReveal>)}</div> : <div className="dashboard-book-empty"><ImageWithFallback src="/assets/empty-books.svg" fallback="/assets/book-placeholder.svg" alt="Blue bookshelf illustration" /><span>Your newest library additions will appear here.</span></div>}
    </ScrollReveal>
    <ScrollReveal as="section" className="welcome-strip"><div className="welcome-icon"><BookOpen size={20} /></div><div><strong>{availableCopies} copies ready to discover</strong><span>{totalCopies ? `${Math.round((availableCopies / totalCopies) * 100)}% of your collection is available to readers.` : 'Add books to start building your collection.'}</span></div><Link to="/books" aria-label="Browse books"><ArrowRight size={18} /></Link></ScrollReveal>
  </>
}
