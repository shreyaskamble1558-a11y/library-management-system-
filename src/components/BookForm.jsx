import { useState } from 'react'
import { ArrowLeft, BookOpen, Check } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function BookForm({ initialValues, onSave, mode = 'add' }) {
  const [values, setValues] = useState(initialValues || { title: '', author: '', category: '', isbn: '', quantity: 1, availableQuantity: 1, publishedYear: '', description: '', coverImage: '' })
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const update = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    if (isSaving) return
    const quantity = Number(values.quantity)
    const availableQuantity = Number(values.availableQuantity)
    if (!values.title.trim() || !values.author.trim() || !values.category.trim() || !values.isbn.trim()) return setError('Complete each required field before saving.')
    if (!Number.isInteger(quantity) || quantity < 1) return setError('Quantity must be at least 1.')
    if (!Number.isInteger(availableQuantity) || availableQuantity < 0 || availableQuantity > quantity) return setError('Available quantity must be between 0 and total quantity.')
    setError('')
    setIsSaving(true)
    try {
      const result = await onSave({ ...values, title: values.title.trim(), author: values.author.trim(), category: values.category.trim(), isbn: values.isbn.trim(), quantity, availableQuantity })
      if (result && !result.ok) setError(result.message)
    } catch (saveError) {
      setError(saveError.message || 'The book could not be saved. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }
  return (
    <form className="form-panel" onSubmit={submit} noValidate>
      <div className="form-panel-heading"><span className="form-icon"><BookOpen size={18} /></span><div><h2>Book information</h2><p>Fields marked with <b>*</b> are required.</p></div></div>
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="form-grid">
        <label className="field field-span-2"><span>Book title <b>*</b></span><input name="title" value={values.title} onChange={update} placeholder="e.g. The Design of Everyday Things" required autoFocus /></label>
        <label className="field"><span>Author <b>*</b></span><input name="author" value={values.author} onChange={update} placeholder="Author name" required /></label>
        <label className="field"><span>Category <b>*</b></span><input name="category" value={values.category} onChange={update} placeholder="e.g. Fiction, Science" required /></label>
        <label className="field field-span-2"><span>ISBN <b>*</b></span><input name="isbn" value={values.isbn} onChange={update} placeholder="ISBN-13" required inputMode="numeric" /></label>
        <label className="field"><span>Total quantity <b>*</b></span><input type="number" name="quantity" value={values.quantity} onChange={update} min="1" step="1" required /></label>
        <label className="field"><span>Available quantity <b>*</b></span><input type="number" name="availableQuantity" value={values.availableQuantity} onChange={update} min="0" max={values.quantity || undefined} step="1" required /></label>
        <label className="field"><span>Published year</span><input type="number" name="publishedYear" value={values.publishedYear || ''} onChange={update} min="1900" max={new Date().getFullYear()} placeholder="e.g. 2024" /></label>
        <label className="field"><span>Cover image URL</span><input type="url" name="coverImage" value={values.coverImage || ''} onChange={update} placeholder="https://example.com/cover.jpg" /></label>
        <label className="field field-span-2"><span>Description</span><textarea name="description" value={values.description || ''} onChange={update} placeholder="Brief description of the book" rows="3" /></label>
      </div>
      <div className="form-footer"><Link to="/books" className="button button-quiet"><ArrowLeft size={16} /> Cancel</Link><button className="button button-primary" type="submit" disabled={isSaving}>{isSaving ? <span className="button-spinner" aria-hidden="true" /> : <Check size={16} />}{isSaving ? (mode === 'edit' ? 'Saving changes...' : 'Adding book...') : (mode === 'edit' ? 'Save changes' : 'Save book')}</button></div>
    </form>
  )
}
