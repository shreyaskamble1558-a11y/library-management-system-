import { KeyRound, LogOut, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageHeading from '../components/PageHeading'
import { useLibrary } from '../context/LibraryContext'
import ProfileAvatar from '../components/ProfileAvatar'
import ScrollReveal from '../components/ScrollReveal'

export default function AdminProfile() {
  const { user, logout } = useLibrary()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <PageHeading eyebrow="ACCOUNT" title="Admin profile" description="Your administrator account details and secure access." />
      <ScrollReveal as="section" className="profile-card">
        <ProfileAvatar kind="admin" alt="Library administrator profile illustration" className="profile-card-avatar" />
        <div className="profile-card-identity"><span>LIBRARY ADMINISTRATOR</span><h2>{user?.name}</h2><p>{user?.email}</p></div>
        <span className="profile-role-badge"><ShieldCheck size={14} /> Administrator</span>
        <div className="profile-card-footer"><span><KeyRound size={15} /> Admin-only access to library operations</span><button type="button" className="button button-quiet" onClick={handleLogout}><LogOut size={15} /> Sign out</button></div>
      </ScrollReveal>
    </>
  )
}
