import { useState } from 'react'
import { ArrowRight, BookOpen, CalendarDays, CircleUserRound, Info, LibraryBig } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import PageHeading from '../components/PageHeading'
import { useLibrary } from '../context/LibraryContext'
import { currentDate } from '../utils/storage'
import BookCover from '../components/BookCover'
import ProfileAvatar from '../components/ProfileAvatar'

export default function IssueBook() {
  const { books, members, issueBook } = useLibrary()
  const navigate = useNavigate()
  const [memberId, setMemberId] = useState('')
  const [bookId, setBookId] = useState('')
  const [issueDate, setIssueDate] = useState(currentDate())
  const [expectedReturnDate, setExpectedReturnDate] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [memberQuery, setMemberQuery] = useState('')
  const [bookQuery, setBookQuery] = useState('')
  const member = members.find((item) => item.id === memberId)
  const book = books.find((item) => item.id === bookId)
  const availableBooks = books.filter((item) => item.availableQuantity > 0)
  const filteredMembers = members.filter((item) => `${item.name} ${item.memberId}`.toLowerCase().includes(memberQuery.toLowerCase()))
  const filteredBooks = availableBooks.filter((item) => `${item.title} ${item.isbn}`.toLowerCase().includes(bookQuery.toLowerCase()))
  const submit = async (event) => {
    event.preventDefault()
    if (!memberId || !bookId) return setError('Select both a member and a book to continue.')
    if (!issueDate || !expectedReturnDate || expectedReturnDate < issueDate) return setError('Choose a valid return date after the issue date.')
    setIsSubmitting(true)
    const result = await issueBook({ memberId, bookId, issueDate, expectedReturnDate })
    setIsSubmitting(false)
    if (!result.ok) return setError(result.message)
    navigate('/transactions')
  }

  return <>
    <PageHeading eyebrow="CIRCULATION / CHECKOUT" title="Issue a book" description="Check out a title to a library member." />
    <div className="issue-layout">
      <form className="form-panel issue-form" onSubmit={submit}>
        <div className="form-panel-heading"><span className="form-icon"><LibraryBig size={18} /></span><div><h2>Loan details</h2><p>Choose a reader and an available title.</p></div></div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="form-grid issue-fields">
          <label className="field field-span-2"><span>Select user <b>*</b></span><input type="search" value={memberQuery} onChange={(event) => setMemberQuery(event.target.value)} placeholder="Search user by name or roll number..." aria-label="Search user by name or roll number" /><select value={memberId} onChange={(event) => setMemberId(event.target.value)} required><option value="">Choose a user...</option>{filteredMembers.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.memberId}</option>)}</select></label>
          <label className="field field-span-2"><span>Select book <b>*</b></span><input type="search" value={bookQuery} onChange={(event) => setBookQuery(event.target.value)} placeholder="Search book by title or ISBN..." aria-label="Search book by title or ISBN" /><select value={bookId} onChange={(event) => setBookId(event.target.value)} required><option value="">Choose an available title...</option>{filteredBooks.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.isbn} · {item.availableQuantity} available</option>)}</select></label>
          <label className="field"><span>Issue date <b>*</b></span><input type="date" value={issueDate} max={expectedReturnDate || undefined} onChange={(event) => setIssueDate(event.target.value)} required /></label>
          <label className="field"><span>Expected return <b>*</b></span><input type="date" value={expectedReturnDate} min={issueDate} onChange={(event) => setExpectedReturnDate(event.target.value)} required /></label>
        </div>
        <div className="form-footer"><Link to="/transactions" className="button button-quiet">Cancel</Link><button className="button button-primary" type="submit" disabled={isSubmitting}>{isSubmitting && <span className="button-spinner" aria-hidden="true" />}<span>{isSubmitting ? 'Recording loan...' : 'Confirm issue'}</span>{!isSubmitting && <ArrowRight size={16} />}</button></div>
      </form>
      <aside className="issue-aside">
        <section className="selection-card"><div className="selection-card-head"><span className="selection-icon"><BookOpen size={18} /></span><span>SELECTED TITLE</span></div>{book ? <div className="selected-book-summary"><BookCover src={book.coverImage} title={book.title} category={book.category} className="selected-book-cover" /><div><h3>{book.title}</h3><p>by {book.author}</p><div className={`stock-meter ${book.availableQuantity === 1 ? 'stock-meter-low' : ''}`}><strong>{book.availableQuantity}</strong><span>of {book.quantity} copies available</span></div></div><div className="selection-meta"><span>{book.category}</span><span>{book.id}</span></div></div> : <div className="selection-placeholder">Choose a title to see its availability.</div>}</section>
        <section className="selection-card member-selection"><div className="selection-card-head"><span className="selection-icon selection-icon-member"><CircleUserRound size={18} /></span><span>READER</span></div>{member ? <div className="selected-member-summary"><ProfileAvatar alt={`${member.name}'s profile illustration`} className="selected-member-avatar" /><div><h3>{member.name}</h3><p>{member.email}</p></div><div className="selection-meta"><span>Member since</span><span>{member.membershipDate}</span></div></div> : <div className="selection-placeholder">Select a member to see their details.</div>}</section>
        <div className="issue-tip"><Info size={16} /><span>Books with no available copies cannot be checked out.</span></div>
        <div className="issue-count"><CalendarDays size={16} /> <span>{availableBooks.length} titles currently available</span></div>
      </aside>
    </div>
  </>
}
