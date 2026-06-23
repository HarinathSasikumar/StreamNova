'use client';
import { useApp } from '@/context/AppContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  const icons = { success: '', error: '', info: '', warning: '' };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast ${toast.type || 'info'}`}>
          <span className={`toast-icon ${toast.type || 'info'}`}>
            {icons[toast.type] || ''}
          </span>
          <div className="toast-content">
            {toast.title && <div className="toast-title">{toast.title}</div>}
            <div className="toast-msg">{toast.message}</div>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{ color: 'var(--text-muted)', fontSize: '1.1rem', padding: '0 4px', marginLeft: 'auto' }}
          >×</button>
        </div>
      ))}
    </div>
  );
}
