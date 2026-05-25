import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { executeSql, getSupabaseClient } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Inicializa el esquema y datos seed en Supabase.
 *
 * IMPORTANTE: Vercel = filesystem read-only.
 * Toda escritura va a Supabase (Postgres), no a disco.
 *
 * - Ejecuta sql/ALL_MIGRATIONS.sql (DDL) usando conexión directa a Postgres
 * - Inserta usuarios seed (4 roles) con bcrypt
 * - Inserta tipos de huevo, suppliers y clients de ejemplo
 * - Crea filas de inventory en 0 por cada tipo
 *
 * Sin parámetros. Idempotente: usa ON CONFLICT y reseed solo si está vacío.
 */
export async function POST(): Promise<NextResponse> {
  try {
    const sb = getSupabaseClient();
    if (!sb) {
      return NextResponse.json(
        {
          error:
            'Supabase no configurado. Define SUPABASE_OVODIST_SUPABASE_URL y SUPABASE_OVODIST_SUPABASE_SERVICE_ROLE_KEY en .env.local',
        },
        { status: 500 }
      );
    }

    // 1) DDL
    const migrationsPath = path.join(process.cwd(), 'sql', 'ALL_MIGRATIONS.sql');
    const ddl = await fs.readFile(migrationsPath, 'utf8');
    await executeSql(ddl);

    const summary: Record<string, number> = {};

    // 2) Seed usuarios (idempotente: UPSERT por email)
    const password = 'password123';
    const password_hash = await hashPassword(password);
    const users = [
      ['11111111-1111-1111-1111-111111111111', 'Administrador Sistema', 'admin@ovogest.local', 'admin'],
      ['22222222-2222-2222-2222-222222222222', 'Juan Vendedor', 'vendedor@ovogest.local', 'vendedor'],
      ['33333333-3333-3333-3333-333333333333', 'Carlos Bodeguero', 'bodeguero@ovogest.local', 'bodeguero'],
      ['44444444-4444-4444-4444-444444444444', 'Marco Conductor', 'conductor@ovogest.local', 'conductor'],
    ] as const;
    const { error: uErr } = await sb.from('users').upsert(
      users.map(([id, name, email, role]) => ({
        id,
        name,
        email,
        role,
        password_hash,
        is_active: true,
        must_change_password: false,
      })),
      { onConflict: 'email' }
    );
    if (uErr) throw new Error(`users seed: ${uErr.message}`);
    summary.users = users.length;

    // 3) Egg types
    const eggs = [
      { name: 'Huevo AA', code: 'AA', price_per_unit: 650, min_stock: 100 },
      { name: 'Huevo A', code: 'A', price_per_unit: 550, min_stock: 100 },
      { name: 'Huevo B', code: 'B', price_per_unit: 450, min_stock: 100 },
      { name: 'Huevo C', code: 'C', price_per_unit: 350, min_stock: 100 },
    ];
    const { error: eErr } = await sb.from('egg_types').upsert(eggs, { onConflict: 'code' });
    if (eErr) throw new Error(`egg_types seed: ${eErr.message}`);
    summary.egg_types = eggs.length;

    // 4) Inventory rows (uno por tipo, stock inicial 0)
    const { data: types } = await sb.from('egg_types').select('id');
    if (types?.length) {
      await sb.from('inventory').upsert(
        types.map((t) => ({ egg_type_id: t.id, current_stock: 0 })),
        { onConflict: 'egg_type_id', ignoreDuplicates: true }
      );
      summary.inventory_rows = types.length;
    }

    // 5) Suppliers / Clients (de ejemplo; solo si la tabla está vacía)
    const { count: supplierCount } = await sb.from('suppliers').select('*', { count: 'exact', head: true });
    if (!supplierCount) {
      await sb.from('suppliers').insert([
        { name: 'Granja Los Andes', contact: 'Carlos Rodríguez', phone: '+57 300 123 4567', address: 'Finca Los Andes, km 15 vía a Girardot', is_active: true },
        { name: 'Avícola Santa María', contact: 'María González', phone: '+57 301 987 6543', address: 'Zona rural, Silvania', is_active: true },
      ]);
      summary.suppliers = 2;
    }
    const { count: clientCount } = await sb.from('clients').select('*', { count: 'exact', head: true });
    if (!clientCount) {
      await sb.from('clients').insert([
        { name: 'Supermercado El Buen Precio', nit: '900123456-1', phone: '+57 310 555 1234', address: 'Cra 10 #20-30, Bogotá', is_active: true },
        { name: 'Distribuidora La Económica', nit: '901987654-2', phone: '+57 311 555 5678', address: 'Calle 80 #45-67, Medellín', is_active: true },
      ]);
      summary.clients = 2;
    }

    return NextResponse.json({
      success: true,
      message: 'Base de datos inicializada en Supabase',
      summary,
      credentials_hint: 'admin@ovogest.local / password123',
    });
  } catch (error) {
    console.error('[setup-database]', error);
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
