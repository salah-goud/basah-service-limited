import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-custom" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="card-modern shadow-xl bg-white text-dark w-100" style={{ maxWidth: '440px' }}>
        <div className="p-4">
          <div className="d-flex align-items-start gap-3">
            <div className={`p-2 rounded-circle ${confirmVariant === 'danger' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning'}`}>
              <AlertTriangle size={24} />
            </div>
            <div className="flex-grow-1">
              <h5 id="modal-title" className="h6 fw-bold mb-1 text-slate-900">
                {title}
              </h5>
              <p className="text-secondary small mb-0">
                {message}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-link text-secondary p-0"
              onClick={onCancel}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-4 py-3 bg-light border-top d-flex justify-content-end gap-2 rounded-bottom-3">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary px-3"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn btn-sm btn-${confirmVariant} px-3 fw-medium`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
