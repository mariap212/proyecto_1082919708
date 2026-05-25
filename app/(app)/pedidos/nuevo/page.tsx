'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost, formatCurrency } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Client, EggType } from '@/lib/types';

interface Line {
  egg_type_id: string;
  quantity: number;
}

export default function NuevoPedidoPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [eggs, setEggs] = useState<EggType[]>([]);
  const [clientId, setClientId] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Line[]>([{ egg_type_id: '', quantity: 30 }]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      apiGet<Client[]>('/api/clients'),
      apiGet<EggType[]>('/api/egg-types'),
    ]).then(([c, e]) => {
      setClients(c);
      setEggs(e);
    });
  }, []);

  const eggMap = new Map(eggs.map((e) => [e.id, e]));
  const total = lines.reduce((s, l) => {
    const p = Number(eggMap.get(l.egg_type_id)?.price_per_unit ?? 0);
    return s + p * (l.quantity || 0);
  }, 0);

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

  return (
    <>
      <PageHeader title="Nuevo pedido" subtitle="Crea un pedido en estado pendiente" />
      <form onSubmit={submit} className="max-w-3xl space-y-6">
        <div className="rounded-xl border border-white/5 bg-slate-950/40 p-6 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Cliente</label>
            <select required value={clientId} onChange={(e) => setClientId(e.target.value)} className="input">
              <option value="">— seleccionar —</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.nit})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Notas</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className="input" placeholder="Opcional" />
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-slate-950/40 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm uppercase tracking-wider text-slate-400">Ítems</h2>
            <button type="button" onClick={addLine} className="btn-secondary">+ Agregar ítem</button>
          </div>
          <div className="space-y-3">
            {lines.map((l, i) => {
              const e = eggMap.get(l.egg_type_id);
              const sub = e ? Number(e.price_per_unit) * l.quantity : 0;
              return (
                <div key={i} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-6">
                    <label className="block text-xs text-slate-400 mb-1">Tipo</label>
                    <select value={l.egg_type_id} onChange={(ev) => updateLine(i, { egg_type_id: ev.target.value })} className="input">
                      <option value="">— seleccionar —</option>
                      {eggs.map((eg) => <option key={eg.id} value={eg.id}>{eg.code} — {eg.name} ({formatCurrency(Number(eg.price_per_unit))})</option>)}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs text-slate-400 mb-1">Cant. (≥30)</label>
                    <input type="number" min={30} value={l.quantity} onChange={(ev) => updateLine(i, { quantity: Number(ev.target.value) })} className="input" />
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="text-xs text-slate-500">Subtotal</div>
                    <div className="text-slate-200">{formatCurrency(sub)}</div>
                  </div>
                  <div className="col-span-1 text-right">
                    {lines.length > 1 && (
                      <button type="button" onClick={() => removeLine(i)} className="text-rose-400 hover:text-rose-300 text-sm">✕</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-white/5 mt-4 pt-4 flex justify-end text-lg">
            <span className="text-slate-400 mr-3">Total:</span>
            <span className="text-amber-300 font-semibold">{formatCurrency(total)}</span>
          </div>
        </div>

        {err && <p className="text-rose-400 text-sm">{err}</p>}

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancelar</button>
          <button disabled={busy} className="btn-primary">{busy ? 'Creando…' : 'Crear pedido'}</button>
        </div>

        <style>{`
          .input { width:100%; padding:.5rem .75rem; border-radius:.5rem; background:rgba(2,6,23,.6); color:#e2e8f0; border:1px solid rgba(255,255,255,.08); font-size:.875rem; outline:none; }
          .input:focus { border-color:rgba(245,158,11,.5); }
          .btn-primary { padding:.6rem 1rem; border-radius:.5rem; background:linear-gradient(to right,#f59e0b,#d97706); color:#fff; font-weight:600; font-size:.875rem; }
          .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
          .btn-secondary { padding:.6rem 1rem; border-radius:.5rem; background:rgba(255,255,255,.06); color:#cbd5e1; font-weight:500; font-size:.875rem; }
        `}</style>
      </form>
    </>
  );
}
