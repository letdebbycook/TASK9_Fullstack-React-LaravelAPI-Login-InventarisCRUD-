import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type, message, title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    const newToast = { id, type, message, title };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss
    setTimeout(() => {
      removeToast(id);
    }, 4500);

    return id;
  }, [removeToast]);

  const toast = {
    success: (msg, title = 'Berhasil') => showToast('success', msg, title),
    error: (msg, title = 'Peringatan / Error') => showToast('error', msg, title),
    warning: (msg, title = 'Perhatian') => showToast('warning', msg, title),
    info: (msg, title = 'Informasi') => showToast('info', msg, title),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="toast-container" aria-live="polite" aria-label="Notifikasi Sistem">
        {toasts.map((item) => (
          <div key={item.id} className={`toast-item toast-${item.type} animate-slide-in`}>
            <div className="toast-icon">
              {item.type === 'success' && <CheckCircle2 size={20} />}
              {item.type === 'error' && <AlertCircle size={20} />}
              {item.type === 'warning' && <AlertTriangle size={20} />}
              {item.type === 'info' && <Info size={20} />}
            </div>
            <div className="toast-content">
              {item.title && <div className="toast-title">{item.title}</div>}
              <div className="toast-message">{item.message}</div>
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(item.id)}
              aria-label="Tutup notifikasi"
            >
              <X size={16} />
            </button>
            <div className="toast-progress-bar" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
