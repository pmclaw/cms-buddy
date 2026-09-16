import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const push = useCallback((message, type = 'info', duration = 2000) => {
    const id = Date.now() + Math.random();
    setItems((arr) => [...arr, { id, message, type }]);
    setTimeout(() => {
      setItems((arr) => arr.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const value = {
    push,
    success: (msg, d) => push(msg, 'success', d),
    error: (msg, d) => push(msg, 'error', d),
    info: (msg, d) => push(msg, 'info', d),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span style={{
              fontSize: 14,
              color: t.type === 'success' ? '#10B981' : t.type === 'error' ? '#DC2626' : '#E89E57'
            }}>
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ⓘ'}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
