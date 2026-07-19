import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-[#141414] border border-white/5 backdrop-blur-md rounded-2xl max-w-xl mx-auto space-y-5">
      <div className="p-4 bg-white/5 border border-white/10 rounded-full text-white animate-pulse">
        <Icon className="w-8 h-8" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-bold tracking-tight text-white">{title}</h3>
        <p className="text-neutral-400 text-xs max-w-sm leading-relaxed mx-auto">{description}</p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-white hover:bg-neutral-200 active:scale-95 text-black rounded-full text-xs font-bold tracking-wide shadow-md transition-all cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
