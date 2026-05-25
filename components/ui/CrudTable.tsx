'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete, buildQuery } from '@/lib/api-client';
import {
  Panel,
  SkeletonTable,
  StatusDot,
  Button,
  EmptyState,
} from './primitives';
import { Modal } from './Modal';
import { SearchBar } from './filters';

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
  eyebrow,
  emptyHint,
  searchPlaceholder = 'Buscar…',
}: {
  endpoint: string;
  columns: Array<{ key: keyof T & string; label: string; render?: (row: T) => React.ReactNode }>;
  fields: FieldDef[];
  title: string;
  eyebrow?: string;
  emptyHint?: string;
  searchPlaceholder?: string;
}) {
  const [rows, setRows] = useState<T[] | null>(null);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<T | null>(null);
  const [creating, setCreating] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setRows(null);
    const qs = buildQuery({ all: true, q: q || undefined });
    apiGet<T[]>(`${endpoint}${qs}`)
      .then(setRows)
      .catch((e) => {
        setErr((e as Error).message);
        setRows([]);
      });
  }, [endpoint, refresh, q]);

  async function softDelete(id: string) {
    if (!confirm('¿Desactivar este registro? (se preserva el historial, no se elimina físicamente)')) return;
    try {
      await apiDelete(`${endpoint}/${id}`);
      setRefresh((r) => r + 1);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <>
      <div className="mb-6 panel !p-4 flex flex-wrap items-center gap-4">
        <SearchBar value={q} onChange={setQ} placeholder={searchPlaceholder} />
        <Button onClick={() => setCreating(true)} className="ml-auto">+ Nuevo {title}</Button>
      </div>
      {err && <p className="text-rose-400 text-sm mb-4">{err}</p>}

      {rows === null ? (
        <SkeletonTable rows={5} cols={columns.length + 2} />
      ) : rows.length === 0 ? (
        <EmptyState
          glyph="∅"
          title={`Sin ${title}s registrados`}
          description={emptyHint ?? `Crea el primer ${title} para comenzar.`}
          action={<Button onClick={() => setCreating(true)}>+ Nuevo {title}</Button>}
        />
      ) : (
        <Panel padded={false}>
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  {columns.map((c) => (
                    <td key={c.key} className="text-slate-200">
                      {c.render
                        ? c.render(r)
                        : ((r as unknown as Record<string, React.ReactNode>)[c.key] ?? (
                            <span className="text-slate-600">—</span>
                          ))}
                    </td>
                  ))}
                  <td>
                    {r.is_active ? (
                      <StatusDot color="emerald" label="activo" />
                    ) : (
                      <StatusDot color="slate" label="inactivo" />
                    )}
                  </td>
                  <td className="text-right space-x-4">
                    <button
                      onClick={() => setEditing(r)}
                      className="text-amber-300 text-xs hover:text-amber-200 transition-colors"
                    >
                      Editar
                    </button>
                    {r.is_active && (
                      <button
                        onClick={() => softDelete(r.id)}
                        className="text-rose-300 text-xs hover:text-rose-200 transition-colors"
                      >
                        Desactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {creating && (
        <CrudForm
          title={`Nuevo ${title}`}
          eyebrow={eyebrow}
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
          eyebrow={eyebrow}
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
    </>
  );
}

function CrudForm({
  title,
  eyebrow,
  fields,
  initial,
  onClose,
  onSubmit,
}: {
  title: string;
  eyebrow?: string;
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
    <Modal title={title} eyebrow={eyebrow} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="eyebrow block mb-2">{f.label}</span>
            <input
              className="input"
              type={f.type ?? 'text'}
              required={f.required}
              placeholder={f.placeholder}
              value={(state[f.key] as string | number) ?? ''}
              onChange={(e) => setState((s) => ({ ...s, [f.key]: e.target.value }))}
            />
          </label>
        ))}
        {err && <p className="text-rose-400 text-sm">{err}</p>}
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
