import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const icons = {
  success: <CheckCircle size={18} className="text-emerald-500" />,
  error: <AlertCircle size={18} className="text-rose-500" />,
  warning: <AlertTriangle size={18} className="text-amber-500" />,
  info: <Info size={18} className="text-blue-500" />,
};

const bgColors = {
  success: 'border-emerald-200 bg-emerald-50',
  error: 'border-rose-200 bg-rose-50',
  warning: 'border-amber-200 bg-amber-50',
  info: 'border-blue-200 bg-blue-50',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, variant = 'success', duration = 4000 }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[200] space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-in ${bgColors[t.variant] || bgColors.info}`}
          >
            <span className="mt-0.5 shrink-0">{icons[t.variant] || icons.info}</span>
            <div className="flex-1 min-w-0">
              {t.title && <p className="font-semibold text-slate-800 text-sm">{t.title}</p>}
              {t.description && <p className="text-slate-600 text-xs mt-0.5">{t.description}</p>}
            </div>
            <button onClick={() => dismiss(t.id)} className="shrink-0 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
