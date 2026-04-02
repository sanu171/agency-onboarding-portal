import { createContext, useContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000); // Remove after 4 seconds
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type} flex items-center justify-between`}>
            <span className="flex items-center gap-3">
              {t.type === 'success' ? <span className="text-green-400">●</span> : <span className="text-red-400">●</span>} 
              {t.message}
            </span>
            <button aria-label="Dismiss toast" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
              <X size={16}/>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
