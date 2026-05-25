'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPatch, formatCurrency } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import type { EggType } from '@/lib/types';

export default function ProductosPage() {
  const [items, setItems] = useState<EggType[]>([]);
  const [editing, setEditing] = useState<EggType | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    apiGet<EggType[]>('/api/egg-types?all=true').then(setItems).catch(() => undefined);
  }, [refresh]);

  return (
    <>
      <PageHeader
        title="Productos (tipos de huevo)"
        subtitle="Configura precios y stock mínimo por tipo"
        actions={
          <button onClick={() => setShowNew(true)} className="btn-primary">+ Nuevo producto</button>
        }
      />

      <div className="rounded-xl border border-white/5 bg-slate-950/40 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left">Código</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-right">Precio/u</th>
              <th className="px-4 py-3 text-right">Stock mín.</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-3 font-mono text-amber-300">{e.code}</td>
                <td className="px-4 py-3 text-slate-200">{e.name}</td>
                <td className="px-4 py-3 text-right text-slate-300">{formatCurrency(e.price_per_unit)}</td>
                <td className="px-4 py-3 text-right text-slate-300">{e.min_stock}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${e.is_active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-700/40 text-slate-400'}`}>
                    {e.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(e)} className="text-amber-300 text-xs hover:underline">Editar</button>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">Sin productos</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showNew && <NewProductModal onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); setRefresh((r) => r + 1); }} />}
      {editing && <EditProductModal item={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); setRefresh((r) => r + 1); }} />}

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

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function NewProductModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [price, setPrice] = useState(0);
  const [minStock, setMinStock] = useState(100);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await apiPost('/api/egg-types', { name, code, price_per_unit: price, min_stock: minStock });
      onSaved();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Nuevo producto" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <input className="input" placeholder="Nombre" required value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder="Código (ej: AAA)" required value={code} onChange={(e) => setCode(e.target.value)} />
        <input className="input" type="number" placeholder="Precio por unidad" required value={price || ''} onChange={(e) => setPrice(Number(e.target.value))} />
        <input className="input" type="number" placeholder="Stock mínimo" value={minStock} onChange={(e) => setMinStock(Number(e.target.value))} />
        {err && <p className="text-rose-400 text-sm">{err}</p>}
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button disabled={busy} className="btn-primary">{busy ? 'Creando…' : 'Crear'}</button>
        </div>
      </form>
    </Modal>
  );
}

function EditProductModal({ item, onClose, onSaved }: { item: EggType; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(Number(item.price_per_unit));
  const [minStock, setMinStock] = useState(item.min_stock);
  const [active, setActive] = useState(item.is_active);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await apiPatch(`/api/egg-types/${item.id}`, {
        name,
        price_per_unit: price,
        min_stock: minStock,
        is_active: active,
      });
      onSaved();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={`Editar ${item.code}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        <input className="input" type="number" value={minStock} onChange={(e) => setMinStock(Number(e.target.value))} />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Activo
        </label>
        {err && <p className="text-rose-400 text-sm">{err}</p>}
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button disabled={busy} className="btn-primary">{busy ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </Modal>
  );
}
