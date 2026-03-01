"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";

type ToastType = "success" | "error";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_TIMEOUT_MS = 3200;

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (type: ToastType, message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      window.setTimeout(() => removeToast(id), TOAST_TIMEOUT_MS);
    },
    [removeToast]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message: string) => pushToast("success", message),
      error: (message: string) => pushToast("error", message),
    }),
    [pushToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2 rounded-xl border px-3 py-2.5 shadow-xl backdrop-blur ${
              toast.type === "success"
                ? "border-emerald-300/50 bg-emerald-950/90 text-emerald-100"
                : "border-rose-300/50 bg-rose-950/90 text-rose-100"
            }`}
            role="status"
            aria-live="polite"
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            ) : (
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
            )}
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
