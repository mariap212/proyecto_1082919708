import { requireSupabaseClient } from '../supabase';
import { hashPassword } from '../auth';
import type { Role, User } from '../types';

export async function listUsers(): Promise<User[]> {
  const sb = requireSupabaseClient();
  const { data, error } = await sb
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as User[];
}

export async function getUser(id: string): Promise<User | null> {
  const sb = requireSupabaseClient();
  const { data, error } = await sb.from('users').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as User) ?? null;
}

export async function createUser(input: {
  name: string;
  email: string;
  role: Role;
  password: string;
}): Promise<User> {
  const sb = requireSupabaseClient();
  const password_hash = await hashPassword(input.password);
  const { data, error } = await sb
    .from('users')
    .insert({
      name: input.name,
      email: input.email.toLowerCase(),
      role: input.role,
      password_hash,
      is_active: true,
      must_change_password: true,
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as User;
}

export async function updateUser(
  id: string,
  patch: Partial<{ name: string; role: Role; is_active: boolean; password: string }>
): Promise<User> {
  const sb = requireSupabaseClient();
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.role !== undefined) update.role = patch.role;
  if (patch.is_active !== undefined) update.is_active = patch.is_active;
  if (patch.password) {
    update.password_hash = await hashPassword(patch.password);
    update.must_change_password = true;
  }
  const { data, error } = await sb
    .from('users')
    .update(update)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as User;
}
