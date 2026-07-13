import React from 'react';
import { Toast, ToastProps } from './components/feedback/Toast';

type ToastInput = Omit<ToastProps, 'onClose'>;
interface ToastEntry extends ToastInput {
  id: number;
}

interface ToastContextValue {
  showToast: (toast: ToastInput) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastEntry[]>([]);
  const nextId = React.useRef(0);

  const showToast = React.useCallback((toast: ToastInput) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { ...toast, id }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 100 }}>
        {toasts.map((t) => (
          <Toast key={t.id} tone={t.tone} title={t.title} description={t.description} onClose={() => setToasts((cur) => cur.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
