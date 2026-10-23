import { useState } from 'react'
import { ArrowLeft, Check, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { currentDate } from '../utils/storage'

export default function MemberForm({ initialValues, onSave, mode = 'add' }) {
  const [values, setValues] = useState(initialValues || { memberId: '', name: '', email: '', phone: '', address: '', course: '', year: '', department: '', password: '', membershipDate: currentDate() })
  const [error, setError] = useState('')
  const update = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    if (!values.memberId.trim() || !values.name.trim() || !values.email.trim() || !values.phone.trim() || !values.address.trim() || !values.membershipDate) return setError('Complete each required field before saving.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return setError('Enter a valid email address.')
    if (mode === 'add' && values.password.length < 8) return setError('Set a user password with at least 8 characters.')
    if (values.password && values.password.length < 8) return setError('Password must be at least 8 characters.')
    setError('')
    const result = await onSave({ ...values, memberId: values.memberId.trim().toUpperCase(), name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim(), address: values.address.trim() })
    if (result && !result.ok) setError(result.message)
  }
  return (
    <form className="form-panel" onSubmit={submit} noValidate>
      <div className="form-panel-heading"><span className="form-icon"><UserRound size={18} /></span><div><h2>Member information</h2><p>Fields marked with <b>*</b> are required.</p></div></div>
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="form-grid">
        <label className="field field-span-2"><span>Roll number <b>*</b></span><input name="memberId" value={values.memberId || ''} onChange={update} placeholder="e.g. BCS2026001" required autoComplete="off" /></label>
        <label className="field field-span-2"><span>Full name <b>*</b></span><input name="name" value={values.name} onChange={update} placeholder="First and last name" required autoFocus /></label>
        <label className="field field-span-2"><span>Email address <b>*</b></span><input type="email" name="email" value={values.email} onChange={update} placeholder="name@campus.edu" required /></label>
        <label className="field"><span>Phone number <b>*</b></span><input type="tel" name="phone" value={values.phone} onChange={update} placeholder="+1 415 555 0100" required /></label>
        <label className="field"><span>Membership date <b>*</b></span><input type="date" name="membershipDate" value={values.membershipDate} onChange={update} required /></label>
        <label className="field field-span-2"><span>Address <b>*</b></span><input name="address" value={values.address || ''} onChange={update} placeholder="Street, city, postal code" required /></label>
        <label className="field"><span>Course</span><input name="course" value={values.course || ''} onChange={update} placeholder="e.g. B.Sc. Computer Science" /></label>
        <label className="field"><span>Year</span><input name="year" value={values.year || ''} onChange={update} placeholder="e.g. FY" /></label>
        <label className="field field-span-2"><span>Department</span><input name="department" value={values.department || ''} onChange={update} placeholder="e.g. Computer Science" /></label>
        <label className="field field-span-2"><span>{mode === 'edit' ? 'Reset user password' : 'User login password'}{mode === 'add' && <> <b>*</b></>}</span><input type="password" name="password" value={values.password || ''} onChange={update} placeholder={mode === 'edit' ? 'Leave blank to keep current password' : 'At least 8 characters'} autoComplete="new-password" required={mode === 'add'} minLength={8} /></label>
      </div>
      <div className="form-footer"><Link to="/members" className="button button-quiet"><ArrowLeft size={16} /> Cancel</Link><button className="button button-primary" type="submit"><Check size={16} />{mode === 'edit' ? 'Save changes' : 'Save member'}</button></div>
    </form>
  )
}
