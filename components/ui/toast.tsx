"use client";
import * as React from "react";

interface ToastProps {
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

  const addToast = (toast: ToastProps) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t !== toast)), 4000);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 space-y-2 z-50">
        {toasts.map((t, i) => (
          <div
            key={i}
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
      setToasts((prev) => [...prev, event.detail]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t !== event.detail)), 4000);
    };

    window.addEventListener('toast', handleToast as EventListener);
    return () => window.removeEventListener('toast', handleToast as EventListener);
  }, []);

  return (
    <div className="fixed top-5 right-5 space-y-2 z-50">
      {toasts.map((t, i) => (
        <div
          key={i}
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