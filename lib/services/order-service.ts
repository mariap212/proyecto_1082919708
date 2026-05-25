import { requireSupabaseClient } from '../supabase';
import type { Order, OrderItem, OrderStatus, OrderWithItems } from '../types';
import { verifyStockForItems, deductStockForOrder } from './inventory-service';
import { createInvoiceForOrder } from './invoice-service';

export interface NewOrderInput {
  client_id: string;
  items: Array<{ egg_type_id: string; quantity: number }>;
  notes?: string;
  created_by: string;
}

/**
 * Crea un pedido en estado 'pendiente'.
 * RN-04: cada ítem ≥ 30 unidades.
 * RN-05: unit_price es snapshot del precio actual.
 */
export async function createOrder(input: NewOrderInput): Promise<OrderWithItems> {
  if (!input.items.length) throw new Error('El pedido debe tener al menos un ítem');
  for (const it of input.items) {
    if (it.quantity < 30)
      throw new Error(`Cantidad mínima por ítem: 30 unidades (1 cartón). Recibido: ${it.quantity}`);
  }

  const sb = requireSupabaseClient();

  const eggTypeIds = [...new Set(input.items.map((i) => i.egg_type_id))];
  const { data: eggTypes, error: eErr } = await sb
    .from('egg_types')
    .select('id, price_per_unit, is_active')
    .in('id', eggTypeIds);
  if (eErr) throw new Error(eErr.message);
  const priceMap = new Map(
    eggTypes!.map((e) => [e.id, { price: Number(e.price_per_unit), active: e.is_active }])
  );

  for (const it of input.items) {
    const info = priceMap.get(it.egg_type_id);
    if (!info) throw new Error(`Tipo de huevo no encontrado: ${it.egg_type_id}`);
    if (!info.active) throw new Error(`Tipo de huevo inactivo: ${it.egg_type_id}`);
  }

  const itemsWithPrice = input.items.map((it) => {
    const price = priceMap.get(it.egg_type_id)!.price;
    return {
      egg_type_id: it.egg_type_id,
      quantity: it.quantity,
      unit_price: price,
      subtotal: price * it.quantity,
    };
  });
  const total = itemsWithPrice.reduce((s, it) => s + it.subtotal, 0);

  const { data: order, error: oErr } = await sb
    .from('orders')
    .insert({
      client_id: input.client_id,
      status: 'pendiente' as OrderStatus,
      total,
      notes: input.notes ?? null,
      created_by: input.created_by,
    })
    .select('*')
    .single();
  if (oErr) throw new Error(oErr.message);

  const itemRows = itemsWithPrice.map((it) => ({ ...it, order_id: order!.id }));
  const { data: items, error: iErr } = await sb.from('order_items').insert(itemRows).select('*');
  if (iErr) {
    await sb.from('orders').delete().eq('id', order!.id);
    throw new Error(iErr.message);
  }

  return { ...(order as Order), items: (items ?? []) as OrderItem[] };
}

export interface OrderListFilters {
  status?: OrderStatus;
  client_id?: string;
  from?: string;
  to?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

export async function listOrders(filters: OrderListFilters = {}): Promise<{
  items: Order[];
  total: number;
  limit: number;
  offset: number;
}> {
  const sb = requireSupabaseClient();
  const limit = Math.min(100, filters.limit ?? 25);
  const offset = filters.offset ?? 0;

  let clientIds: string[] | undefined;
  if (filters.q) {
    const { data: matches } = await sb
      .from('clients')
      .select('id')
      .or(`name.ilike.%${filters.q}%,nit.ilike.%${filters.q}%`);
    clientIds = (matches ?? []).map((c) => c.id);
    if (clientIds.length === 0) {
      return { items: [], total: 0, limit, offset };
    }
  }

  let q = sb.from('orders').select('*', { count: 'exact' }).order('created_at', { ascending: false });
  if (filters.status) q = q.eq('status', filters.status);
  if (filters.client_id) q = q.eq('client_id', filters.client_id);
  if (filters.from) q = q.gte('created_at', filters.from);
  if (filters.to) q = q.lte('created_at', filters.to);
  if (clientIds) q = q.in('client_id', clientIds);
  q = q.range(offset, offset + limit - 1);

  const { data, error, count } = await q;
  if (error) throw new Error(error.message);
  return { items: (data ?? []) as Order[], total: count ?? 0, limit, offset };
}

export async function getOrderWithItems(id: string): Promise<OrderWithItems | null> {
  const sb = requireSupabaseClient();
  const { data, error } = await sb
    .from('orders')
    .select('*, items:order_items(*), client:clients(id, name, nit)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as OrderWithItems) ?? null;
}

export async function cancelOrder(id: string, actorId: string): Promise<Order> {
  const sb = requireSupabaseClient();
  const { data, error } = await sb
    .from('orders')
    .update({
      status: 'cancelado' as OrderStatus,
      updated_at: new Date().toISOString(),
      approved_by: actorId,
    })
    .eq('id', id)
    .eq('status', 'pendiente')
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Solo se pueden cancelar pedidos en estado pendiente (RN-03)');
  return data as Order;
}

export async function processOrderApproval(input: {
  order_id: string;
  approved_by: string;
}): Promise<{
  order: Order;
  invoice_number: number;
  delivery_id: string;
}> {
  const sb = requireSupabaseClient();

  const order = await getOrderWithItems(input.order_id);
  if (!order) throw new Error('Pedido no encontrado');
  if (order.status !== 'pendiente') {
    throw new Error(
      `Solo se pueden aprobar pedidos en estado pendiente (estado actual: ${order.status})`
    );
  }
  if (!order.items?.length) throw new Error('El pedido no tiene ítems');

  const missing = await verifyStockForItems(
    order.items.map((it) => ({ egg_type_id: it.egg_type_id, quantity: it.quantity }))
  );
  if (missing.length) {
    const err = new Error('Stock insuficiente') as Error & {
      detail?: unknown;
      status?: number;
    };
    err.detail = { missing };
    err.status = 409;
    throw err;
  }

  await deductStockForOrder(
    order.id,
    order.items.map((it) => ({ egg_type_id: it.egg_type_id, quantity: it.quantity })),
    input.approved_by
  );

  const invoice = await createInvoiceForOrder({
    order_id: order.id,
    total: Number(order.total),
  });

  const { data: delivery, error: dErr } = await sb
    .from('deliveries')
    .insert({ order_id: order.id, status: 'pendiente_asignacion' })
    .select('id')
    .single();
  if (dErr) throw new Error(dErr.message);

  const { data: approved, error: aErr } = await sb
    .from('orders')
    .update({
      status: 'aprobado' as OrderStatus,
      approved_by: input.approved_by,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)
    .select('*')
    .single();
  if (aErr) throw new Error(aErr.message);

  return {
    order: approved as Order,
    invoice_number: invoice.invoice_number,
    delivery_id: delivery!.id,
  };
}
