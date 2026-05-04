-- Migration: 0003_init_suppliers.sql
-- Description: Create suppliers table
-- Date: 2026-05-04

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
