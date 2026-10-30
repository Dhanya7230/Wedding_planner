import React from 'react';

export const LoadingSkeleton: React.FC<{ label?: string }> = ({ label = 'Loading section...' }) => {
  return (
    <div
      role="status"
      aria-label={label}
      className="w-full p-8 space-y-6 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 animate-pulse"
    >
      <div className="flex items-center justify-between">
        <div className="h-8 bg-slate-200 rounded-lg w-1/3"></div>
        <div className="h-9 bg-slate-200 rounded-lg w-28"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-28 bg-slate-200/80 rounded-xl"></div>
        <div className="h-28 bg-slate-200/80 rounded-xl"></div>
        <div className="h-28 bg-slate-200/80 rounded-xl"></div>
      </div>
      <div className="h-64 bg-slate-100 rounded-xl"></div>
      <span className="sr-only">{label}</span>
    </div>
  );
};
