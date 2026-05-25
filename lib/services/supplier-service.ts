import { requireSupabaseClient } from '../supabase';
import type { Supplier } from '../types';

export async function listSuppliers(includeInactive = false): Promise<Supplier[]> {
  const sb = requireSupabaseClient();
  let q = sb.from('suppliers').select('*').order('name');
  if (!includeInactive) q = q.eq('is_active', true);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Supplier[];
}

export async function getSupplier(id: string): Promise<Supplier | null> {
  const sb = requireSupabaseClient();
  const { data, error } = await sb.from('suppliers').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Supplier) ?? null;
}

export async function createSupplier(input: Omit<Supplier, 'id' | 'is_active' | 'created_at' | 'updated_at'>): Promise<Supplier> {
  const sb = requireSupabaseClient();
  const { data, error } = await sb
    .from('suppliers')
    .insert({ ...input, is_active: true })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Supplier;
}

export async function updateSupplier(
  id: string,
  patch: Partial<Omit<Supplier, 'id' | 'created_at'>>
): Promise<Supplier> {
  const sb = requireSupabaseClient();
  const { data, error } = await sb
    .from('suppliers')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Supplier;
}

/** RN-09: soft delete */
export async function deactivateSupplier(id: string): Promise<void> {
  await updateSupplier(id, { is_active: false });
}
