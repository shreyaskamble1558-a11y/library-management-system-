import { useNavigate } from 'react-router-dom'
import MemberForm from '../components/MemberForm'
import PageHeading from '../components/PageHeading'
import { useLibrary } from '../context/LibraryContext'

export default function AddMember() {
  const { saveMember } = useLibrary()
  const navigate = useNavigate()
  return <><PageHeading eyebrow="COMMUNITY / NEW MEMBER" title="Add a member" description="Create a library account for a new reader." /><MemberForm onSave={async (member) => { const result = await saveMember(member); if (result.ok) navigate('/members'); return result }} /></>
}
