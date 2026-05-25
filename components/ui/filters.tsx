'use client';

import { useEffect, useState } from 'react';
import { Eyebrow } from './primitives';

/* ────────────────────────────────────────────────────────────
 * SearchBar — debounced text input
 * ──────────────────────────────────────────────────────────── */

export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar…',
  debounceMs = 300,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  debounceMs?: number;
}) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    if (local === value) return;
    const t = setTimeout(() => onChange(local), debounceMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local, debounceMs]);

  return (
    <div className="relative flex-1 min-w-[220px] max-w-md">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" aria-hidden>
        ⌕
      </span>
      <input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="input !pl-9"
      />
      {local && (
        <button
          type="button"
          onClick={() => {
            setLocal('');
            onChange('');
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 grid place-items-center text-slate-500 hover:text-slate-200 transition-colors rounded-md hover:bg-white/[0.04]"
          aria-label="Limpiar"
        >
          ✕
        </button>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * DateRangePicker — two date inputs
 * ──────────────────────────────────────────────────────────── */

export function DateRangePicker({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Eyebrow>Periodo</Eyebrow>
      <input
        type="date"
        value={from}
        max={to || undefined}
        onChange={(e) => onChange({ from: e.target.value, to })}
        className="input !py-1.5 !px-3 text-xs tabular-nums w-[140px]"
      />
      <span className="text-slate-600 text-xs">→</span>
      <input
        type="date"
        value={to}
        min={from || undefined}
        onChange={(e) => onChange({ from, to: e.target.value })}
        className="input !py-1.5 !px-3 text-xs tabular-nums w-[140px]"
      />
      {(from || to) && (
        <button
          type="button"
          onClick={() => onChange({ from: '', to: '' })}
          className="text-xs text-slate-500 hover:text-amber-300 transition-colors"
        >
          limpiar
        </button>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Pagination
 * ──────────────────────────────────────────────────────────── */

export function Pagination({
  total,
  limit,
  offset,
  onChange,
  label = 'registros',
}: {
  total: number;
  limit: number;
  offset: number;
  onChange: (offset: number) => void;
  label?: string;
}) {
  if (total === 0) return null;

  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = offset + 1;
  const to = Math.min(offset + limit, total);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  // Build a compact page list: first, prev neighbors, current, next neighbors, last
  const pages: (number | 'ellipsis')[] = [];
  const push = (n: number) => {
    if (n >= 1 && n <= totalPages && !pages.includes(n)) pages.push(n);
  };
  push(1);
  if (page > 3) pages.push('ellipsis');
  for (let p = page - 1; p <= page + 1; p++) push(p);
  if (page < totalPages - 2) pages.push('ellipsis');
  push(totalPages);

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
      <div className="tabular-nums">
        Mostrando{' '}
        <span className="text-slate-300">
          {from.toLocaleString('es-CO')}–{to.toLocaleString('es-CO')}
        </span>{' '}
        de <span className="text-slate-300">{total.toLocaleString('es-CO')}</span> {label}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(0, offset - limit))}
          disabled={!canPrev}
          className="px-2.5 py-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ‹ Anterior
        </button>
        <div className="flex items-center gap-0.5 mx-1">
          {pages.map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`e${i}`} className="px-2 text-slate-600">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onChange((p - 1) * limit)}
                className={`min-w-[28px] h-7 px-2 rounded-md tabular-nums text-xs transition-colors ${
                  p === page
                    ? 'bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/30'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>
        <button
          onClick={() => onChange(offset + limit)}
          disabled={!canNext}
          className="px-2.5 py-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Siguiente ›
        </button>
      </div>
    </div>
  );
}
