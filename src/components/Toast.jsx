import { CircleCheck, CircleX, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Toast({ toast, onDismiss }) {
  const [displayedToast, setDisplayedToast] = useState(toast)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    if (toast) {
      setDisplayedToast(toast)
      setIsLeaving(false)
      return undefined
    }

    if (!displayedToast) return undefined

    setIsLeaving(true)
    const timeout = window.setTimeout(() => {
      setDisplayedToast(null)
      setIsLeaving(false)
    }, 220)
    return () => window.clearTimeout(timeout)
  }, [toast, displayedToast])

  if (!displayedToast) return null
  const Icon = displayedToast.type === 'error' ? CircleX : CircleCheck
  return <div key={displayedToast.id} className={`toast toast-${displayedToast.type} ${isLeaving ? 'toast-exit' : ''}`} role="status"><Icon size={19} /><span>{displayedToast.message}</span><button className="toast-dismiss" aria-label="Dismiss notification" onClick={onDismiss}><X size={15} /></button></div>
}
