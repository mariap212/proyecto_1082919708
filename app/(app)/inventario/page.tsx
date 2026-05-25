'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost, formatDateTime, formatCurrency } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Eyebrow,
  HeroNumber,
  Panel,
  SkeletonTable,
  StatusDot,
  Button,
  EmptyState,
} from '@/components/ui/primitives';
import type { StockView, InventoryMovement, Supplier } from '@/lib/types';

type Tab = 'stock' | 'entrada' | 'movimientos' | 'ajuste';

const TABS: Array<{ id: Tab; label: string; eyebrow: string }> = [
  { id: 'stock', label: 'Stock actual', eyebrow: '01' },
  { id: 'entrada', label: 'Registrar entrada', eyebrow: '02' },
  { id: 'ajuste', label: 'Ajuste manual', eyebrow: '03' },
  { id: 'movimientos', label: 'Historial', eyebrow: '04' },
];

export default function InventarioPage() {
  const [tab, setTab] = useState<Tab>('stock');
  const [stock, setStock] = useState<StockView[] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    apiGet<StockView[]>('/api/inventory').then(setStock).catch(() => setStock([]));
  }, [refreshKey]);

  return (
    <>
      <PageHeader
        eyebrow="Bodega"
        title="Inventario"
        subtitle="Control de stock por tipo de huevo con alertas y registro de movimientos."
      />

      {/* Tabs — editorial style */}
      <nav className="mb-8 flex gap-8 border-b border-white/[0.06] -mb-px overflow-x-auto" role="tablist">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`group relative pb-4 flex items-baseline gap-2 transition-colors ${
                active ? 'text-slate-100' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span
                className={`mono text-[0.6rem] tabular-nums ${
                  active ? 'text-amber-400' : 'text-slate-600 group-hover:text-slate-500'
                }`}
              >
                {t.eyebrow}
              </span>
              <span className="text-sm font-medium tracking-tight">{t.label}</span>
              {active && (
                <span className="absolute left-0 right-0 -bottom-px h-px bg-amber-400" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="animate-rise">
        {tab === 'stock' && <StockTab stock={stock} />}
        {tab === 'entrada' && (
          <EntradaTab stock={stock ?? []} onDone={() => setRefreshKey((k) => k + 1)} />
        )}
        {tab === 'ajuste' && (
          <AjusteTab stock={stock ?? []} onDone={() => setRefreshKey((k) => k + 1)} />
        )}
        {tab === 'movimientos' && <MovimientosTab stock={stock ?? []} />}
      </div>
    </>
  );
}

function StockTab({ stock }: { stock: StockView[] | null }) {
  if (stock === null) return <SkeletonTable rows={5} cols={6} />;
  if (stock.length === 0)
    return (
      <EmptyState
        glyph="∅"
        title="Sin productos configurados"
        description="Crea tipos de huevo en el catálogo para empezar a manejar inventario."
      />
    );

  return (
    <Panel padded={false}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Producto</th>
            <th className="text-right">Stock</th>
            <th className="text-right">Mínimo</th>
            <th className="text-right">Precio/u</th>
            <th className="text-right">Valoración</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {stock.map((s) => (
            <tr key={s.egg_type_id}>
              <td className="mono text-amber-300 text-sm">{s.code}</td>
              <td>
                <span className="text-slate-100">{s.name}</span>
              </td>
              <td className="text-right">
                <span className="num-hero text-base not-italic text-white tabular-nums">
                  {s.current_stock.toLocaleString('es-CO')}
                </span>
              </td>
              <td className="text-right text-slate-500 text-sm tabular-nums">{s.min_stock}</td>
              <td className="text-right text-slate-300 tabular-nums">{formatCurrency(s.price_per_unit)}</td>
              <td className="text-right text-slate-100 tabular-nums">
                {formatCurrency(s.current_stock * s.price_per_unit)}
              </td>
              <td>
                {s.is_low ? (
                  <StatusDot color="rose" label="bajo mínimo" pulse />
                ) : (
                  <StatusDot color="emerald" label="en operación" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

function EntradaTab({ stock, onDone }: { stock: StockView[]; onDone: () => void }) {
  const [eggTypeId, setEggTypeId] = useState('');
  const [qty, setQty] = useState(100);
  const [supplierId, setSupplierId] = useState('');
  const [notes, setNotes] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [msg, setMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);
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
      setMsg({ tone: 'ok', text: `${qty.toLocaleString('es-CO')} unidades sumadas al stock` });
      setQty(100);
      setNotes('');
      onDone();
    } catch (e) {
      setMsg({ tone: 'err', text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  const selected = stock.find((s) => s.egg_type_id === eggTypeId);

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <form onSubmit={submit} className="lg:col-span-2">
        <Panel>
          <Eyebrow>Movimiento · Entrada</Eyebrow>
          <h2 className="heading-serif text-2xl text-slate-100 mt-2 mb-6">
            Recepción desde proveedor
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Tipo de huevo" hint="Stock actual aparece a la derecha">
              <select
                required
                value={eggTypeId}
                onChange={(e) => setEggTypeId(e.target.value)}
                className="select"
              >
                <option value="">— Seleccionar —</option>
                {stock.map((s) => (
                  <option key={s.egg_type_id} value={s.egg_type_id}>
                    {s.code} — {s.name} (actual: {s.current_stock})
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
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="select"
              >
                <option value="">—</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Notas / lote">
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input"
                placeholder="Ej: Lote del 25/05"
              />
            </Field>
          </div>

          <div className="mt-6 pt-6 border-t border-white/[0.05] flex items-center justify-between gap-4">
            {msg && (
              <p
                className={`text-sm ${msg.tone === 'ok' ? 'text-emerald-400' : 'text-rose-400'}`}
              >
                {msg.tone === 'ok' ? '✓ ' : '✗ '}
                {msg.text}
              </p>
            )}
            <Button type="submit" disabled={busy || !eggTypeId} className="ml-auto">
              {busy ? 'Registrando…' : 'Registrar entrada'}
            </Button>
          </div>
        </Panel>
      </form>

      <aside className="space-y-4">
        <Panel>
          <Eyebrow>Resumen</Eyebrow>
          {selected ? (
            <>
              <div className="mt-3 heading-serif text-2xl text-slate-100">{selected.name}</div>
              <div className="mt-1 text-xs text-slate-500">Código {selected.code}</div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <Eyebrow>Stock actual</Eyebrow>
                  <HeroNumber value={selected.current_stock} size="md" />
                </div>
                <div>
                  <Eyebrow>Tras esta entrada</Eyebrow>
                  <HeroNumber
                    value={(selected.current_stock + qty).toLocaleString('es-CO')}
                    size="md"
                    className="text-amber-200"
                  />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/[0.05] text-xs text-slate-500">
                Mínimo configurado:{' '}
                <span className="text-slate-300 tabular-nums">{selected.min_stock}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500 mt-3">
              Selecciona un tipo para ver el impacto del movimiento.
            </p>
          )}
        </Panel>
      </aside>
    </div>
  );
}

function AjusteTab({ stock, onDone }: { stock: StockView[]; onDone: () => void }) {
  const [eggTypeId, setEggTypeId] = useState('');
  const [delta, setDelta] = useState(0);
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await apiPost('/api/inventory/adjust', { egg_type_id: eggTypeId, delta, notes });
      setMsg({ tone: 'ok', text: `Ajuste ${delta > 0 ? '+' : ''}${delta} aplicado` });
      setDelta(0);
      setNotes('');
      onDone();
    } catch (e) {
      setMsg({ tone: 'err', text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-2xl">
      <Panel>
        <Eyebrow>Movimiento · Ajuste</Eyebrow>
        <h2 className="heading-serif text-2xl text-slate-100 mt-2">Corrección manual de stock</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          Solo administrador. Use valores positivos para sumar o negativos para restar al stock.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Tipo de huevo">
            <select
              required
              value={eggTypeId}
              onChange={(e) => setEggTypeId(e.target.value)}
              className="select"
            >
              <option value="">— Seleccionar —</option>
              {stock.map((s) => (
                <option key={s.egg_type_id} value={s.egg_type_id}>
                  {s.code} — {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Delta (positivo o negativo)">
            <input
              type="number"
              required
              value={delta}
              onChange={(e) => setDelta(Number(e.target.value))}
              className="input"
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Motivo (obligatorio)">
              <input
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input"
                placeholder="Ej: corrección por conteo físico"
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/[0.05] flex items-center justify-between gap-4">
          {msg && (
            <p className={`text-sm ${msg.tone === 'ok' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {msg.tone === 'ok' ? '✓ ' : '✗ '}
              {msg.text}
            </p>
          )}
          <Button
            type="submit"
            disabled={busy || !eggTypeId || delta === 0 || !notes}
            className="ml-auto"
          >
            {busy ? 'Aplicando…' : 'Aplicar ajuste'}
          </Button>
        </div>
      </Panel>
    </form>
  );
}

