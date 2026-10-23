import { useEffect, useState } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import Loading from './components/Loading';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import AddBook from './pages/AddBook';
import EditBook from './pages/EditBook';
import Members from './pages/Members';
import AddMember from './pages/AddMember';
import EditMember from './pages/EditMember';
import IssueBook from './pages/IssueBook';
import Transactions from './pages/Transactions';
import AdminProfile from './pages/AdminProfile';
import Login from './pages/Login';

function ProtectedRoute() {
  const { token, loading } = useAuth();

  if (loading) {
    return <Loading text="Checking session..." />;
  }

  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    window.showToast = (message, type = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3200);
    };
  }, []);

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && <button className="sidebar-scrim" onClick={() => setMenuOpen(false)} aria-label="Close sidebar" />}
      <div className="main-shell">
        <Navbar onMenu={() => setMenuOpen((state) => !state)} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
