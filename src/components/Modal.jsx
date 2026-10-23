import { AlertTriangle, X } from 'lucide-react'

export default function Modal({ title, children, onClose, onConfirm, confirmLabel = 'Confirm', danger = false }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="icon-button modal-close" aria-label="Close dialog" onClick={onClose}><X size={18} /></button>
        <div className={`modal-icon ${danger ? 'modal-icon-danger' : ''}`}><AlertTriangle size={20} /></div>
        <h2 id="modal-title">{title}</h2>
        <div className="modal-body">{children}</div>
        <div className="modal-actions"><button className="button button-quiet" onClick={onClose}>Cancel</button>{onConfirm && <button className={`button ${danger ? 'button-danger' : 'button-primary'}`} onClick={onConfirm}>{confirmLabel}</button>}</div>
      </section>
    </div>
  )
}
