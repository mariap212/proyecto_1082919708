import { requireSupabaseClient } from '../supabase';
import type { Client } from '../types';

export interface ClientListFilters {
  includeInactive?: boolean;
  q?: string;
}

export async function listClients(filters: ClientListFilters | boolean = {}): Promise<Client[]> {
  const opts: ClientListFilters = typeof filters === 'boolean' ? { includeInactive: filters } : filters;
  const sb = requireSupabaseClient();
  let q = sb.from('clients').select('*').order('name');
  if (!opts.includeInactive) q = q.eq('is_active', true);
  if (opts.q) q = q.or(`name.ilike.%${opts.q}%,nit.ilike.%${opts.q}%`);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Client[];
}

export async function getClient(id: string): Promise<Client | null> {
  const sb = requireSupabaseClient();
  const { data, error } = await sb.from('clients').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Client) ?? null;
}

export async function createClient(input: Omit<Client, 'id' | 'is_active' | 'created_at' | 'updated_at'>): Promise<Client> {
  const sb = requireSupabaseClient();
  const { data, error } = await sb
    .from('clients')
    .insert({ ...input, is_active: true })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Client;
}

export async function updateClient(
  id: string,
  patch: Partial<Omit<Client, 'id' | 'created_at'>>
): Promise<Client> {
  const sb = requireSupabaseClient();
  const { data, error } = await sb
    .from('clients')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Client;
}

/** RN-09: soft delete */
export async function deactivateClient(id: string): Promise<void> {
  await updateClient(id, { is_active: false });
}
