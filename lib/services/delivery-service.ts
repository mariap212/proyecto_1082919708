import { requireSupabaseClient } from '../supabase';
import type { Delivery, DeliveryStatus } from '../types';
import { returnStockFromFailedDelivery } from './inventory-service';

export interface DeliveryListFilters {
  status?: DeliveryStatus;
  driver_id?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export async function listDeliveries(filters: DeliveryListFilters = {}): Promise<{
  items: Delivery[];
  total: number;
  limit: number;
  offset: number;
}> {
  const sb = requireSupabaseClient();
  const limit = Math.min(100, filters.limit ?? 25);
  const offset = filters.offset ?? 0;

  let q = sb
    .from('deliveries')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });
  if (filters.status) q = q.eq('status', filters.status);
  if (filters.driver_id) q = q.eq('driver_id', filters.driver_id);
  if (filters.from) q = q.gte('created_at', filters.from);
  if (filters.to) q = q.lte('created_at', filters.to);
  q = q.range(offset, offset + limit - 1);

  const { data, error, count } = await q;
  if (error) throw new Error(error.message);
  return { items: (data ?? []) as Delivery[], total: count ?? 0, limit, offset };
}

export async function getDelivery(id: string): Promise<Delivery | null> {
  const sb = requireSupabaseClient();
  const { data, error } = await sb.from('deliveries').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Delivery) ?? null;
}

export async function assignDriver(input: {
  delivery_id: string;
  driver_id: string;
  assigned_by: string;
}): Promise<Delivery> {
  const sb = requireSupabaseClient();

  const { data: driver, error: e1 } = await sb
    .from('users')
    .select('id, role, is_active')
    .eq('id', input.driver_id)
    .maybeSingle();
  if (e1) throw new Error(e1.message);
  if (!driver || driver.role !== 'conductor' || !driver.is_active) {
    throw new Error('El usuario asignado no es un conductor activo');
  }

  const { data, error } = await sb
    .from('deliveries')
    .update({
      driver_id: input.driver_id,
      assigned_by: input.assigned_by,
      assigned_at: new Date().toISOString(),
      status: 'asignada' as DeliveryStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.delivery_id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Delivery;
}

/**
 * Cambios de estado válidos:
 *   pendiente_asignacion → asignada (por assignDriver)
 *   asignada → en_camino
 *   en_camino → entregada | fallida
 *
 * RN-06: si pasa a 'fallida', se devuelve stock automáticamente.
 */
export async function updateDeliveryStatus(input: {
  delivery_id: string;
  new_status: 'en_camino' | 'entregada' | 'fallida';
  incident_note?: string;
  actor_id: string;
}): Promise<Delivery> {
  const sb = requireSupabaseClient();

  const current = await getDelivery(input.delivery_id);
  if (!current) throw new Error('Entrega no encontrada');

  const validTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
    pendiente_asignacion: [],
    asignada: ['en_camino'],
    en_camino: ['entregada', 'fallida'],
    entregada: [],
    fallida: [],
  };
  if (!validTransitions[current.status].includes(input.new_status)) {
    throw new Error(`Transición inválida: ${current.status} → ${input.new_status}`);
  }

  if (input.new_status === 'fallida' && (!input.incident_note || input.incident_note.trim().length < 3)) {
    throw new Error('Una entrega fallida requiere una nota de incidente');
  }

  const update: Record<string, unknown> = {
    status: input.new_status,
    updated_at: new Date().toISOString(),
  };
  if (input.new_status === 'entregada') update.delivered_at = new Date().toISOString();
  if (input.incident_note) update.incident_note = input.incident_note;

  const { data, error } = await sb
    .from('deliveries')
    .update(update)
    .eq('id', input.delivery_id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);

  // RN-06: devolver stock si pasó a fallida
  if (input.new_status === 'fallida') {
    await returnStockFromFailedDelivery(current.order_id, input.actor_id);
  }

  return data as Delivery;
}
