import fs from 'fs/promises';
import path from 'path';
import { getSupabaseClient } from './supabase';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'vendedor' | 'bodeguero' | 'conductor';
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

async function readUsersFromSeed(): Promise<User[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'users.json');
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as User[];
  } catch {
    return [];
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const sb = getSupabaseClient();

  if (sb) {
    const { data, error } = await sb
      .from('users')
      .select('*')
      .ilike('email', email)
      .maybeSingle();

    if (!error && data) return data as User;
    if (error) {
      console.warn('[data-service] Supabase no disponible, usando seed:', error.message);
    }
  }

  const users = await readUsersFromSeed();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const sb = getSupabaseClient();

  if (sb) {
    const { data, error } = await sb
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) return data as User;
    if (error) {
      console.warn('[data-service] Supabase no disponible, usando seed:', error.message);
    }
  }

  const users = await readUsersFromSeed();
  return users.find((u) => u.id === id) ?? null;
}

export async function getAllUsers(): Promise<User[]> {
  const sb = getSupabaseClient();

  if (sb) {
    const { data, error } = await sb
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) return data as User[];
    if (error) {
      console.warn('[data-service] Supabase no disponible, usando seed:', error.message);
    }
  }

  return readUsersFromSeed();
}

export function isSeedMode(): boolean {
  return !process.env.SUPABASE_OVODIST_SUPABASE_URL;
}
