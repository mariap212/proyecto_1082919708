import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Tipos para los datos seed
interface SeedUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'vendedor' | 'bodeguero' | 'conductor';
  is_active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
  created_at: string;
}

interface SeedEggType {
  id: string;
  name: string;
  code: string;
  price_per_unit: number;
  min_stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SeedSupplier {
  id: string;
  name: string;
  contact: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SeedConfig {
  initialized: boolean;
  initialized_at: string;
  version: string;
}

export async function POST(): Promise<NextResponse> {
  try {
    const dataDir = path.join(process.cwd(), 'data');

    // Verificar si ya está inicializado
    try {
      const configPath = path.join(dataDir, 'config.json');
      const configContent = await fs.readFile(configPath, 'utf-8');
      const config: SeedConfig = JSON.parse(configContent);

      if (config.initialized) {
        return NextResponse.json(
          { error: 'La base de datos ya ha sido inicializada' },
          { status: 400 }
        );
      }
    } catch {
      // Config no existe, continuar con inicialización
    }

    // Crear directorio data si no existe
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }

    const now = new Date().toISOString();

    // 1. Crear usuarios seed
    const adminPassword = await bcrypt.hash('admin123', 12);
    const seedUsers: SeedUser[] = [
      {
        id: uuidv4(),
        name: 'Administrador',
        email: 'admin@ovogest.com',
        password_hash: adminPassword,
        role: 'admin',
        is_active: true,
        must_change_password: true,
        last_login_at: null,
        created_at: now,
      },
      {
        id: uuidv4(),
        name: 'Juan Vendedor',
        email: 'vendedor@ovogest.com',
        password_hash: await bcrypt.hash('vendedor123', 12),
        role: 'vendedor',
        is_active: true,
        must_change_password: false,
        last_login_at: null,
        created_at: now,
      },
    ];

    // 2. Crear tipos de huevos
    const seedEggTypes: SeedEggType[] = [
      {
        id: uuidv4(),
        name: 'Huevos Tipo AA Extra',
        code: 'AA',
        price_per_unit: 280.00, // precio por unidad (30 huevos)
        min_stock: 100, // mínimo 100 unidades
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Huevos Tipo A',
        code: 'A',
        price_per_unit: 250.00,
        min_stock: 100,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Huevos Tipo B',
        code: 'B',
        price_per_unit: 220.00,
        min_stock: 100,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Huevos Tipo C',
        code: 'C',
        price_per_unit: 200.00,
        min_stock: 100,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ];

    // 3. Crear proveedores de ejemplo
    const seedSuppliers: SeedSupplier[] = [
      {
        id: uuidv4(),
        name: 'Granja Los Andes',
        contact: 'Carlos Rodríguez',
        phone: '+57 300 123 4567',
        address: 'Finca Los Andes, km 15 vía a Girardot',
        notes: 'Proveedor principal de huevos AA y A',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Avícola Santa María',
        contact: 'María González',
        phone: '+57 301 987 6543',
        address: 'Zona rural, Municipio de Silvania',
        notes: 'Especializada en huevos orgánicos',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ];

    // 4. Crear configuración inicial
    const seedConfig: SeedConfig = {
      initialized: true,
      initialized_at: now,
      version: '1.0.0',
    };

    // Guardar archivos JSON
    await fs.writeFile(
      path.join(dataDir, 'users.json'),
      JSON.stringify(seedUsers, null, 2)
    );

    await fs.writeFile(
      path.join(dataDir, 'egg-types.json'),
      JSON.stringify(seedEggTypes, null, 2)
    );

    await fs.writeFile(
      path.join(dataDir, 'suppliers.json'),
      JSON.stringify(seedSuppliers, null, 2)
    );

    await fs.writeFile(
      path.join(dataDir, 'config.json'),
      JSON.stringify(seedConfig, null, 2)
    );

    // Crear archivos adicionales vacíos para futuras funcionalidades
    await fs.writeFile(
      path.join(dataDir, 'inventory.json'),
      JSON.stringify([], null, 2)
    );

    await fs.writeFile(
      path.join(dataDir, 'clients.json'),
      JSON.stringify([], null, 2)
    );

    await fs.writeFile(
      path.join(dataDir, 'orders.json'),
      JSON.stringify([], null, 2)
    );

    return NextResponse.json({
      success: true,
      message: 'Base de datos inicializada exitosamente',
      data: {
        users_created: seedUsers.length,
        egg_types_created: seedEggTypes.length,
        suppliers_created: seedSuppliers.length,
      }
    });

  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al inicializar la base de datos' },
      { status: 500 }
    );
  }
}