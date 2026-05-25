export function Skeleton({ className = '', height = '1rem' }: { className?: string; height?: string }) {
  return (
    <div
      className={`animate-pulse bg-white/5 rounded ${className}`}
      style={{ height }}
    />
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-white/5 bg-slate-950/40 overflow-hidden">
      <div className="bg-white/5 px-4 py-3">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} height="0.75rem" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-4 py-3 grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} height="0.875rem" className={c === 0 ? 'w-2/3' : ''} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonKpi() {
  return (
    <div className="rounded-xl border border-white/5 bg-slate-950/40 p-5">
      <Skeleton height="0.625rem" className="w-1/3 mb-3" />
      <Skeleton height="1.5rem" className="w-2/3" />
    </div>
  );
}
