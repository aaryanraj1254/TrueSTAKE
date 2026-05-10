import React from 'react';

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-slate-800 ${className}`} />
);

export const SkeletonCard: React.FC = () => {
  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-emerald-900/50 bg-slate-900 p-5 shadow-lg">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <Skeleton className="h-5 w-20 rounded-full border border-emerald-700/70 bg-emerald-900/30" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="mb-2 h-6 w-full" />
        <Skeleton className="mb-4 h-6 w-3/4" />

        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-12 rounded-lg border border-emerald-700/80 bg-emerald-500/10" />
          <Skeleton className="h-12 rounded-lg border border-slate-700 bg-slate-800/70" />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((__, column) => (
            <Skeleton key={column} className="h-9" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className={`h-4 ${index === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
};
