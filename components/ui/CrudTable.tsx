'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api-client';

export interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'tel';
  required?: boolean;
  placeholder?: string;
  defaultValue?: string | number;
}

export interface RowBase {
  id: string;
  is_active: boolean;
}

export function CrudTable<T extends RowBase>({
  endpoint,
  columns,
  fields,
  title,
  emptyHint,
}: {
  endpoint: string;
  columns: Array<{ key: keyof T & string; label: string; render?: (row: T) => React.ReactNode }>;
  fields: FieldDef[];
  title: string;
  emptyHint?: string;
}) {
  const [rows, setRows] = useState<T[]>([]);
  const [editing, setEditing] = useState<T | null>(null);
  const [creating, setCreating] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiGet<T[]>(`${endpoint}?all=true`)
      .then(setRows)
      .catch((e) => setErr((e as Error).message));
  }, [endpoint, refresh]);

  async function softDelete(id: string) {
    if (!confirm('¿Desactivar este registro? (no se elimina físicamente)')) return;
    try {
      await apiDelete(`${endpoint}/${id}`);
      setRefresh((r) => r + 1);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-end gap-2">
        <button onClick={() => setCreating(true)} className="btn-primary">+ Nuevo</button>
      </div>
      {err && <p className="text-rose-400 text-sm mb-4">Error: {err}</p>}
      <div className="rounded-xl border border-white/5 bg-slate-950/40 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 text-left">{c.label}</th>
              ))}
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => (
              <tr key={r.id}>
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 text-slate-200">
                    {c.render ? c.render(r) : ((r as unknown as Record<string, React.ReactNode>)[c.key] ?? '—')}
                  </td>
                ))}
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${r.is_active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-700/40 text-slate-400'}`}>
                    {r.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button onClick={() => setEditing(r)} className="text-amber-300 text-xs hover:underline">Editar</button>
                  {r.is_active && (
                    <button onClick={() => softDelete(r.id)} className="text-rose-300 text-xs hover:underline">Desactivar</button>
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={columns.length + 2} className="px-4 py-6 text-center text-slate-500">
                  {emptyHint ?? 'Sin registros'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {creating && (
        <CrudForm
          title={`Nuevo ${title}`}
          fields={fields}
          onClose={() => setCreating(false)}
          onSubmit={async (data) => {
            await apiPost(endpoint, data);
            setCreating(false);
            setRefresh((r) => r + 1);
          }}
        />
      )}
      {editing && (
        <CrudForm
          title={`Editar ${title}`}
          fields={fields}
          initial={editing as unknown as Record<string, unknown>}
          onClose={() => setEditing(null)}
          onSubmit={async (data) => {
            await apiPatch(`${endpoint}/${editing.id}`, data);
            setEditing(null);
            setRefresh((r) => r + 1);
          }}
        />
      )}

      <style>{`
        .input { width:100%; padding:.5rem .75rem; border-radius:.5rem; background:rgba(2,6,23,.6); color:#e2e8f0; border:1px solid rgba(255,255,255,.08); font-size:.875rem; outline:none; }
        .input:focus { border-color:rgba(245,158,11,.5); }
        .btn-primary { padding:.6rem 1rem; border-radius:.5rem; background:linear-gradient(to right,#f59e0b,#d97706); color:#fff; font-weight:600; font-size:.875rem; }
        .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
        .btn-secondary { padding:.6rem 1rem; border-radius:.5rem; background:rgba(255,255,255,.06); color:#cbd5e1; font-weight:500; font-size:.875rem; }
      `}</style>
    </>
  );
}

function CrudForm({
  title,
  fields,
  initial,
  onClose,
  onSubmit,
}: {
  title: string;
  fields: FieldDef[];
  initial?: Record<string, unknown>;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}) {
  const [state, setState] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    fields.forEach((f) => (init[f.key] = (initial?.[f.key] as string | number) ?? f.defaultValue ?? ''));
    return init;
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const cleaned: Record<string, unknown> = {};
      for (const f of fields) {
        const v = state[f.key];
        cleaned[f.key] = f.type === 'number' ? Number(v) : v === '' ? null : v;
      }
      await onSubmit(cleaned);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">✕</button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">{f.label}</label>
              <input
                className="input"
                type={f.type ?? 'text'}
                required={f.required}
                placeholder={f.placeholder}
                value={(state[f.key] as string | number) ?? ''}
                onChange={(e) => setState((s) => ({ ...s, [f.key]: e.target.value }))}
              />
            </div>
          ))}
          {err && <p className="text-rose-400 text-sm">{err}</p>}
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button disabled={busy} className="btn-primary">{busy ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
