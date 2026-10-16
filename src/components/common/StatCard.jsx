import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  variant = 'default',
  isNegative = false
}) {
  const getValueColor = () => {
    switch (variant) {
      case 'success':
        return isNegative ? 'text-danger' : 'text-success';
      case 'danger':
        return 'text-danger';
      case 'primary':
        return 'text-primary';
      default:
        return 'text-dark';
    }
  };

  return (
    <div className="card-modern p-3 h-100">
      <div className="text-secondary small fw-medium">{title}</div>
      <div className="mt-2">
        <div className={`stat-value fw-semibold ${getValueColor()}`}>
          {value}
        </div>
      </div>

      {subtitle && (
        <div className="text-muted small mt-2 text-truncate">
          {subtitle}
        </div>
      )}
    </div>
  );
}
