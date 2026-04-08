export function ConfirmModal({
  title,
  message,
  open,
  onConfirm,
  onCancel,
}: {
  title: string
  message: string
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="row">
          <button className="btn btn-secondary" onClick={onCancel} type="button">
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} type="button">
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

