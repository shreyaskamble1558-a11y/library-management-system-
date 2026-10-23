import { useEffect, useState } from 'react';
import { ArrowLeftRight, BookOpen, LibraryBig, UserRound, WalletCards, Clock3, CircleArrowUp, NotebookPen } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/recent-transactions'),
        ]);

        setStats(statsRes.data.stats);
        setRecentTransactions(recentRes.data.transactions || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !stats) {
    return <Loading text="Loading dashboard..." />;
  }

  const statItems = [
    { title: 'Total Books', value: stats.totalBooks, icon: <LibraryBig size={18} />, accent: 'rgba(59,130,246,.12)' },
    { title: 'Available Books', value: stats.availableBooks, icon: <BookOpen size={18} />, accent: 'rgba(16,185,129,.12)' },
    { title: 'Issued Books', value: stats.issuedBooks, icon: <NotebookPen size={18} />, accent: 'rgba(245,158,11,.12)' },
    { title: 'Total Members', value: stats.totalMembers, icon: <UserRound size={18} />, accent: 'rgba(168,85,247,.12)' },
    { title: 'Active Members', value: stats.activeMembers, icon: <UserRound size={18} />, accent: 'rgba(14,165,233,.12)' },
    { title: 'Returned Books', value: stats.returnedBooks, icon: <WalletCards size={18} />, accent: 'rgba(34,197,94,.12)' },
    { title: 'Overdue Books', value: stats.overdueBooks, icon: <Clock3 size={18} />, accent: 'rgba(239,68,68,.12)' },
  ];

  return (
    <div className="page-stack">
      <section className="welcome-panel">
        <div>
          <p className="eyebrow">Operations</p>
          <h1>Welcome back</h1>
        </div>
        <div className="welcome-panel__actions">
          <Link to="/books/add" className="btn btn-primary">Add Book</Link>
          <Link to="/members/add" className="btn btn-secondary">Add Member</Link>
        </div>
      </section>

      <section className="stat-grid">
        {statItems.map((item) => (
          <StatCard key={item.title} title={item.title} value={item.value} icon={item.icon} accent={item.accent} />
        ))}
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel__header">
            <h3>Recent Transactions</h3>
            <Link to="/transactions">View all</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Book</th>
                  <th>Member</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length ? recentTransactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{transaction.transactionId}</td>
                    <td>{transaction.book?.title || 'Unknown'}</td>
                    <td>{transaction.member?.name || 'Unknown'}</td>
                    <td><span className={`badge badge--${transaction.status.toLowerCase()}`}>{transaction.status}</span></td>
                  </tr>
                )) : <tr><td colSpan="4">No recent transactions</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel__header">
            <h3>Quick Actions</h3>
          </div>
          <div className="quick-actions">
            <Link to="/books/add" className="quick-action"><CircleArrowUp size={18} /> Add Book</Link>
            <Link to="/members/add" className="quick-action"><UserRound size={18} /> Add Member</Link>
            <Link to="/issue-book" className="quick-action"><ArrowLeftRight size={18} /> Issue Book</Link>
            <Link to="/transactions" className="quick-action"><WalletCards size={18} /> View Transactions</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
