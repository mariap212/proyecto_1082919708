import { requireSupabaseClient } from '../supabase';

export interface SalesReport {
  range: { from: string; to: string };
  totals: {
    orders: number;
    approved_orders: number;
    revenue: number;
    invoices: number;
    voided_invoices: number;
  };
  by_egg_type: Array<{
    egg_type_id: string;
    code: string;
    quantity: number;
    revenue: number;
  }>;
  by_client: Array<{
    client_id: string;
    name: string;
    nit: string;
    orders: number;
    revenue: number;
  }>;
}

export interface InventoryReport {
  generated_at: string;
  rows: Array<{
    egg_type_id: string;
    code: string;
    name: string;
    current_stock: number;
    min_stock: number;
    price_per_unit: number;
    is_low: boolean;
    valuation: number;
  }>;
  totals: {
    units: number;
    valuation: number;
    low_count: number;
  };
}

export async function generateSalesReport(input: {
  from: string;
  to: string;
}): Promise<SalesReport> {
  const sb = requireSupabaseClient();

  const { data: orders, error: oErr } = await sb
    .from('orders')
    .select('id, client_id, status, total, created_at, items:order_items(egg_type_id, quantity, subtotal), client:clients(id, name, nit)')
    .gte('created_at', input.from)
    .lte('created_at', input.to);
  if (oErr) throw new Error(oErr.message);

  type O = {
    id: string;
    client_id: string;
    status: string;
    total: number;
    items: Array<{ egg_type_id: string; quantity: number; subtotal: number }>;
    client: { id: string; name: string; nit: string } | Array<{ id: string; name: string; nit: string }> | null;
  };
  const raw = (orders ?? []) as unknown as O[];
  const all = raw.map((o) => ({
    ...o,
    client: Array.isArray(o.client) ? o.client[0] ?? null : o.client,
  }));
  const approved = all.filter((o) => o.status === 'aprobado');

  const { data: invs } = await sb
    .from('invoices')
    .select('id, is_voided')
    .gte('created_at', input.from)
    .lte('created_at', input.to);

  const { data: eggTypes } = await sb.from('egg_types').select('id, code');
  const codeOf = new Map<string, string>((eggTypes ?? []).map((e) => [e.id as string, e.code as string]));

  const byEgg = new Map<string, { quantity: number; revenue: number }>();
  for (const o of approved) {
    for (const it of o.items) {
      const cur = byEgg.get(it.egg_type_id) ?? { quantity: 0, revenue: 0 };
      cur.quantity += it.quantity;
      cur.revenue += Number(it.subtotal);
      byEgg.set(it.egg_type_id, cur);
    }
  }

  const byClient = new Map<string, { name: string; nit: string; orders: number; revenue: number }>();
  for (const o of approved) {
    if (!o.client) continue;
    const cur = byClient.get(o.client.id) ?? { name: o.client.name, nit: o.client.nit, orders: 0, revenue: 0 };
    cur.orders += 1;
    cur.revenue += Number(o.total);
    byClient.set(o.client.id, cur);
  }

  return {
    range: { from: input.from, to: input.to },
    totals: {
      orders: all.length,
      approved_orders: approved.length,
      revenue: approved.reduce((s, o) => s + Number(o.total), 0),
      invoices: (invs ?? []).length,
      voided_invoices: (invs ?? []).filter((i) => i.is_voided).length,
    },
    by_egg_type: [...byEgg.entries()].map(([id, v]) => ({
      egg_type_id: id,
      code: codeOf.get(id) ?? '?',
      ...v,
    })),
    by_client: [...byClient.entries()].map(([id, v]) => ({ client_id: id, ...v })),
  };
}

export async function generateInventoryReport(): Promise<InventoryReport> {
  const sb = requireSupabaseClient();
  const { data, error } = await sb
    .from('egg_types')
    .select('id, code, name, price_per_unit, min_stock, is_active, inventory(current_stock)')
    .eq('is_active', true)
    .order('code');
  if (error) throw new Error(error.message);

  type Row = {
    id: string;
    code: string;
    name: string;
    price_per_unit: number;
    min_stock: number;
    inventory: Array<{ current_stock: number }> | { current_stock: number } | null;
  };

  const rows = (data as Row[]).map((r) => {
    const inv = Array.isArray(r.inventory) ? r.inventory[0] : r.inventory;
    const stock = inv?.current_stock ?? 0;
    const price = Number(r.price_per_unit);
    return {
      egg_type_id: r.id,
      code: r.code,
      name: r.name,
      current_stock: stock,
      min_stock: r.min_stock,
      price_per_unit: price,
      is_low: stock < r.min_stock,
      valuation: stock * price,
    };
  });

  return {
    generated_at: new Date().toISOString(),
    rows,
    totals: {
      units: rows.reduce((s, r) => s + r.current_stock, 0),
      valuation: rows.reduce((s, r) => s + r.valuation, 0),
      low_count: rows.filter((r) => r.is_low).length,
    },
  };
}
