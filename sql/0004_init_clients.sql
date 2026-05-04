-- Migration: 0004_init_clients.sql
-- Description: Create clients table for wholesale customers
-- Date: 2026-05-04

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
