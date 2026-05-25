'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost, formatDateTime, formatCurrency } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import type { StockView, InventoryMovement, Supplier } from '@/lib/types';

type Tab = 'stock' | 'entrada' | 'movimientos' | 'ajuste';

export default function InventarioPage() {
  const [tab, setTab] = useState<Tab>('stock');
  const [stock, setStock] = useState<StockView[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    apiGet<StockView[]>('/api/inventory').then(setStock).catch(() => undefined);
  }, [refreshKey]);

  return (
    <>
      <PageHeader title="Inventario" subtitle="Control de stock por tipo de huevo" />

      <div className="border-b border-white/5 mb-6 flex gap-1">
        <TabBtn active={tab === 'stock'} onClick={() => setTab('stock')}>Stock actual</TabBtn>
        <TabBtn active={tab === 'entrada'} onClick={() => setTab('entrada')}>Registrar entrada</TabBtn>
        <TabBtn active={tab === 'ajuste'} onClick={() => setTab('ajuste')}>Ajuste manual</TabBtn>
        <TabBtn active={tab === 'movimientos'} onClick={() => setTab('movimientos')}>Movimientos</TabBtn>
      </div>

      {tab === 'stock' && <StockTab stock={stock} />}
      {tab === 'entrada' && <EntradaTab stock={stock} onDone={() => setRefreshKey((k) => k + 1)} />}
      {tab === 'ajuste' && <AjusteTab stock={stock} onDone={() => setRefreshKey((k) => k + 1)} />}
      {tab === 'movimientos' && <MovimientosTab stock={stock} />}
    </>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm rounded-t-md transition ${
        active
          ? 'bg-amber-500/10 text-amber-200 border-b-2 border-amber-400'
          : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  );
}

