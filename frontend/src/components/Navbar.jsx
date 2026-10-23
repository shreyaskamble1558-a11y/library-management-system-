import { Bell, ChevronDown, LogOut, UserRound } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/books': 'Books',
  '/books/add': 'Add Book',
  '/members': 'Members',
  '/members/add': 'Add Member',
  '/issue-book': 'Issue Book',
  '/transactions': 'Transactions',
  '/admin/profile': 'Admin Profile',
};

export default function Navbar({ onMenu }) {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const title = routeTitles[location.pathname] || 'Library Admin';

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="menu-btn" type="button" aria-label="Toggle menu" onClick={onMenu}>☰</button>
        <div>
          <p className="eyebrow">Overview</p>
          <h2>{title}</h2>
        </div>
      </div>

      <div className="topbar__right">
        <button className="icon-button" type="button" aria-label="Notifications"><Bell size={16} /></button>
        <div className="admin-chip">
          <div className="avatar-circle">{admin?.name?.[0] || 'A'}</div>
          <div className="admin-meta">
            <strong>{admin?.name || 'Admin'}</strong>
            <span>{admin?.role || 'admin'}</span>
          </div>
          <div className="admin-menu">
            <Link to="/admin/profile"><UserRound size={14} /> Profile</Link>
            <button type="button" onClick={logout}><LogOut size={14} /> Logout</button>
          </div>
          <ChevronDown size={14} />
        </div>
      </div>
    </header>
  );
}
