// [GenAI Use] Prompt: "I need a global toast notification system in React. It should expose a toast function and a dismiss function via context. Toasts auto dismiss after a timeout and stack at the bottom right. Write it with useState, useCallback, and a fixed position container."
// [GenAI Use] LLM Response Start
'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { Toast, type ToastProps } from '../ui/Toast';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastProps['variant'];
  duration?: number;
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { ...item, id }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            id={t.id}
            title={t.title}
            description={t.description}
            variant={t.variant}
            duration={t.duration}
            onDismiss={dismiss}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection: The ID generation using Date.now and Math.random is simple but good enough for UI toasts. I considered UUID but it felt like overkill here. The fixed position div renders outside the normal flow so it floats above page content.
