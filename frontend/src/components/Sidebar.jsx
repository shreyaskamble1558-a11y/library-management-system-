import { House, BookOpen, Users, NotebookPen, ArrowLeftRight, ShieldCheck, Menu } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { icon: House, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Books', path: '/books' },
  { icon: Users, label: 'Members', path: '/members' },
  { icon: NotebookPen, label: 'Issue Book', path: '/issue-book' },
  { icon: ArrowLeftRight, label: 'Transactions', path: '/transactions' },
];

export default function Sidebar({ open, onClose, onToggle }) {
  return (
    <>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar__brand">
          <div className="brand-mark"><BookOpen size={18} /></div>
          <div>
            <span>LIBRARY</span>
            <strong>MANAGEMENT</strong>
          </div>
          {onToggle && <button className="mobile-close" onClick={onClose} aria-label="Close sidebar"><Menu size={18} /></button>}
        </div>

        <nav className="sidebar__nav">
          {items.map(({ icon: Icon, label, path }) => (
            <NavLink key={path} to={path} end={path === '/dashboard'} onClick={onClose} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="sidebar__divider" />
          <NavLink to="/admin/profile" onClick={onClose} className={({ isActive }) => `nav-item admin-item ${isActive ? 'active' : ''}`}>
            <ShieldCheck size={16} />
            <span>Admin</span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
}
