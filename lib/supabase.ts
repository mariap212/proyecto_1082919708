import { createClient, SupabaseClient } from '@supabase/supabase-js';
import postgres from 'postgres';

/**
 * Cliente Supabase build-safe.
 * Retorna null si no hay credenciales (NO lanza error) para que
 * `next build` pueda pre-renderizar páginas estáticas sin fallar.
 *
 * Usa la integración OVODIST de Supabase (variables con prefijo
 * SUPABASE_OVODIST_*). En backend usamos la SERVICE_ROLE_KEY
 * para saltar RLS, ya que la app maneja su propia autenticación
 * con JWT en cookies.
 */

let _client: SupabaseClient | null = null;
let _checked = false;

function readEnv(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

export function getSupabaseClient(): SupabaseClient | null {
  if (_client) return _client;
  if (_checked) return null;

  // ⚠ Nombres EXACTOS que inyecta la integración OVODIST en Vercel.
  // NO renombrar ni añadir fallbacks — debe coincidir 1:1 con Vercel.
  const url = readEnv('SUPABASE_OVODIST_SUPABASE_URL');

  const key =
    readEnv('SUPABASE_OVODIST_SUPABASE_SERVICE_ROLE_KEY') ??
    readEnv('SUPABASE_OVODIST_SUPABASE_SECRET_KEY');

  _checked = true;

  if (!url || !key) {
    console.warn('[supabase] No configurado — retornando null (build-safe)');
    return null;
  }

  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return _client;
}

export function requireSupabaseClient(): SupabaseClient {
  const c = getSupabaseClient();
  if (!c) {
    throw new Error(
      'Supabase no está configurado. Define SUPABASE_OVODIST_SUPABASE_URL y SUPABASE_OVODIST_SUPABASE_SERVICE_ROLE_KEY en .env.local'
    );
  }
  return c;
}

/**
 * Ejecuta DDL arbitrario (CREATE TABLE, ALTER, etc.) usando
 * una conexión PostgreSQL directa. El JS client de Supabase
 * usa PostgREST y NO puede ejecutar DDL.
 *
 * Recuerda terminar tus migraciones con:
 *   NOTIFY pgrst, 'reload schema';
 */
export async function executeSql(query: string): Promise<void> {
  const connString =
    readEnv('SUPABASE_OVODIST_POSTGRES_URL_NON_POOLING') ??
    readEnv('SUPABASE_OVODIST_POSTGRES_URL') ??
    readEnv('SUPABASE_OVODIST_POSTGRES_PRISMA_URL');

  if (!connString) {
    throw new Error(
      'POSTGRES_URL no configurado. Define SUPABASE_OVODIST_POSTGRES_URL_NON_POOLING en .env.local'
    );
  }

  const sql = postgres(connString, {
    ssl: 'require',
    connect_timeout: 10,
    idle_timeout: 5,
    max: 1,
  });

  try {
    await sql.unsafe(query);
  } finally {
    await sql.end();
  }
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null;
}
