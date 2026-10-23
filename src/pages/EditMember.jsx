import { Link, useNavigate, useParams } from 'react-router-dom'
import MemberForm from '../components/MemberForm'
import PageHeading from '../components/PageHeading'
import { useLibrary } from '../context/LibraryContext'

export default function EditMember() {
  const { id } = useParams()
  const { members, saveMember } = useLibrary()
  const navigate = useNavigate()
  const member = members.find((item) => item.id === id)
  if (!member) return <div className="not-found"><h1>Member not found</h1><p>This profile may have been removed from the directory.</p><Link to="/members" className="button button-primary">Back to members</Link></div>
  return <><PageHeading eyebrow={`COMMUNITY / ${member.id}`} title="Edit member" description="Keep this reader's contact information up to date." /><MemberForm mode="edit" initialValues={member} onSave={async (updated) => { const result = await saveMember(updated); if (result.ok) navigate('/members'); return result }} /></>
}
