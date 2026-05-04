import fs from 'fs/promises';
import path from 'path';

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

/**
 * Lee el archivo de usuarios del seed
 */
export async function readUsersFromSeed(): Promise<User[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'users.json');
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as User[];
  } catch (err) {
    console.error('Error reading users from seed:', err);
    return [];
  }
}

/**
 * Busca un usuario por email en el seed
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await readUsersFromSeed();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Busca un usuario por ID en el seed
 */
export async function findUserById(id: string): Promise<User | null> {
  const users = await readUsersFromSeed();
  return users.find((u) => u.id === id) || null;
}

/**
 * Obtiene todos los usuarios (solo en seed mode)
 */
export async function getAllUsers(): Promise<User[]> {
  return readUsersFromSeed();
}

/**
 * Validar que el sistema está en modo seed (solo lee datos, no escribe)
 */
export function isSeedMode(): boolean {
  // Retorna true mientras no haya Supabase configurado
  return !process.env.SUPABASE_URL;
}
