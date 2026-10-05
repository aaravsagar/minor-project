import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration || 5000),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none'
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: `1px solid ${
                t.type === 'success' ? '#B4E0C0' :
                t.type === 'error' ? '#FECDCA' :
                t.type === 'warning' ? '#FADCB3' : '#BCD0EE'
              }`,
              borderLeft: `4px solid ${
                t.type === 'success' ? '#287D3C' :
                t.type === 'error' ? '#B42318' :
                t.type === 'warning' ? '#A15C00' : '#2457A6'
              }`,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              fontSize: '13.5px',
              color: '#1F2933',
              lineHeight: 1.4
            }}
          >
            <div style={{ flexShrink: 0, marginTop: '1px' }}>
              {t.type === 'success' && <CheckCircle2 size={18} color="#287D3C" />}
              {t.type === 'error' && <AlertCircle size={18} color="#B42318" />}
              {t.type === 'warning' && <AlertTriangle size={18} color="#A15C00" />}
              {t.type === 'info' && <Info size={18} color="#2457A6" />}
            </div>
            <div style={{ flex: 1 }}>{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#667085',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Close"
            >
              <X size={14} />
            </button>
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
