import React from 'react';
import { useToastStore } from '../../store/toastStore';
import { CheckCircle, Info, XCircle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-4 sm:right-6 z-[200] flex flex-col gap-2.5 pointer-events-none select-none w-full max-w-xs sm:max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 px-4 py-3 bg-neutral-900/95 border border-white/10 backdrop-blur-md rounded-2xl shadow-2xl shadow-black/50 text-neutral-100 text-xs font-semibold tracking-wide animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-auto"
        >
          {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}
          
          <span className="truncate flex-1">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};
