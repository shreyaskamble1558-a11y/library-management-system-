import { Bell, ChevronDown, ChevronRight, Menu, Search, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useLibrary } from '../context/LibraryContext'
import ProfileAvatar from './ProfileAvatar'

function getPage(path) {
  if (path.startsWith('/admin/profile')) return ['Admin profile', 'Account']
  if (path.startsWith('/books/add')) return ['Add book', 'Books']
  if (path.startsWith('/books/edit')) return ['Edit book', 'Books']
  if (path.startsWith('/books')) return ['Books', 'Collection']
  if (path.startsWith('/members/add')) return ['Add member', 'Members']
  if (path.startsWith('/members/edit')) return ['Edit member', 'Members']
  if (path.startsWith('/members')) return ['Members', 'Directory']
  if (path.startsWith('/issue-book')) return ['Issue a book', 'Circulation']
  if (path.startsWith('/transactions')) return ['Transactions', 'Circulation']
  return ['Dashboard', 'Overview']
}

export default function Navbar({ onMenu, sidebarOpen = false }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { transactions, logout, user } = useLibrary()
  const [title, section] = getPage(location.pathname)
  const activeLoans = transactions.filter((item) => item.status === 'Issued').length

  return (
    <header className="topbar">
      <div className="topbar-leading">
        <button className={`icon-button mobile-menu-button ${sidebarOpen ? 'mobile-menu-open' : ''}`} aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={sidebarOpen} onClick={onMenu}>{sidebarOpen ? <X size={20} /> : <Menu size={20} />}</button>
        <div className="breadcrumbs"><span>{section}</span><ChevronRight size={14} /><strong>{title}</strong></div>
      </div>
      <div className="topbar-actions">
        <Link to="/books" className="topbar-search"><Search size={16} /><span>Find a book or member</span><kbd>⌘ K</kbd></Link>
        <button className="icon-button notification-button" aria-label={`${activeLoans} active loans`} title={`${activeLoans} active loans`}><Bell size={19} />{activeLoans > 0 && <span className="notification-dot" />}</button>

        <div className="profile-wrap">
          <button type="button" className="profile-trigger" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Toggle admin menu">
            <ProfileAvatar kind="admin" alt={`${user?.name || 'Administrator'} profile illustration`} className="topbar-avatar" />
            <span>{user?.name || 'Admin'}</span>
            <ChevronDown size={16} />
          </button>

          {menuOpen && (
            <div className="profile-menu-panel">
              <Link to="/admin/profile" className="profile-menu-item" onClick={() => setMenuOpen(false)}><span>Admin Profile</span></Link>
              <button type="button" className="profile-menu-item danger" onClick={() => { setMenuOpen(false); logout() }}><span>Logout</span></button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
