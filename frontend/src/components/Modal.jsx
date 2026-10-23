export default function Modal({ isOpen, title, children, onClose, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3>{title}</h3>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close dialog">×</button>
        </div>
        <div className="modal__body">{children}</div>
        <div className="modal__actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>{cancelText}</button>
          {onConfirm && (
            <button type="button" className="btn btn-primary" onClick={onConfirm}>{confirmText}</button>
          )}
        </div>
      </div>
    </div>
  );
}
