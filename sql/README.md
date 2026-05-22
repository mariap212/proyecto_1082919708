# 📊 Migraciones de Base de Datos — OvoGest

## Descripción

Este directorio contiene todas las migraciones SQL para OvoGest en Supabase PostgreSQL.

## Estructura

```
sql/
├── 0001_init_users.sql                  # Usuarios y control de acceso
├── 0002_init_inventory.sql              # Inventario y movimientos
├── 0003_init_suppliers.sql              # Proveedores
├── 0004_init_clients.sql                # Clientes mayoristas
├── 0005_init_orders.sql                 # Pedidos e ítems
├── 0006_init_deliveries_invoices.sql    # Entregas y facturas
├── ALL_MIGRATIONS.sql                   # Todas las migraciones en un archivo
└── README.md                            # Este archivo
```

## 🚀 Cómo Ejecutar

### Opción 1: Ejecutar todas las migraciones (RECOMENDADO)

1. Abre [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** (lado izquierdo)
4. Haz click en **+ New Query**
5. Abre el archivo `sql/ALL_MIGRATIONS.sql` en tu editor de texto
6. Copia TODO el contenido
7. Pégalo en el SQL Editor de Supabase
8. Haz click en **▶ Execute**

### Opción 2: Ejecutar migraciones una por una

Si la opción 1 genera errores, ejecuta cada migración por separado:

1. En SQL Editor, crea una nueva query
2. Abre `sql/0001_init_users.sql` y cópialo
3. Pégalo en Supabase y ejecuta
4. Repite con `0002_`, `0003_`, etc. en orden

### Opción 3: Desde terminal (con Supabase CLI)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Autenticarse
supabase login

# Listar proyectos
supabase projects list

# Crear migración nueva
supabase migration new init_ovogest

# Ejecutar migraciones
supabase db push
```

## 📋 Tablas Creadas

### 1. `users`
Usuarios del sistema con roles (admin, vendedor, bodeguero, conductor).

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `name` | VARCHAR(100) | Nombre completo |
| `email` | VARCHAR(255) | Único, índice para búsqueda |
| `password_hash` | TEXT | Hash bcryptjs o SHA-256 |
| `role` | VARCHAR(15) | admin \| vendedor \| bodeguero \| conductor |
| `is_active` | BOOLEAN | Para desactivar sin borrar |
| `must_change_password` | BOOLEAN | Fuerza cambio en primer login |
| `last_login_at` | TIMESTAMPTZ | Nullable, se actualiza en login |
| `created_at` | TIMESTAMPTZ | Auto NOW() |

### 2. `egg_types`
Catálogo de tipos de huevos (AA, A, B, XL, etc.).

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `name` | VARCHAR(80) | "Huevos AA Extra" |
| `code` | VARCHAR(5) | "AA", "A", "B", "XL" |
| `price_per_unit` | DECIMAL(10,2) | Precio actual por unidad |
| `min_stock` | INTEGER | Nivel mínimo para alerta |
| `is_active` | BOOLEAN | Para desactivar categorías |
| `created_at` | TIMESTAMPTZ | Auto NOW() |
| `updated_at` | TIMESTAMPTZ | Auto NOW() |

### 3. `inventory`
Stock actual por tipo de huevo (1 fila por tipo).

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `egg_type_id` | UUID | Foreign Key a egg_types, UNIQUE |
| `current_stock` | INTEGER | Stock actual en unidades |
| `updated_at` | TIMESTAMPTZ | Se actualiza con cada movimiento |

### 4. `inventory_movements`
Registro histórico de todas las entradas/salidas.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `egg_type_id` | UUID | Foreign Key a egg_types |
| `type` | VARCHAR(12) | entrada \| salida \| devolucion \| ajuste |
| `quantity` | INTEGER | Cantidad movida |
| `reference_id` | UUID | Nullable: pedido o entrega relacionada |
| `supplier_id` | UUID | Nullable: proveedor (solo para entrada) |
| `notes` | TEXT | Notas adicionales |
| `recorded_by` | UUID | Foreign Key a users (quien registró) |
| `created_at` | TIMESTAMPTZ | Timestamp del movimiento |

### 5. `suppliers`
Catálogo de proveedores (granjas).

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `name` | VARCHAR(150) | Nombre de la granja |
| `contact` | VARCHAR(100) | Persona de contacto |
| `phone` | VARCHAR(20) | Teléfono |
| `address` | TEXT | Dirección |
| `notes` | TEXT | Notas |
| `is_active` | BOOLEAN | Para desactivar |
| `created_at` | TIMESTAMPTZ | Auto NOW() |
| `updated_at` | TIMESTAMPTZ | Auto NOW() |

### 6. `clients`
Clientes mayoristas.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `name` | VARCHAR(150) | Nombre de la empresa |
| `nit` | VARCHAR(20) | Número de identificación único |
| `phone` | VARCHAR(20) | Teléfono |
| `address` | TEXT | Dirección de entrega |
| `notes` | TEXT | Notas |
| `is_active` | BOOLEAN | Para desactivar |
| `created_at` | TIMESTAMPTZ | Auto NOW() |
| `updated_at` | TIMESTAMPTZ | Auto NOW() |

### 7. `orders`
Pedidos de clientes.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `client_id` | UUID | Foreign Key a clients (RESTRICT) |
| `status` | VARCHAR(12) | pendiente \| aprobado \| cancelado |
| `total` | DECIMAL(12,2) | Total del pedido |
| `notes` | TEXT | Notas especiales del pedido |
| `created_by` | UUID | Foreign Key a users (quien creó) |
| `approved_by` | UUID | Foreign Key a users (quien aprobó) |
| `approved_at` | TIMESTAMPTZ | Cuándo fue aprobado |
| `created_at` | TIMESTAMPTZ | Auto NOW() |
| `updated_at` | TIMESTAMPTZ | Auto NOW() |

### 8. `order_items`
Ítems dentro de cada pedido.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `order_id` | UUID | Foreign Key a orders (CASCADE) |
| `egg_type_id` | UUID | Foreign Key a egg_types (RESTRICT) |
| `quantity` | INTEGER | Cantidad (mínimo 30) |
| `unit_price` | DECIMAL(10,2) | Precio al momento del pedido (snapshot) |
| `subtotal` | DECIMAL(12,2) | quantity × unit_price |
| `created_at` | TIMESTAMPTZ | Auto NOW() |

### 9. `deliveries`
Entregas de pedidos (1:1 con orders).

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `order_id` | UUID | Foreign Key a orders, UNIQUE (1:1) |
| `driver_id` | UUID | Foreign Key a users (conductor) |
| `status` | VARCHAR(25) | pendiente_asignacion \| asignada \| en_camino \| entregada \| fallida |
| `incident_note` | TEXT | Notas de incidentes o problemas |
| `assigned_by` | UUID | Foreign Key a users (quién asignó) |
| `assigned_at` | TIMESTAMPTZ | Cuándo se asignó al conductor |
| `delivered_at` | TIMESTAMPTZ | Cuándo se entregó |
| `created_at` | TIMESTAMPTZ | Auto NOW() |
| `updated_at` | TIMESTAMPTZ | Auto NOW() |

### 10. `invoices`
Facturas de pedidos aprobados (1:1 con orders).

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Primary Key |
| `order_id` | UUID | Foreign Key a orders, UNIQUE (1:1) |
| `invoice_number` | INTEGER | Número consecutivo único |
| `total` | DECIMAL(12,2) | Copia del total del pedido |
| `is_voided` | BOOLEAN | Si fue anulada |
| `void_reason` | TEXT | Razón de anulación |
| `voided_by` | UUID | Foreign Key a users (quién anuló) |
| `voided_at` | TIMESTAMPTZ | Cuándo se anuló |
| `created_at` | TIMESTAMPTZ | Auto NOW() |

### 11. `_migrations` (Sistema)
Tabla de control para rastrear migraciones ejecutadas.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | SERIAL | Primary Key auto-incrementable |
| `filename` | VARCHAR(255) | Nombre del archivo migración |
| `applied_at` | TIMESTAMPTZ | Cuándo se aplicó |

## 🔍 Verificar Migraciones

Después de ejecutar, verifica que las tablas se crearon:

```sql
-- Ver todas las tablas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Ver migraciones aplicadas
SELECT * FROM _migrations ORDER BY applied_at;

-- Contar registros en cada tabla
SELECT 'users' as tabla, COUNT(*) FROM users
UNION ALL
SELECT 'egg_types', COUNT(*) FROM egg_types
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'deliveries', COUNT(*) FROM deliveries;
```

## ⚠️ Troubleshooting

### Error: "relation already exists"

Significa que las tablas ya existen. Esto es normal si ejecutas las migraciones dos veces. Las migraciones usan `CREATE TABLE IF NOT EXISTS`, así que es seguro ejecutarlas de nuevo.

### Error: "foreign key constraint failed"

Asegúrate de ejecutar las migraciones en orden:
1. `0001_` (users)
2. `0002_` (egg_types, inventory)
3. `0003_` (suppliers)
4. `0004_` (clients)
5. `0005_` (orders)
6. `0006_` (deliveries, invoices)

### Error: "syntax error near..."

- Verifica que copiaste TODO el SQL correctamente
- Comprueba que no hay caracteres extraños
- Intenta ejecutar migración por migración en lugar de todas juntas

### Las tablas se ven vacías

Esto es normal. Las migraciones solo crean la estructura. Los datos se insertarán a través de:
- API de la aplicación (POST /api/orders, etc.)
- Seed de datos (próxima fase)
- Panel de admin bootstrap

## 📝 Próximos Pasos

1. **Seed de datos:** Crear tipos de huevos iniciales (AA, A, B, XL)
2. **Bootstrap API:** Endpoint para insertar datos iniciales
3. **Supabase Auth:** Integración con autenticación nativa de Supabase
4. **Row Level Security (RLS):** Policies para controlar acceso por usuario
5. **Backups:** Configurar backup automático en Supabase

## 📚 Referencias

- [Supabase SQL Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [UUID en PostgreSQL](https://www.postgresql.org/docs/current/datatype-uuid.html)

---

**Última actualización:** 4 de mayo de 2026  
**Estado:** Listo para ejecutar en Supabase  
**Soporte:** Revisa el archivo PLAN_OVODIST.md sección 12 para más detalles
