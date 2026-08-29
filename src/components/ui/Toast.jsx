"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { CheckCircleIcon, WarningCircleIcon, XIcon } from "@phosphor-icons/react";
import { useRevealOnMount } from "@/hooks/useRevealOnMount";
import { uid } from "@/utils/uid";

const ToastContext = createContext(null);

/**
 * Avisos efímeros. Existen sobre todo para que un error de red deje de ser un
 * console.error invisible: si algo no se guardó, tienes que enterarte.
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast debe usarse dentro de <ToastProvider>");
  }
  return ctx;
}

const VARIANTS = {
  error: {
    Icon: WarningCircleIcon,
    className: "border-destructive/30 text-destructive",
  },
  success: {
    Icon: CheckCircleIcon,
    className: "border-border text-foreground",
  },
};

function Toast({ toast, onDismiss }) {
  const revealRef = useRevealOnMount();
  const { Icon, className } = VARIANTS[toast.variant] ?? VARIANTS.error;

  return (
    <div
      ref={revealRef}
      role="status"
      aria-live="polite"
      className={`pointer-events-auto w-full max-w-md flex items-start gap-2.5 bg-card border rounded-md px-3.5 py-3 shadow-lg shadow-black/10 ${className}`}
    >
      <Icon size={18} weight="fill" className="shrink-0 mt-px" />
      <p className="flex-1 text-sm font-medium leading-snug text-foreground">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="p-0.5 rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
        aria-label="Cerrar aviso"
      >
        <XIcon size={14} weight="bold" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message, variant = "error") => {
      const id = uid();
      setToasts((prev) => [...prev, { id, message, variant }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), variant === "error" ? 6000 : 3500),
      );
      return id;
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      show,
      dismiss,
      error: (message) => show(message, "error"),
      success: (message) => show(message, "success"),
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-200 flex flex-col items-center gap-2 px-3 pb-24 sm:pb-6 pointer-events-none">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
