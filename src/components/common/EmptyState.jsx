import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'No records found',
  description = 'There are no items matching the selected filters or search query.',
  icon: Icon = Inbox,
  actionText,
  onAction
}) {
  return (
    <div className="card-modern text-center p-5 my-3">
      <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle bg-light text-secondary mb-3 mx-auto">
        <Icon size={32} />
      </div>
      <h6 className="fw-semibold text-slate-800 mb-1">{title}</h6>
      <p className="text-secondary small mb-3 mx-auto" style={{ maxWidth: '420px' }}>
        {description}
      </p>
      {actionText && onAction && (
        <div>
          <button type="button" className="btn btn-sm btn-primary px-3" onClick={onAction}>
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
}
