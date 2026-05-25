import { requireSupabaseClient } from '../supabase';
import type { EggType } from '../types';

export async function listEggTypes(includeInactive = false): Promise<EggType[]> {
  const sb = requireSupabaseClient();
  let q = sb.from('egg_types').select('*').order('code', { ascending: true });
  if (!includeInactive) q = q.eq('is_active', true);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as EggType[];
}

export async function getEggType(id: string): Promise<EggType | null> {
  const sb = requireSupabaseClient();
  const { data, error } = await sb.from('egg_types').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as EggType) ?? null;
}

export async function createEggType(input: {
  name: string;
  code: string;
  price_per_unit: number;
  min_stock?: number;
}): Promise<EggType> {
  const sb = requireSupabaseClient();
  const { data, error } = await sb
    .from('egg_types')
    .insert({
      name: input.name,
      code: input.code.toUpperCase(),
      price_per_unit: input.price_per_unit,
      min_stock: input.min_stock ?? 100,
      is_active: true,
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);

  // Crea fila inventory en 0 (RN-02)
  await sb.from('inventory').insert({ egg_type_id: data!.id, current_stock: 0 });
  return data as EggType;
}

export async function updateEggType(
  id: string,
  patch: Partial<Pick<EggType, 'name' | 'price_per_unit' | 'min_stock' | 'is_active'>>
): Promise<EggType> {
  const sb = requireSupabaseClient();
  const { data, error } = await sb
    .from('egg_types')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as EggType;
}
