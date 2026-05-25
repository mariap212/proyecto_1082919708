'use client';

import React from 'react';

/* ────────────────────────────────────────────────────────────
 * SKELETONS
 * ──────────────────────────────────────────────────────────── */

export function Skeleton({
  className = '',
  height = '0.875rem',
  width,
}: {
  className?: string;
  height?: string;
  width?: string;
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ height, width: width ?? undefined }}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="0.75rem"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="panel p-5">
      <Skeleton height="0.625rem" width="40%" className="mb-4" />
      <Skeleton height="2rem" width="70%" />
      <Skeleton height="0.625rem" width="25%" className="mt-3" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="panel overflow-hidden">
      <div
        className="px-4 py-3 grid gap-4 border-b border-white/5"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height="0.625rem" width={i === 0 ? '40%' : '60%'} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="px-4 py-4 grid gap-4 border-b border-white/[0.025] last:border-0"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, animationDelay: `${r * 60}ms` }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              height="0.875rem"
              width={c === 0 ? '50%' : c === cols - 1 ? '30%' : '70%'}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * TEXT / TYPOGRAPHY
 * ──────────────────────────────────────────────────────────── */

export function Eyebrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`eyebrow ${className}`}>{children}</span>;
}

export function HeroNumber({
  value,
  prefix,
  suffix,
  className = '',
  size = 'lg',
}: {
  value: string | number;
  prefix?: string;
  suffix?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
  };
  return (
    <span className={`num-hero ${sizes[size]} text-white ${className}`}>
      {prefix && <span className="text-amber-300/70 mr-1 text-[0.55em]">{prefix}</span>}
      {value}
      {suffix && <span className="text-slate-400 ml-1 text-[0.6em] italic">{suffix}</span>}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
 * STATUS DOT
 * ──────────────────────────────────────────────────────────── */

type DotColor = 'amber' | 'emerald' | 'rose' | 'sky' | 'violet' | 'slate';

export function StatusDot({
  color = 'slate',
  label,
  pulse = false,
}: {
  color?: DotColor;
  label: string;
  pulse?: boolean;
}) {
  return (
    <span className={`status-dot status-dot--${color}`}>
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full bg-current ${pulse ? 'animate-pulse-dot' : ''}`}
      />
      <span className="capitalize text-current">{label}</span>
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
 * SECTION / LAYOUT
 * ──────────────────────────────────────────────────────────── */

export function SectionDivider({ label }: { label?: string }) {
  if (!label) return <div className="border-t border-white/5 my-8" />;
  return (
    <div className="relative my-8 flex items-center">
      <div className="flex-1 border-t border-white/5" />
      <span className="px-4 eyebrow">{label}</span>
      <div className="flex-1 border-t border-white/5" />
    </div>
  );
}

export function Panel({
  children,
  className = '',
  padded = true,
  accent = false,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  accent?: boolean;
}) {
  return (
    <div className={`panel ${padded ? 'p-6' : ''} ${className}`}>
      {accent && (
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
      )}
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  glyph,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  glyph?: string;
}) {
  return (
    <div className="panel p-12 text-center flex flex-col items-center gap-3">
      {glyph && (
        <div className="num-hero text-5xl text-amber-400/40 mb-2 select-none">{glyph}</div>
      )}
      <h3 className="heading-serif text-xl text-slate-100">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-md text-pretty">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * STAT CARD
 * ──────────────────────────────────────────────────────────── */

export function Stat({
  label,
  value,
  detail,
  loading = false,
  accent = false,
  format = 'number',
}: {
  label: string;
  value: string | number | null;
  detail?: string;
  loading?: boolean;
  accent?: boolean;
  format?: 'number' | 'text';
}) {
  return (
    <div className={`panel p-5 transition-all duration-300 hover:border-white/10 group ${accent ? 'ring-1 ring-amber-400/10' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <Eyebrow>{label}</Eyebrow>
        {accent && (
          <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse-dot" aria-hidden />
        )}
      </div>
      {loading || value === null ? (
        <Skeleton height="2rem" width="65%" />
      ) : (
        <div className={`num-hero text-4xl ${accent ? 'text-amber-200' : 'text-white'} ${format === 'text' ? 'not-italic' : ''}`}>
          {value}
        </div>
      )}
      {detail && (
        <div className="mt-2 text-xs text-slate-500">{detail}</div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * BUTTONS
 * ──────────────────────────────────────────────────────────── */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  return (
    <button className={`btn btn-${variant} ${className}`} {...rest}>
      {children}
    </button>
  );
}
