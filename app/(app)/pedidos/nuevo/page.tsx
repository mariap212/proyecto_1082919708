'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost, formatCurrency } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Eyebrow,
  HeroNumber,
  Panel,
  Button,
  Skeleton,
} from '@/components/ui/primitives';
import type { Client, EggType } from '@/lib/types';

interface Line {
  egg_type_id: string;
  quantity: number;
}

export default function NuevoPedidoPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[] | null>(null);
  const [eggs, setEggs] = useState<EggType[] | null>(null);
  const [clientId, setClientId] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Line[]>([{ egg_type_id: '', quantity: 30 }]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      apiGet<Client[]>('/api/clients').then(setClients),
      apiGet<EggType[]>('/api/egg-types').then(setEggs),
    ]).catch(() => undefined);
  }, []);

  const eggMap = new Map((eggs ?? []).map((e) => [e.id, e]));
  const lineCount = lines.filter((l) => l.egg_type_id && l.quantity >= 30).length;
  const total = lines.reduce((s, l) => {
    const p = Number(eggMap.get(l.egg_type_id)?.price_per_unit ?? 0);
    return s + p * (l.quantity || 0);
  }, 0);
  const totalUnits = lines.reduce((s, l) => s + (l.egg_type_id ? l.quantity : 0), 0);

  function updateLine(i: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function addLine() {
    setLines((ls) => [...ls, { egg_type_id: '', quantity: 30 }]);
  }
  function removeLine(i: number) {
    setLines((ls) => (ls.length > 1 ? ls.filter((_, idx) => idx !== i) : ls));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await apiPost<{ id: string }>('/api/orders', {
        client_id: clientId,
        items: lines.filter((l) => l.egg_type_id && l.quantity >= 30),
        notes: notes || undefined,
      });
      router.push(`/pedidos/${r.id}`);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const selectedClient = clients?.find((c) => c.id === clientId);

  return (
    <>
      <PageHeader
        eyebrow="Comercial · Composer"
        title="Nuevo pedido"
        subtitle="Crea un pedido en estado pendiente. Mínimo 30 unidades por ítem (1 cartón)."
      />

      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_350px] gap-8">
        <div className="space-y-6">
          {/* Client + notes */}
          <Panel>
            <Eyebrow>Encabezado</Eyebrow>
            <h2 className="heading-serif text-xl text-slate-100 mt-2 mb-5">Cliente y referencia</h2>

            <div className="space-y-4">
              <label className="block">
                <span className="eyebrow block mb-2">Cliente</span>
                {clients === null ? (
                  <Skeleton height="2.5rem" />
                ) : (
                  <select
                    required
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="select"
                  >
                    <option value="">— Seleccionar —</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} · NIT {c.nit}
                      </option>
                    ))}
                  </select>
                )}
              </label>

              <label className="block">
                <span className="eyebrow block mb-2">Notas / referencia (opcional)</span>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input"
                  placeholder="Ej: orden de compra #4521"
                />
              </label>
            </div>
          </Panel>

          {/* Items composer */}
          <Panel>
            <div className="flex items-center justify-between mb-5">
              <div>
                <Eyebrow>Ítems del pedido</Eyebrow>
                <h2 className="heading-serif text-xl text-slate-100 mt-2">Composer</h2>
              </div>
              <Button type="button" variant="ghost" onClick={addLine}>
                + Agregar ítem
              </Button>
            </div>

            {eggs === null ? (
              <div className="space-y-3">
                <Skeleton height="3rem" />
                <Skeleton height="3rem" />
              </div>
            ) : (
              <div className="space-y-3">
                {lines.map((l, i) => {
                  const egg = eggMap.get(l.egg_type_id);
                  const subtotal = egg ? Number(egg.price_per_unit) * l.quantity : 0;
                  return (
                    <div
                      key={i}
                      className="panel-tight p-4 grid grid-cols-12 gap-3 items-end animate-rise"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <div className="col-span-12 sm:col-span-6">
                        <span className="eyebrow block mb-2">
                          Tipo
                          <span className="mono ml-2 text-slate-700">#{String(i + 1).padStart(2, '0')}</span>
                        </span>
                        <select
                          value={l.egg_type_id}
                          onChange={(ev) => updateLine(i, { egg_type_id: ev.target.value })}
                          className="select"
                        >
                          <option value="">— Seleccionar —</option>
                          {eggs.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.code} — {e.name} ({formatCurrency(Number(e.price_per_unit))})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-5 sm:col-span-2">
                        <span className="eyebrow block mb-2">Cant. ≥30</span>
                        <input
                          type="number"
                          min={30}
                          step={30}
                          value={l.quantity}
                          onChange={(ev) => updateLine(i, { quantity: Number(ev.target.value) })}
                          className="input tabular-nums"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-3 text-right">
                        <span className="eyebrow block mb-2">Subtotal</span>
                        <div className="num-hero text-lg text-white tabular-nums not-italic">
                          {formatCurrency(subtotal)}
                        </div>
                      </div>
                      <div className="col-span-1 text-right">
                        {lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLine(i)}
                            className="w-9 h-9 grid place-items-center text-slate-500 hover:text-rose-300 hover:bg-rose-500/5 rounded-md transition-colors"
                            aria-label="Eliminar ítem"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>

        {/* Sticky summary */}
        <aside>
          <div className="lg:sticky lg:top-10 space-y-6">
            <Panel accent>
              <Eyebrow>Resumen</Eyebrow>
              <div className="mt-3 mb-6">
                <div className="text-xs text-slate-500 mb-2">Total estimado</div>
                <HeroNumber prefix="$" value={new Intl.NumberFormat('es-CO').format(total)} size="lg" />
              </div>

              <div className="space-y-3 pb-5 border-b border-white/[0.05]">
                <Row label="Ítems" value={lineCount.toString()} />
                <Row label="Unidades" value={totalUnits.toLocaleString('es-CO')} />
              </div>

              {selectedClient && (
                <div className="pt-5">
                  <Eyebrow>Cliente</Eyebrow>
                  <div className="mt-2 heading-serif text-base text-slate-100">{selectedClient.name}</div>
                  <div className="text-xs text-slate-500 mono mt-1">NIT {selectedClient.nit}</div>
                </div>
              )}

              {err && (
                <div className="mt-5 pt-5 border-t border-white/[0.05]">
                  <p className="text-sm text-rose-400">✗ {err}</p>
                </div>
              )}

              <div className="mt-5 pt-5 border-t border-white/[0.05] flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  className="flex-1 justify-center"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={busy || !clientId || lineCount === 0}
                  className="flex-1 justify-center"
                >
                  {busy ? 'Creando…' : 'Crear pedido'}
                </Button>
              </div>
            </Panel>

            <p className="text-[0.65rem] text-slate-600 px-2 leading-relaxed">
              El pedido se crea en estado <span className="text-amber-300/70">pendiente</span>. La aprobación
              dispara stock → factura → entrega y debe hacerla un administrador.
            </p>
          </div>
        </aside>
      </form>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-200 tabular-nums">{value}</span>
    </div>
  );
}
