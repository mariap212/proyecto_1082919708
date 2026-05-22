-- Migration: 0006_init_deliveries_invoices.sql
-- Description: Create deliveries and invoices tables (1:1 with orders)
-- Date: 2026-05-04

-- 1:1 relationship with orders. Created automatically when order is approved.
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

-- 1:1 relationship with orders. Created automatically when order is approved.
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