function StockTab({ stock }: { stock: StockView[] }) {
  return (
    <div className="rounded-xl border border-white/5 bg-slate-950/40 overflow-hidden">
      <table className="w-full">
        <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
          <tr>
            <th className="px-4 py-3 text-left">Código</th>
            <th className="px-4 py-3 text-left">Producto</th>
            <th className="px-4 py-3 text-right">Stock</th>
            <th className="px-4 py-3 text-right">Mínimo</th>
            <th className="px-4 py-3 text-right">Precio/u</th>
            <th className="px-4 py-3 text-right">Valoración</th>
            <th className="px-4 py-3 text-center">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {stock.map((s) => (
            <tr key={s.egg_type_id}>
              <td className="px-4 py-3 font-mono text-amber-300">{s.code}</td>
              <td className="px-4 py-3 text-slate-200">{s.name}</td>
              <td className="px-4 py-3 text-right text-slate-100">{s.current_stock.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-slate-400">{s.min_stock}</td>
              <td className="px-4 py-3 text-right text-slate-300">{formatCurrency(s.price_per_unit)}</td>
              <td className="px-4 py-3 text-right text-slate-300">{formatCurrency(s.current_stock * s.price_per_unit)}</td>
              <td className="px-4 py-3 text-center">
                {s.is_low ? (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 text-xs">⚠ Bajo</span>
                ) : (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-xs">✓ OK</span>
                )}
              </td>
            </tr>
          ))}
          {!stock.length && (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-slate-500">Cargando…</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function EntradaTab({ stock, onDone }: { stock: StockView[]; onDone: () => void }) {
  const [eggTypeId, setEggTypeId] = useState('');
  const [qty, setQty] = useState(100);
  const [supplierId, setSupplierId] = useState('');
  const [notes, setNotes] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiGet<Supplier[]>('/api/suppliers').then(setSuppliers).catch(() => undefined);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await apiPost('/api/inventory/entry', {
        egg_type_id: eggTypeId,
        quantity: qty,
        supplier_id: supplierId || undefined,
        notes: notes || undefined,
      });
      setMsg(`✓ ${qty} unidades registradas`);
      setQty(100);
      setNotes('');
      onDone();
    } catch (e) {
      setMsg(`✗ ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-xl rounded-xl border border-white/5 bg-slate-950/40 p-6 space-y-4">
      <Field label="Tipo de huevo">
        <select required value={eggTypeId} onChange={(e) => setEggTypeId(e.target.value)} className="input">
          <option value="">— seleccionar —</option>
          {stock.map((s) => (
            <option key={s.egg_type_id} value={s.egg_type_id}>
              {s.code} — {s.name} (stock actual: {s.current_stock})
            </option>
          ))}
        </select>
      </Field>
      <Field label="Cantidad (unidades)">
        <input
          type="number"
          required
          min={1}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="input"
        />
      </Field>
      <Field label="Proveedor (opcional)">
        <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="input">
          <option value="">—</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Notas">
        <input value={notes} onChange={(e) => setNotes(e.target.value)} className="input" placeholder="Ej: Lote del 25/05" />
      </Field>
      <button disabled={busy || !eggTypeId} className="btn-primary">
        {busy ? 'Guardando…' : 'Registrar entrada'}
      </button>
      {msg && <p className={msg.startsWith('✓') ? 'text-emerald-400 text-sm' : 'text-rose-400 text-sm'}>{msg}</p>}
      <FormStyles />
    </form>
  );
}

function AjusteTab({ stock, onDone }: { stock: StockView[]; onDone: () => void }) {
  const [eggTypeId, setEggTypeId] = useState('');
  const [delta, setDelta] = useState(0);
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await apiPost('/api/inventory/adjust', { egg_type_id: eggTypeId, delta, notes });
      setMsg(`✓ Ajuste ${delta > 0 ? '+' : ''}${delta} aplicado`);
      setDelta(0);
      setNotes('');
      onDone();
    } catch (e) {
      setMsg(`✗ ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-xl rounded-xl border border-white/5 bg-slate-950/40 p-6 space-y-4">
      <p className="text-xs text-amber-300/80 bg-amber-500/5 border border-amber-500/20 rounded-md p-3">
        ⚠ Ajuste manual. Solo admin. Use valores positivos para sumar, negativos para restar.
      </p>
      <Field label="Tipo de huevo">
        <select required value={eggTypeId} onChange={(e) => setEggTypeId(e.target.value)} className="input">
          <option value="">— seleccionar —</option>
          {stock.map((s) => (
            <option key={s.egg_type_id} value={s.egg_type_id}>{s.code} — {s.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Delta (positivo o negativo)">
        <input type="number" required value={delta} onChange={(e) => setDelta(Number(e.target.value))} className="input" />
      </Field>
      <Field label="Motivo (obligatorio)">
        <input required value={notes} onChange={(e) => setNotes(e.target.value)} className="input" />
      </Field>
      <button disabled={busy || !eggTypeId || delta === 0 || !notes} className="btn-primary">
        {busy ? 'Guardando…' : 'Aplicar ajuste'}
      </button>
      {msg && <p className={msg.startsWith('✓') ? 'text-emerald-400 text-sm' : 'text-rose-400 text-sm'}>{msg}</p>}
      <FormStyles />
    </form>
  );
}

function MovimientosTab({ stock }: { stock: StockView[] }) {
  const [movs, setMovs] = useState<InventoryMovement[]>([]);
  const codeMap = new Map(stock.map((s) => [s.egg_type_id, s.code]));

  useEffect(() => {
    apiGet<InventoryMovement[]>('/api/inventory/movements?limit=200').then(setMovs).catch(() => undefined);
  }, []);

  const typeColor: Record<string, string> = {
    entrada: 'text-emerald-400',
    salida: 'text-rose-400',
    devolucion: 'text-sky-400',
    ajuste: 'text-amber-400',
  };

  return (
    <div className="rounded-xl border border-white/5 bg-slate-950/40 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
          <tr>
            <th className="px-4 py-3 text-left">Fecha</th>
            <th className="px-4 py-3 text-left">Tipo</th>
            <th className="px-4 py-3 text-left">Producto</th>
            <th className="px-4 py-3 text-right">Cantidad</th>
            <th className="px-4 py-3 text-left">Notas</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {movs.map((m) => (
            <tr key={m.id}>
              <td className="px-4 py-2 text-slate-400 text-xs">{formatDateTime(m.created_at)}</td>
              <td className={`px-4 py-2 ${typeColor[m.type] ?? ''}`}>{m.type}</td>
              <td className="px-4 py-2 text-slate-200">{codeMap.get(m.egg_type_id) ?? m.egg_type_id.slice(0, 8)}</td>
              <td className="px-4 py-2 text-right text-slate-100">{m.quantity.toLocaleString()}</td>
              <td className="px-4 py-2 text-slate-400 text-xs">{m.notes ?? ''}</td>
            </tr>
          ))}
          {!movs.length && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-slate-500">Sin movimientos registrados</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-slate-400 mb-1">{label}</span>
      {children}
    </label>
  );
}

function FormStyles() {
  return (
    <style>{`
      .input { width:100%; padding:.5rem .75rem; border-radius:.5rem; background:rgba(2,6,23,.6); color:#e2e8f0; border:1px solid rgba(255,255,255,.08); font-size:.875rem; outline:none; }
      .input:focus { border-color:rgba(245,158,11,.5); }
      .btn-primary { padding:.6rem 1rem; border-radius:.5rem; background:linear-gradient(to right,#f59e0b,#d97706); color:#fff; font-weight:600; font-size:.875rem; transition:opacity .2s; }
      .btn-primary:hover:not(:disabled) { opacity:.9 }
      .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
    `}</style>
  );
}
