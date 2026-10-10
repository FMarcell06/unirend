import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import './Modal.css'

export const Modal = ({ open, onClose, children }) => {
  // Esc-re bezár
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="modal-overlay"
      // mousedown: ha egy mezőben jelölsz ki szöveget és a dobozon kívül engeded el, ne záródjon be
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box" role="dialog" aria-modal="true">
        <button type="button" className="modal-x" onClick={onClose} aria-label="Bezárás">
          ×
        </button>
        {children}
      </div>
    </div>,
    document.body
  )
}