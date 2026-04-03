"use client";
import * as React from "react";

interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  type?: "success" | "error" | "info";
}

interface ToastContextProps {
  addToast: (toast: ToastProps) => void;
}

const ToastContext = React.createContext<ToastContextProps | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const addToast = React.useCallback((toast: ToastProps) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toastWithId = { ...toast, id };
    
    setToasts((prev) => [...prev, toastWithId]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 space-y-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              p-4 rounded shadow-md text-white
              ${t.type === "success" ? "bg-green-500" : ""}
              ${t.type === "error" ? "bg-red-500" : ""}
              ${t.type === "info" ? "bg-blue-500" : ""}
                `}
          >
            <div className="font-semibold">{t.title}</div>
            {t.description && <div className="text-sm">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  React.useEffect(() => {
    const handleToast = (event: CustomEvent<ToastProps>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const toastWithId = { ...event.detail, id };
      
      setToasts((prev) => [...prev, toastWithId]);
      
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    window.addEventListener('toast', handleToast as EventListener);
    return () => window.removeEventListener('toast', handleToast as EventListener);
  }, []);

  return (
    <div className="fixed top-5 right-5 space-y-2 z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            p-4 rounded shadow-md text-white
            ${t.type === "success" ? "bg-green-500" : ""}
            ${t.type === "error" ? "bg-red-500" : ""}
            ${t.type === "info" ? "bg-blue-500" : ""}
              `}
        >
          <div className="font-semibold">{t.title}</div>
          {t.description && <div className="text-sm">{t.description}</div>}
        </div>
      ))}
    </div>
  );
}