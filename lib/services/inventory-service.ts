import { requireSupabaseClient } from '../supabase';
import type {
  EggType,
  InventoryMovement,
  InventoryMovementType,
  StockView,
} from '../types';

/**
 * Vista de stock: join inventory + egg_types con flag is_low (RN-02).
 * Usado para dashboard y página /inventario.
 */
export async function getStockView(): Promise<StockView[]> {
  const sb = requireSupabaseClient();
  const { data, error } = await sb
    .from('egg_types')
    .select('id, code, name, price_per_unit, min_stock, is_active, inventory(current_stock)')
    .eq('is_active', true)
    .order('code');

  if (error) throw new Error(error.message);

  type Row = Pick<EggType, 'id' | 'code' | 'name' | 'price_per_unit' | 'min_stock'> & {
    inventory: Array<{ current_stock: number }> | { current_stock: number } | null;
  };

  return (data as Row[]).map((r) => {
    const inv = Array.isArray(r.inventory) ? r.inventory[0] : r.inventory;
    const stock = inv?.current_stock ?? 0;
    return {
      egg_type_id: r.id,
      code: r.code,
      name: r.name,
      current_stock: stock,
      min_stock: r.min_stock,
      price_per_unit: r.price_per_unit,
      is_low: stock < r.min_stock,
    };
  });
}

export async function getLowStockAlerts(): Promise<StockView[]> {
  const view = await getStockView();
  return view.filter((v) => v.is_low);
}

/**
 * CU-01: Registrar entrada de huevos desde un proveedor.
 * Suma al stock + escribe inventory_movements.
 */
