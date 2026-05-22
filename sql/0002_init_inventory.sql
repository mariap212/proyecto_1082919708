-- Migration: 0002_init_inventory.sql
-- Description: Create inventory and egg_types tables with movement tracking
-- Date: 2026-05-04

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

-- Current stock per egg type (1 row per egg type)
CREATE TABLE IF NOT EXISTS inventory (
  id            UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  egg_type_id   UUID    UNIQUE NOT NULL REFERENCES egg_types(id) ON DELETE CASCADE,
  current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Historical record of all inventory movements
CREATE TABLE IF NOT EXISTS inventory_movements (
  id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  egg_type_id  UUID         NOT NULL REFERENCES egg_types(id) ON DELETE CASCADE,
  type         VARCHAR(12)  NOT NULL CHECK (type IN ('entrada','salida','devolucion','ajuste')),
  quantity     INTEGER      NOT NULL CHECK (quantity > 0),
  reference_id UUID,        -- order or delivery related (nullable)
  supplier_id  UUID,        -- only for entries (nullable)
  notes        TEXT,
  recorded_by  UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inv_mov_egg_type ON inventory_movements(egg_type_id);
CREATE INDEX IF NOT EXISTS idx_inv_mov_date     ON inventory_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inv_mov_type     ON inventory_movements(type);

INSERT INTO _migrations (filename) VALUES ('0002_init_inventory.sql') ON CONFLICT DO NOTHING;