function MovimientosTab({ stock }: { stock: StockView[] }) {
  const [movs, setMovs] = useState<InventoryMovement[] | null>(null);
  const codeMap = new Map(stock.map((s) => [s.egg_type_id, s.code]));

  useEffect(() => {
    apiGet<InventoryMovement[]>('/api/inventory/movements?limit=200')
      .then(setMovs)
      .catch(() => setMovs([]));
  }, []);

  if (movs === null) return <SkeletonTable rows={6} cols={5} />;
  if (movs.length === 0)
    return <EmptyState glyph="—" title="Sin movimientos registrados" description="Las entradas, salidas, devoluciones y ajustes aparecerán aquí en orden cronológico." />;

  const typeColor: Record<string, 'emerald' | 'rose' | 'sky' | 'amber'> = {
    entrada: 'emerald',
    salida: 'rose',
    devolucion: 'sky',
    ajuste: 'amber',
  };

  return (
    <Panel padded={false}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Producto</th>
            <th className="text-right">Cantidad</th>
            <th>Notas</th>
          </tr>
        </thead>
        <tbody>
          {movs.map((m) => (
            <tr key={m.id}>
              <td className="text-xs text-slate-500 tabular-nums">{formatDateTime(m.created_at)}</td>
              <td>
                <StatusDot color={typeColor[m.type] ?? 'slate'} label={m.type} />
              </td>
              <td className="mono text-amber-300/80 text-sm">
                {codeMap.get(m.egg_type_id) ?? m.egg_type_id.slice(0, 8)}
              </td>
              <td className="text-right">
                <span className="num-hero text-base not-italic text-white tabular-nums">
                  {m.type === 'salida' ? '−' : '+'}
                  {m.quantity.toLocaleString('es-CO')}
                </span>
              </td>
              <td className="text-xs text-slate-500 max-w-xs truncate">{m.notes ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow block mb-2">{label}</span>
      {children}
      {hint && <span className="block text-[0.65rem] text-slate-600 mt-1.5">{hint}</span>}
    </label>
  );
}

