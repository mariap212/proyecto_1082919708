-- Migration: 0005_init_orders.sql
-- Description: Create orders and order_items tables
-- Date: 2026-05-04

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

-- Order items with snapshot of price at time of order creation
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
