import { NavLink } from 'react-router-dom'
import { ArrowUpRight, BookCopy, BookOpen, CircleUserRound, LayoutDashboard, LogOut, Repeat2, ShieldCheck, X } from 'lucide-react'
import { useLibrary } from '../context/LibraryContext'
import ProfileAvatar from './ProfileAvatar'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/books', label: 'Books', icon: BookOpen },
  { to: '/members', label: 'Members', icon: CircleUserRound },
  { to: '/issue-book', label: 'Issue Book', icon: BookCopy },
  { to: '/transactions', label: 'Transactions', icon: Repeat2 },
  { to: '/admin/profile', label: 'Admin', icon: ShieldCheck },
]

export default function Sidebar({ open, onClose }) {
  const { logout, user } = useLibrary()
  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand-lockup">
        <div className="brand-mark"><BookOpen size={21} strokeWidth={2.2} /></div>
        <div><strong>LIBRARY SYSTEM</strong></div>
        <button className="icon-button sidebar-close" aria-label="Close menu" onClick={onClose}><X size={19} /></button>
      </div>
      <div className="sidebar-section-label">WORKSPACE</div>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
            <Icon size={18} strokeWidth={1.9} /><span>{label}</span>
            {label === 'Issue Book' && <ArrowUpRight size={14} className="nav-end-icon" />}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-note"><span className="online-dot" /> Library desk is open <strong>Today, 9:00 AM – 6:00 PM</strong></div>
        <div className="sidebar-profile"><ProfileAvatar kind="admin" alt={`${user?.name || 'Administrator'} profile illustration`} className="avatar avatar-librarian" /><div><strong>{user?.name || 'Library Admin'}</strong><small>Administrator</small></div><button type="button" className="sidebar-logout" onClick={logout} aria-label="Logout"><LogOut size={14} /></button></div>
      </div>
    </aside>
  )
}
