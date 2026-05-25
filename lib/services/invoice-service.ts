import { requireSupabaseClient } from '../supabase';
import type { Invoice } from '../types';

export async function getNextInvoiceNumber(): Promise<number> {
  const sb = requireSupabaseClient();
  const { data, error } = await sb
    .from('invoices')
    .select('invoice_number')
    .order('invoice_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.invoice_number ?? 0) + 1;
}

export async function createInvoiceForOrder(input: {
  order_id: string;
  total: number;
}): Promise<Invoice> {
  const sb = requireSupabaseClient();
  const invoice_number = await getNextInvoiceNumber();
  const { data, error } = await sb
    .from('invoices')
    .insert({
      order_id: input.order_id,
      invoice_number,
      total: input.total,
      is_voided: false,
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Invoice;
}

export interface InvoiceListFilters {
  from?: string;
  to?: string;
  include_voided?: boolean;
  q?: string; // searches invoice_number
  limit?: number;
  offset?: number;
}

export async function listInvoices(filters: InvoiceListFilters = {}): Promise<{
  items: Invoice[];
  total: number;
  limit: number;
  offset: number;
}> {
  const sb = requireSupabaseClient();
  const limit = Math.min(100, filters.limit ?? 25);
  const offset = filters.offset ?? 0;

  let q = sb
    .from('invoices')
    .select('*', { count: 'exact' })
    .order('invoice_number', { ascending: false });

  if (!filters.include_voided) q = q.eq('is_voided', false);
  if (filters.from) q = q.gte('created_at', filters.from);
  if (filters.to) q = q.lte('created_at', filters.to);
  if (filters.q) {
    const num = parseInt(filters.q, 10);
    if (!Number.isNaN(num)) q = q.eq('invoice_number', num);
    else q = q.eq('invoice_number', -1); // no match
  }
  q = q.range(offset, offset + limit - 1);

  const { data, error, count } = await q;
  if (error) throw new Error(error.message);
  return { items: (data ?? []) as Invoice[], total: count ?? 0, limit, offset };
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const sb = requireSupabaseClient();
  const { data, error } = await sb.from('invoices').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Invoice) ?? null;
}

export async function voidInvoice(id: string, reason: string, voidedBy: string): Promise<Invoice> {
  if (!reason || reason.trim().length < 5) {
    throw new Error('El motivo de anulación debe tener al menos 5 caracteres');
  }
  const sb = requireSupabaseClient();
  const { data, error } = await sb
    .from('invoices')
    .update({
      is_voided: true,
      void_reason: reason,
      voided_by: voidedBy,
      voided_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('is_voided', false)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Invoice;
}
