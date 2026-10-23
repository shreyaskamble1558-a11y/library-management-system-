import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AdminProfile() {
  const { admin, logout } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (admin) {
      setProfile({ name: admin.name, email: admin.email });
    }
  }, [admin]);

  const handleProfileChange = async (event) => {
    event.preventDefault();
    try {
      const response = await api.put('/auth/profile', profile);
      setMessage(response.data.message || 'Profile updated successfully');
      if (window.showToast) window.showToast('Profile updated successfully', 'success');
      setError('');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update profile');
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    try {
      const response = await api.put('/auth/change-password', passwords);
      setMessage(response.data.message || 'Password changed successfully');
      if (window.showToast) window.showToast('Password changed successfully', 'success');
      setError('');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to change password');
    }
  };

  return (
    <div className="page-stack">
      <div className="profile-shell">
        <div className="panel profile-card">
          <div className="profile-card__header">
            <div className="avatar-large">{admin?.name?.[0] || 'A'}</div>
            <div>
              <h3>{admin?.name || 'Library Admin'}</h3>
              <p>{admin?.email || 'admin@library.com'}</p>
            </div>
          </div>
          <ul className="profile-list">
            <li><span>Role</span><strong>{admin?.role || 'admin'}</strong></li>
            <li><span>Created</span><strong>{admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '—'}</strong></li>
          </ul>
          <button type="button" className="btn btn-danger btn-block" onClick={logout}>Logout</button>
        </div>

        <div className="panel form-panel">
          <div className="panel__header"><h3>Edit Profile</h3></div>
          <form className="form-grid" onSubmit={handleProfileChange}>
            <label className="field"><span>Name</span><input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required /></label>
            <label className="field"><span>Email</span><input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required /></label>
            <div className="form-actions field field--full"><button type="submit" className="btn btn-primary">Update Profile</button></div>
          </form>
        </div>

        <div className="panel form-panel">
          <div className="panel__header"><h3>Change Password</h3></div>
          <form className="form-grid" onSubmit={handlePasswordChange}>
            <label className="field"><span>Current Password</span><input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required /></label>
            <label className="field"><span>New Password</span><input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required /></label>
            <label className="field"><span>Confirm New Password</span><input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} required /></label>
            <div className="form-actions field field--full"><button type="submit" className="btn btn-primary">Change Password</button></div>
          </form>
        </div>
      </div>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}
    </div>
  );
}
