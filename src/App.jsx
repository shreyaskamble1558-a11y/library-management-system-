import { useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import Dashboard from './pages/Dashboard'
import Books from './pages/Books'
import AddBook from './pages/AddBook'
import EditBook from './pages/EditBook'
import Members from './pages/Members'
import AddMember from './pages/AddMember'
import EditMember from './pages/EditMember'
import IssueBook from './pages/IssueBook'
import Transactions from './pages/Transactions'
import LoginPage from './pages/Login'
import UserDashboard from './pages/UserDashboard'
import AdminProfile from './pages/AdminProfile'
import { useLibrary } from './context/LibraryContext'

function RequireAuth({ children, role }) {
  const { isAuthenticated, role: currentRole } = useLibrary()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (currentRole !== role) return <Navigate to={currentRole === 'user' ? '/user/dashboard' : '/dashboard'} replace />
  return children
}

function RedirectIfAuthenticated({ children }) {
  const { isAuthenticated, role } = useLibrary()
  if (isAuthenticated) return <Navigate to={role === 'user' ? '/user/dashboard' : '/dashboard'} replace />
  return children
}

function HomeRedirect() {
  const { isAuthenticated, role } = useLibrary()
  return <Navigate to={!isAuthenticated ? '/login' : role === 'user' ? '/user/dashboard' : '/dashboard'} replace />
}

function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { toast, dismissToast } = useLibrary()

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <div className="main-shell">
        <Navbar sidebarOpen={menuOpen} onMenu={() => setMenuOpen((open) => !open)} />
        <main className="page-content" key={location.pathname}>
          <Outlet />
        </main>
        <footer className="app-footer"><span><BookOpen size={14} /> Campus Library</span><span>Library Management System <i>·</i> 2026</span></footer>
      </div>
      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>} />

      <Route element={<RequireAuth role="admin"><AppLayout /></RequireAuth>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/books" element={<Books />} />
        <Route path="/books/add" element={<AddBook />} />
        <Route path="/books/edit/:id" element={<EditBook />} />
        <Route path="/members" element={<Members />} />
        <Route path="/members/add" element={<AddMember />} />
        <Route path="/members/edit/:id" element={<EditMember />} />
        <Route path="/issue-book" element={<IssueBook />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
      </Route>

      <Route path="/user/dashboard" element={<RequireAuth role="user"><UserDashboard /></RequireAuth>} />
      <Route path="/user/my-books" element={<RequireAuth role="user"><UserDashboard /></RequireAuth>} />
      <Route path="/user/history" element={<RequireAuth role="user"><UserDashboard /></RequireAuth>} />
      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}