export async function registerStockEntry(input: {
  egg_type_id: string;
  quantity: number;
  supplier_id?: string;
  notes?: string;
  recorded_by: string;
}): Promise<InventoryMovement> {
  if (input.quantity <= 0) throw new Error('La cantidad debe ser mayor a 0');
  const sb = requireSupabaseClient();

  await adjustStock(input.egg_type_id, input.quantity);

  const { data, error } = await sb
    .from('inventory_movements')
    .insert({
      egg_type_id: input.egg_type_id,
      type: 'entrada' as InventoryMovementType,
      quantity: input.quantity,
      supplier_id: input.supplier_id ?? null,
      notes: input.notes ?? null,
      recorded_by: input.recorded_by,
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as InventoryMovement;
}

/**
 * RN-11: descuento de stock para items de un pedido aprobado.
 * Asume que verifyStockForOrder ya pasó (verificación previa atómica).
 */
export async function deductStockForOrder(
  orderId: string,
  items: Array<{ egg_type_id: string; quantity: number }>,
  recordedBy: string
): Promise<void> {
  const sb = requireSupabaseClient();
  for (const it of items) {
    await adjustStock(it.egg_type_id, -it.quantity);
    const { error } = await sb.from('inventory_movements').insert({
      egg_type_id: it.egg_type_id,
      type: 'salida' as InventoryMovementType,
      quantity: it.quantity,
      reference_id: orderId,
      recorded_by: recordedBy,
    });
    if (error) throw new Error(error.message);
  }
}

/**
 * RN-06: devolver stock cuando una entrega se marca fallida.
 * Lee los order_items del pedido y suma cada cantidad de vuelta al inventario.
 */
export async function returnStockFromFailedDelivery(
  orderId: string,
  recordedBy: string
): Promise<void> {
  const sb = requireSupabaseClient();
  const { data: items, error } = await sb
    .from('order_items')
    .select('egg_type_id, quantity')
    .eq('order_id', orderId);
  if (error) throw new Error(error.message);

  for (const it of items ?? []) {
    await adjustStock(it.egg_type_id, it.quantity);
    await sb.from('inventory_movements').insert({
      egg_type_id: it.egg_type_id,
      type: 'devolucion' as InventoryMovementType,
      quantity: it.quantity,
      reference_id: orderId,
      recorded_by: recordedBy,
    });
  }
}

/** Ajuste manual (admin) — puede ser positivo o negativo. */
export async function adjustStockManual(input: {
  egg_type_id: string;
  delta: number;
  notes: string;
  recorded_by: string;
}): Promise<InventoryMovement> {
  if (input.delta === 0) throw new Error('El ajuste no puede ser 0');
  const sb = requireSupabaseClient();
  await adjustStock(input.egg_type_id, input.delta);
  const { data, error } = await sb
    .from('inventory_movements')
    .insert({
      egg_type_id: input.egg_type_id,
      type: 'ajuste' as InventoryMovementType,
      quantity: Math.abs(input.delta),
      notes: `${input.delta > 0 ? '+' : '-'} ${input.notes}`,
      recorded_by: input.recorded_by,
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as InventoryMovement;
}

export interface MovementListFilters {
  egg_type_id?: string;
  type?: InventoryMovementType;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export async function listMovements(filters: MovementListFilters = {}): Promise<{
  items: InventoryMovement[];
  total: number;
  limit: number;
  offset: number;
}> {
  const sb = requireSupabaseClient();
  const limit = Math.min(200, filters.limit ?? 25);
  const offset = filters.offset ?? 0;

  let q = sb
    .from('inventory_movements')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });
  if (filters.egg_type_id) q = q.eq('egg_type_id', filters.egg_type_id);
  if (filters.type) q = q.eq('type', filters.type);
  if (filters.from) q = q.gte('created_at', filters.from);
  if (filters.to) q = q.lte('created_at', filters.to);
  q = q.range(offset, offset + limit - 1);

  const { data, error, count } = await q;
  if (error) throw new Error(error.message);
  return { items: (data ?? []) as InventoryMovement[], total: count ?? 0, limit, offset };
}

/**
 * Verifica stock disponible para todos los items de un pedido.
 * Retorna [] si todo OK, o detalle de faltantes (RN-01).
 */
export async function verifyStockForItems(
  items: Array<{ egg_type_id: string; quantity: number }>
): Promise<Array<{ egg_type_id: string; needed: number; available: number; code?: string }>> {
  const sb = requireSupabaseClient();
  const eggTypeIds = [...new Set(items.map((i) => i.egg_type_id))];
  const { data, error } = await sb
    .from('egg_types')
    .select('id, code, inventory(current_stock)')
    .in('id', eggTypeIds);
  if (error) throw new Error(error.message);

  type Row = { id: string; code: string; inventory: Array<{ current_stock: number }> | { current_stock: number } | null };
  const stockByType = new Map<string, { stock: number; code: string }>();
  for (const r of data as Row[]) {
    const inv = Array.isArray(r.inventory) ? r.inventory[0] : r.inventory;
    stockByType.set(r.id, { stock: inv?.current_stock ?? 0, code: r.code });
  }

  // Suma cantidades por tipo (un pedido puede tener varios renglones del mismo)
  const needed = new Map<string, number>();
  for (const it of items) {
    needed.set(it.egg_type_id, (needed.get(it.egg_type_id) ?? 0) + it.quantity);
  }

  const missing: Array<{ egg_type_id: string; needed: number; available: number; code?: string }> = [];
  for (const [eggId, qty] of needed) {
    const info = stockByType.get(eggId);
    const available = info?.stock ?? 0;
    if (available < qty) {
      missing.push({ egg_type_id: eggId, needed: qty, available, code: info?.code });
    }
  }
  return missing;
}

// --- internal ---

async function adjustStock(eggTypeId: string, delta: number): Promise<void> {
  const sb = requireSupabaseClient();
  const { data: current, error: e1 } = await sb
    .from('inventory')
    .select('current_stock')
    .eq('egg_type_id', eggTypeId)
    .maybeSingle();
  if (e1) throw new Error(e1.message);

  const next = (current?.current_stock ?? 0) + delta;
  if (next < 0) throw new Error('Stock no puede quedar negativo');

  if (current) {
    const { error } = await sb
      .from('inventory')
      .update({ current_stock: next, updated_at: new Date().toISOString() })
      .eq('egg_type_id', eggTypeId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await sb
      .from('inventory')
      .insert({ egg_type_id: eggTypeId, current_stock: next });
    if (error) throw new Error(error.message);
  }
}
