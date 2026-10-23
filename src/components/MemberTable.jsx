import { Eye, Pencil, Trash2 } from 'lucide-react'
import ImageWithFallback from './ImageWithFallback'
import ScrollReveal from './ScrollReveal'

export default function MemberTable({ members, onView, onEdit, onDelete }) {
  if (!members.length) return <div className="empty-state"><ImageWithFallback src="/assets/empty-members.svg" fallback="/assets/avatar-reader.svg" className="empty-state-illustration" alt="Illustration of two library readers" /><h3>No members found</h3><p>Try another search or add someone to the directory.</p></div>
  return (
    <div className="table-scroll"><table className="data-table"><thead><tr><th>Member</th><th>Member ID</th><th>Email</th><th>Phone</th><th>Member since</th><th><span className="sr-only">Actions</span></th></tr></thead>
      <tbody>{members.map((member, index) => <ScrollReveal as="tr" delay={Math.min(index, 5) * 45} key={member.id}>
        <td data-label="Member"><div className="member-cell"><ImageWithFallback src="/assets/avatar-reader.svg" fallback="/assets/avatar-admin.svg" className={`avatar member-avatar member-avatar-${index % 4}`} alt={`${member.name}'s profile illustration`} /><strong>{member.name}</strong></div></td>
        <td data-label="Member ID"><span className="id-text">{member.memberId || member.id}</span></td><td data-label="Email"><span className="muted-text">{member.email}</span></td><td data-label="Phone"><span className="muted-text">{member.phone}</span></td><td data-label="Member since"><span className="muted-text">{member.membershipDate}</span></td>
        <td data-label="Actions"><div className="row-actions"><button className="icon-button" aria-label={`View ${member.name}`} title="View" onClick={() => onView(member)}><Eye size={16} /></button><button className="icon-button" aria-label={`Edit ${member.name}`} title="Edit" onClick={() => onEdit(member)}><Pencil size={15} /></button><button className="icon-button icon-button-danger" aria-label={`Delete ${member.name}`} title="Delete" onClick={() => onDelete(member)}><Trash2 size={15} /></button></div></td>
      </ScrollReveal>)}</tbody></table></div>
  )
}
