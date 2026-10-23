import { useMemo, useState } from 'react'
import { Plus, Search, UsersRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import MemberTable from '../components/MemberTable'
import Modal from '../components/Modal'
import PageHeading from '../components/PageHeading'
import { useLibrary } from '../context/LibraryContext'
import ScrollReveal from '../components/ScrollReveal'
import ProfileAvatar from '../components/ProfileAvatar'

export default function Members() {
  const { members, books, transactions, deleteMember } = useLibrary()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const filtered = useMemo(() => members.filter((member) => `${member.name} ${member.email} ${member.phone} ${member.memberId} ${member.id}`.toLowerCase().includes(query.toLowerCase())), [members, query])
  const memberTransactions = selected ? transactions.filter((transaction) => transaction.memberId === selected.id) : []
  const currentLoans = memberTransactions.filter((transaction) => transaction.status !== 'Returned')
  const findBook = (transaction) => books.find((book) => book.id === transaction.bookId)
  const formatDate = (value) => value ? new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  return <>
    <PageHeading eyebrow="COMMUNITY" title="Members" description="Your reader directory, all in one place."><Link to="/members/add" className="button button-primary"><Plus size={16} /> Add member</Link></PageHeading>
    <ScrollReveal as="section" className="content-panel list-panel">
      <div className="list-toolbar"><div className="list-count"><strong>{filtered.length}</strong> {filtered.length === 1 ? 'member' : 'members'} <span>registered</span></div><div className="toolbar-controls"><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, phone..." aria-label="Search members" /></label></div></div>
      <MemberTable members={filtered} onView={setSelected} onEdit={(member) => navigate(`/members/edit/${member.id}`)} onDelete={setPendingDelete} />
      <div className="table-footer"><span>Showing {filtered.length} of {members.length} members</span><span className="table-footer-mark"><UsersRound size={14} /> Member directory</span></div>
    </ScrollReveal>
    {selected && <Modal title="Member profile" onClose={() => setSelected(null)}>
      <div className="member-detail-portrait"><ProfileAvatar alt={`${selected.name}'s profile illustration`} className="member-detail-avatar" /><div><strong>{selected.name}</strong><span>{selected.memberId}</span></div></div>
      <div className="detail-list">
        <div><span>Name</span><strong>{selected.name}</strong></div>
        <div><span>Roll number</span><strong>{selected.memberId}</strong></div>
        <div><span>Email</span><strong>{selected.email}</strong></div>
        <div><span>Phone</span><strong>{selected.phone}</strong></div>
        <div><span>Course</span><strong>{selected.course || '—'}</strong></div>
        <div><span>Year</span><strong>{selected.year || '—'}</strong></div>
        <div><span>Department</span><strong>{selected.department || '—'}</strong></div>
        <div><span>Status</span><strong>{selected.status || 'Active'}</strong></div>
        <div><span>Membership date</span><strong>{selected.membershipDate}</strong></div>
      </div>
      <h3 className="member-loan-heading">Current books</h3>
      {currentLoans.length ? <div className="member-loan-list">{currentLoans.map((transaction) => <div key={transaction._id}><strong>{findBook(transaction)?.title || 'Book removed'}</strong><span>Issue: {formatDate(transaction.issueDate)} · Return: {formatDate(transaction.expectedReturnDate)} · {transaction.status === 'Overdue' ? `${Math.max(1, Math.abs(transaction.daysRemaining))} days overdue` : `${transaction.daysRemaining} days remaining`} · {transaction.status}</span></div>)}</div> : <p className="member-loan-empty">No current books issued.</p>}
      <h3 className="member-loan-heading">Borrowing history</h3>
      {memberTransactions.length ? <div className="member-loan-list">{memberTransactions.map((transaction) => <div key={transaction._id}><strong>{findBook(transaction)?.title || 'Book removed'}</strong><span>Issue: {formatDate(transaction.issueDate)} · Expected: {formatDate(transaction.expectedReturnDate)} · Returned: {formatDate(transaction.returnDate)} · {transaction.status}</span></div>)}</div> : <p className="member-loan-empty">No borrowing history yet.</p>}
    </Modal>}
    {pendingDelete && <Modal title="Remove this member?" danger confirmLabel="Delete member" onClose={() => setPendingDelete(null)} onConfirm={() => { deleteMember(pendingDelete.id); setPendingDelete(null) }}><p><strong>{pendingDelete.name}</strong> will be removed from the member directory. Members with active loans cannot be deleted.</p></Modal>}
  </>
}
