import { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: 'admin@library.com', password: 'Admin@123' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-panel__art">
          <div className="login-panel__badge">Admin Panel</div>
          <h1>Library Management System</h1>
          <p>Manage books, members, issues, returns, and staff operations from a single dashboard.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form__header">
            <div className="icon-wrap"><LockKeyhole size={22} /></div>
            <h2>Welcome back</h2>
            <p>Sign in to continue</p>
          </div>

          <label className="field">
            <span>Email</span>
            <div className="input-with-icon">
              <Mail size={16} />
              <input type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" required />
            </div>
          </label>

          <label className="field">
            <span>Password</span>
            <div className="input-with-icon">
              <LockKeyhole size={16} />
              <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} autoComplete="current-password" required />
              <button type="button" className="eye-btn" onClick={() => setShowPassword((prev) => !prev)} aria-label="Toggle password visibility">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {error && <div className="alert alert-error">{error}</div>}

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        </form>
      </div>
    </div>
  );
}
