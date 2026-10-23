import { ArrowDownLeft, BookOpen, Eye, RotateCcw } from 'lucide-react'
import ImageWithFallback from './ImageWithFallback'
import ScrollReveal from './ScrollReveal'

export default function TransactionTable({ transactions, books, members, onReturn, onView, compact = false }) {
  if (!transactions.length) return <div className="empty-state"><ImageWithFallback src="/assets/empty-transactions.svg" fallback="/assets/book-placeholder.svg" className="empty-state-illustration" alt="Illustration of an empty library transaction ledger" /><h3>No transactions yet</h3><p>Issued and returned books will appear here.</p></div>
  const getBook = (id) => books.find((item) => item.id === id)
  const getMember = (id) => members.find((item) => item.id === id)
  return (
    <div className="table-scroll"><table className={`data-table ${compact ? 'table-compact' : ''}`}><thead><tr><th>Transaction</th><th>User / roll no</th><th>Book</th><th>Issue date</th><th>Return date</th><th>Remaining</th><th>Status</th>{!compact && <th><span className="sr-only">Actions</span></th>}</tr></thead>
      <tbody>{transactions.map((transaction, index) => {
        const book = getBook(transaction.bookId)
        const member = getMember(transaction.memberId)
        const overdue = transaction.status === 'Overdue' || (transaction.status === 'Issued' && transaction.daysRemaining < 0)
        const dueSoon = transaction.status === 'Issued' && transaction.daysRemaining >= 0 && transaction.daysRemaining <= 2
        const remaining = transaction.status === 'Returned'
          ? '—'
          : overdue
            ? `${Math.max(1, Math.abs(transaction.daysRemaining))} days overdue`
            : transaction.daysRemaining === 0
              ? 'Due today'
              : `${transaction.daysRemaining} days`
        return <ScrollReveal as="tr" delay={Math.min(index, 5) * 35} key={transaction.id}>
          <td data-label="Transaction"><span className="id-text">{transaction.id}</span></td>
          <td data-label="User"><span className="transaction-person"><strong>{member?.name || 'Member removed'}</strong><small>{member?.memberId || '—'}</small></span></td>
          <td data-label="Book"><div className="transaction-book"><span className="transaction-book-icon"><BookOpen size={15} /></span><span><strong>{book?.title || 'Book removed'}</strong><small>{book?.isbn || ''}</small></span></div></td>
          <td data-label="Issue date"><span className="muted-text">{transaction.issueDate}</span></td><td data-label="Return date"><span className={overdue ? 'overdue-text' : 'muted-text'}>{transaction.expectedReturnDate}</span></td>
          <td data-label="Remaining"><span className={overdue ? 'overdue-text' : dueSoon ? 'due-soon-text' : 'muted-text'}>{remaining}</span></td>
          <td data-label="Status"><span className={`status-pill ${transaction.status === 'Returned' ? 'status-returned' : overdue ? 'status-overdue' : 'status-issued'}`}><i />{overdue ? 'Overdue' : dueSoon ? 'Due soon' : transaction.status}</span></td>
          {!compact && <td data-label="Actions"><div className="row-actions"><button className="icon-button" aria-label={`View transaction ${transaction.id}`} title="View" onClick={() => onView?.(transaction)}><Eye size={16} /></button>{transaction.status !== 'Returned' && <button className="icon-button return-action" aria-label={`Return ${book?.title || 'book'}`} title="Return book" onClick={() => onReturn(transaction)}><RotateCcw size={15} /></button>}{transaction.status === 'Returned' && <span className="return-date"><ArrowDownLeft size={13} /> {transaction.returnDate}</span>}</div></td>}
        </ScrollReveal>
      })}</tbody></table></div>
  )
}
