import { BookOpen, Eye, EyeOff, GraduationCap, KeyRound, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLibrary } from '../context/LibraryContext'
import ImageWithFallback from '../components/ImageWithFallback'

export default function LoginPage() {
  const navigate = useNavigate()
  const { loginAdmin, loginUser } = useLibrary()
  const [role, setRole] = useState('admin')
  const [form, setForm] = useState({ email: '', rollNo: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const changeRole = (nextRole) => {
    setRole(nextRole)
    setErrors({})
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '', form: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (role === 'admin') {
      if (!form.email.trim()) nextErrors.email = 'Email is required.'
      else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) nextErrors.email = 'Please enter a valid email address.'
    } else if (!form.rollNo.trim()) {
      nextErrors.rollNo = 'Roll number is required.'
    }
    if (!form.password) nextErrors.password = 'Password is required.'

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setIsLoading(true)
    const result = role === 'admin'
      ? await loginAdmin(form.email.trim(), form.password)
      : await loginUser(form.rollNo.trim(), form.password)
    setIsLoading(false)

    if (!result.ok) {
      setErrors({ form: result.message })
      return
    }
    navigate(role === 'admin' ? '/dashboard' : '/user/dashboard', { replace: true })
  }

  const filled = role === 'admin' ? form.email || form.password : form.rollNo || form.password

  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-visual" aria-label="Library background image">
          <ImageWithFallback src="/assets/library-interior.jpg" fallback="/assets/library-shelves.jpg" alt="Warm, modern library reading room lined with bookshelves" className="login-visual-image" />
          <div className="login-visual-overlay" />
          <div className="login-branding">
            <div className="login-logo-mark"><BookOpen size={24} /></div>
            <div>
              <div className="login-brand-title">LIBRARY MANAGEMENT SYSTEM</div>
              <div className="login-brand-subtitle">Smart Library Management</div>
            </div>
          </div>
          <div className="login-visual-copy">
            <div className="login-tag">A world of knowledge</div>
            <h1>Every great journey begins with a book.</h1>
            <p>Discover a smarter way to manage your library and make learning accessible to everyone.</p>
          </div>
        </div>

        <div className="login-card-wrap">
          <section className="login-card" aria-labelledby="login-title">
            <div className="login-card-brand">
              <div className="login-card-logo"><BookOpen size={24} /></div>
              <strong>LIBRARY MANAGEMENT<br />SYSTEM</strong>
              <span>Choose your account type to continue</span>
            </div>

            <div className={`login-tabs ${role === 'user' ? 'login-tabs-user' : ''}`} role="tablist" aria-label="Account type">
              <button
                id="admin-tab"
                type="button"
                role="tab"
                aria-selected={role === 'admin'}
                aria-controls="login-panel"
                className={`login-tab ${role === 'admin' ? 'login-tab-active' : ''}`}
                onClick={() => changeRole('admin')}
              >
                <UserRound size={17} /> ADMIN LOGIN
              </button>
              <button
                id="user-tab"
                type="button"
                role="tab"
                aria-selected={role === 'user'}
                aria-controls="login-panel"
                className={`login-tab ${role === 'user' ? 'login-tab-active' : ''}`}
                onClick={() => changeRole('user')}
              >
                <GraduationCap size={19} /> USER LOGIN
              </button>
            </div>

            <div id="login-panel" role="tabpanel" aria-labelledby={`${role}-tab`} key={role} className="login-panel">
              <div className="login-header">
                <div className="login-symbol"><KeyRound size={18} /></div>
                <div className="login-header-copy">
                  <div className="login-kicker">Welcome Back</div>
                  <h2 id="login-title">{role === 'admin' ? 'Admin Login' : 'User Login'}</h2>
                </div>
              </div>

              <form className="login-form" onSubmit={handleSubmit} noValidate>
                {role === 'admin' ? (
                  <div className="login-field">
                    <label htmlFor="login-email">Email</label>
                    <div className={`input-shell ${errors.email ? 'has-error' : ''}`}>
                      <Mail size={18} />
                      <input id="login-email" name="email" type="email" value={form.email} placeholder="Enter admin email" onChange={handleChange} aria-invalid={Boolean(errors.email)} autoComplete="username" />
                    </div>
                    {errors.email && <span className="inline-error" role="alert">{errors.email}</span>}
                  </div>
                ) : (
                  <div className="login-field">
                    <label htmlFor="login-rollno">Roll Number</label>
                    <div className={`input-shell ${errors.rollNo ? 'has-error' : ''}`}>
                      <GraduationCap size={18} />
                      <input id="login-rollno" name="rollNo" type="text" value={form.rollNo} placeholder="Enter Roll Number" onChange={handleChange} aria-invalid={Boolean(errors.rollNo)} autoComplete="username" />
                    </div>
                    {errors.rollNo && <span className="inline-error" role="alert">{errors.rollNo}</span>}
                  </div>
                )}

                <div className="login-field">
                  <label htmlFor="login-password">Password</label>
                  <div className={`input-shell ${errors.password ? 'has-error' : ''}`}>
                    <LockKeyhole size={18} />
                    <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} value={form.password} placeholder="Enter your password" onChange={handleChange} aria-invalid={Boolean(errors.password)} autoComplete="current-password" />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <span className="inline-error" role="alert">{errors.password}</span>}
                </div>

                {errors.form && <div className="login-error" role="alert">{errors.form}</div>}

                <button type="submit" className="login-button" disabled={isLoading}>
                  {isLoading ? <><span className="login-spinner" aria-hidden="true" />Signing in...</> : `LOGIN AS ${role.toUpperCase()}`}
                </button>
              </form>

              <div className="login-footer">
                <div className="login-insight"><span className="login-dot" />Secure {role} access</div>
                <span className="login-hint">{filled ? 'Ready to sign in' : 'Enter your credentials'}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
