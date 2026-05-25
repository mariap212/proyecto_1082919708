'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost, formatDateTime } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Delivery, DeliveryStatus } from '@/lib/types';

interface UserBrief {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

const STATUS_COLORS: Record<DeliveryStatus, string> = {
  pendiente_asignacion: 'bg-amber-500/15 text-amber-300',
  asignada: 'bg-sky-500/15 text-sky-300',
  en_camino: 'bg-violet-500/15 text-violet-300',
  entregada: 'bg-emerald-500/15 text-emerald-300',
  fallida: 'bg-rose-500/15 text-rose-300',
};

export default function EntregasPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<UserBrief[]>([]);
  const [me, setMe] = useState<{ role: string } | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    apiGet<Delivery[]>('/api/deliveries').then(setDeliveries).catch(() => undefined);
    apiGet<{ role: string }>('/api/auth/me').then(setMe).catch(() => undefined);
  }, [refresh]);

  useEffect(() => {
    if (me?.role === 'admin') {
      apiGet<UserBrief[]>('/api/users').then((us) =>
        setDrivers(us.filter((u) => u.role === 'conductor' && u.is_active))
      ).catch(() => undefined);
    }
  }, [me]);

  const isConductor = me?.role === 'conductor';
  const isAdmin = me?.role === 'admin';

  async function assign(deliveryId: string, driverId: string) {
    try {
      await apiPost(`/api/deliveries/${deliveryId}/assign`, { driver_id: driverId });
      setRefresh((r) => r + 1);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function changeStatus(
    deliveryId: string,
    new_status: 'en_camino' | 'entregada' | 'fallida'
  ) {
    let incident_note: string | undefined;
    if (new_status === 'fallida') {
      const r = prompt('Motivo de la falla (mín. 3 caracteres):');
      if (!r || r.length < 3) return;
      incident_note = r;
    }
    try {
      await apiPost(`/api/deliveries/${deliveryId}/status`, { new_status, incident_note });
      setRefresh((r) => r + 1);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <>
      <PageHeader
        title={isConductor ? 'Mis entregas' : 'Entregas'}
        subtitle={isConductor ? 'Rutas asignadas a ti' : 'Asignación y seguimiento de envíos'}
      />

      <div className="rounded-xl border border-white/5 bg-slate-950/40 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left">Pedido</th>
              <th className="px-4 py-3 text-left">Creada</th>
              <th className="px-4 py-3 text-left">Conductor</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {deliveries.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3 font-mono text-xs text-slate-300">{d.order_id.slice(0, 8)}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{formatDateTime(d.created_at)}</td>
                <td className="px-4 py-3 text-slate-300 text-xs">
                  {d.driver_id ? d.driver_id.slice(0, 8) : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[d.status]}`}>{d.status}</span>
                  {d.incident_note && (
                    <div className="text-xs text-rose-400 mt-1">{d.incident_note}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {isAdmin && d.status === 'pendiente_asignacion' && (
                    <select
                      defaultValue=""
                      onChange={(e) => e.target.value && assign(d.id, e.target.value)}
                      className="bg-slate-900 text-xs border border-white/10 rounded px-2 py-1 text-amber-300"
                    >
                      <option value="">Asignar a…</option>
                      {drivers.map((dr) => (
                        <option key={dr.id} value={dr.id}>{dr.name}</option>
                      ))}
                    </select>
                  )}
                  {(isConductor || isAdmin) && d.status === 'asignada' && (
                    <button onClick={() => changeStatus(d.id, 'en_camino')} className="text-violet-300 text-xs hover:underline">Iniciar ruta</button>
                  )}
                  {(isConductor || isAdmin) && d.status === 'en_camino' && (
                    <div className="space-x-3">
                      <button onClick={() => changeStatus(d.id, 'entregada')} className="text-emerald-300 text-xs hover:underline">✓ Entregada</button>
                      <button onClick={() => changeStatus(d.id, 'fallida')} className="text-rose-300 text-xs hover:underline">✗ Fallida</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!deliveries.length && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">Sin entregas</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
