-- ALL_MIGRATIONS.sql
-- Execute all database migrations for OvoGest
-- 
-- IMPORTANT: Run these migrations in order in Supabase SQL Editor
-- or copy them one by one if you encounter issues

-- ============================================================================
-- Migration: 0001_init_users.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 VARCHAR(100) NOT NULL,
  email                VARCHAR(255) UNIQUE NOT NULL,
  password_hash        TEXT         NOT NULL,
  role                 VARCHAR(15)  NOT NULL
                       CHECK (role IN ('admin','vendedor','bodeguero','conductor')),
  is_active            BOOLEAN      DEFAULT true,
  must_change_password BOOLEAN      DEFAULT false,
  last_login_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);

CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);

INSERT INTO _migrations (filename) VALUES ('0001_init_users.sql') ON CONFLICT DO NOTHING;

-- ============================================================================
-- Migration: 0002_init_inventory.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS egg_types (
  id             UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  name           VARCHAR(80)   NOT NULL,
  code           VARCHAR(5)    UNIQUE NOT NULL,
  price_per_unit DECIMAL(10,2) NOT NULL CHECK (price_per_unit > 0),
  min_stock      INTEGER       NOT NULL DEFAULT 100 CHECK (min_stock >= 0),
  is_active      BOOLEAN       DEFAULT true,
  created_at     TIMESTAMPTZ   DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
  id            UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  egg_type_id   UUID    UNIQUE NOT NULL REFERENCES egg_types(id) ON DELETE CASCADE,
  current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  egg_type_id  UUID         NOT NULL REFERENCES egg_types(id) ON DELETE CASCADE,
  type         VARCHAR(12)  NOT NULL CHECK (type IN ('entrada','salida','devolucion','ajuste')),
  quantity     INTEGER      NOT NULL CHECK (quantity > 0),
  reference_id UUID,
  supplier_id  UUID,
  notes        TEXT,
  recorded_by  UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inv_mov_egg_type ON inventory_movements(egg_type_id);
CREATE INDEX IF NOT EXISTS idx_inv_mov_date     ON inventory_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inv_mov_type     ON inventory_movements(type);

INSERT INTO _migrations (filename) VALUES ('0002_init_inventory.sql') ON CONFLICT DO NOTHING;

-- ============================================================================
-- Migration: 0003_init_suppliers.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS suppliers (
  id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  contact    VARCHAR(100),
  phone      VARCHAR(20),
  address    TEXT,
  notes      TEXT,
  is_active  BOOLEAN      DEFAULT true,
  created_at TIMESTAMPTZ  DEFAULT NOW(),
  updated_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

INSERT INTO _migrations (filename) VALUES ('0003_init_suppliers.sql') ON CONFLICT DO NOTHING;

-- ============================================================================
-- Migration: 0004_init_clients.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS clients (
  id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  nit        VARCHAR(20)  UNIQUE NOT NULL,
  phone      VARCHAR(20),
  address    TEXT,
  notes      TEXT,
  is_active  BOOLEAN      DEFAULT true,
  created_at TIMESTAMPTZ  DEFAULT NOW(),
  updated_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_nit ON clients(nit);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

INSERT INTO _migrations (filename) VALUES ('0004_init_clients.sql') ON CONFLICT DO NOTHING;

-- ============================================================================
-- Migration: 0005_init_orders.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id   UUID          NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  status      VARCHAR(12)   NOT NULL DEFAULT 'pendiente'
              CHECK (status IN ('pendiente','aprobado','cancelado')),
  total       DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes       TEXT,
  created_by  UUID          REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID          REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ   DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id    UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  egg_type_id UUID          NOT NULL REFERENCES egg_types(id) ON DELETE RESTRICT,
  quantity    INTEGER       NOT NULL CHECK (quantity >= 30),
  unit_price  DECIMAL(10,2) NOT NULL,
  subtotal    DECIMAL(12,2) NOT NULL,
  created_at  TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date   ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items   ON order_items(order_id);

INSERT INTO _migrations (filename) VALUES ('0005_init_orders.sql') ON CONFLICT DO NOTHING;

-- ============================================================================
-- Migration: 0006_init_deliveries_invoices.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS deliveries (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id       UUID        UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  driver_id      UUID        REFERENCES users(id) ON DELETE SET NULL,
  status         VARCHAR(25) NOT NULL DEFAULT 'pendiente_asignacion'
                 CHECK (status IN ('pendiente_asignacion','asignada','en_camino','entregada','fallida')),
  incident_note  TEXT,
  assigned_by    UUID        REFERENCES users(id) ON DELETE SET NULL,
  assigned_at    TIMESTAMPTZ,
  delivered_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id             UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id       UUID          UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number INTEGER       UNIQUE NOT NULL,
  total          DECIMAL(12,2) NOT NULL,
  is_voided      BOOLEAN       DEFAULT false,
  void_reason    TEXT,
  voided_by      UUID          REFERENCES users(id) ON DELETE SET NULL,
  voided_at      TIMESTAMPTZ,
  created_at     TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_driver ON deliveries(driver_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_date   ON deliveries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_number   ON invoices(invoice_number DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_date     ON invoices(created_at DESC);

INSERT INTO _migrations (filename) VALUES ('0006_init_deliveries_invoices.sql') ON CONFLICT DO NOTHING;

-- ============================================================================
-- Migrations completed successfully!
-- ============================================================================
