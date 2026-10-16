import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="toast-container-custom no-print" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => {
          const bgMap = {
            success: 'bg-success text-white',
            danger: 'bg-danger text-white',
            warning: 'bg-warning text-dark',
            info: 'bg-primary text-white'
          };
          return (
            <div
              key={toast.id}
              className={`toast show border-0 shadow-lg ${bgMap[toast.type] || 'bg-dark text-white'}`}
              role="alert"
            >
              <div className="d-flex align-items-center justify-content-between p-3">
                <div className="toast-body p-0 pe-2 small font-medium">
                  {toast.message}
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white ms-auto"
                  aria-label="Close"
                  onClick={() => removeToast(toast.id)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
