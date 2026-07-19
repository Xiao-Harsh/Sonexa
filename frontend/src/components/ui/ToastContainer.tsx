import React from 'react';
import { useToastStore } from '../../store/toastStore';
import { CheckCircle, Info, XCircle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 pointer-events-none select-none w-full max-w-sm px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 px-5 py-3.5 bg-neutral-900/90 border border-neutral-800/85 backdrop-blur-md rounded-full shadow-2xl shadow-black/40 text-neutral-100 text-sm font-semibold tracking-wide animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
        >
          {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}
          
          <span className="truncate flex-1 text-center sm:text-left">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};
