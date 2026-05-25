-- Migration: 0007_init_audit_logs.sql
-- Description: Audit log table for tracking critical actions
-- Date: 2026-05-25

CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id      UUID         REFERENCES users(id) ON DELETE SET NULL,
  actor_email   VARCHAR(255),
  actor_role    VARCHAR(15),
  action        VARCHAR(50)  NOT NULL,
  resource_type VARCHAR(30)  NOT NULL,
  resource_id   UUID,
  metadata      JSONB,
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor    ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_action   ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_date     ON audit_logs(created_at DESC);

INSERT INTO _migrations (filename) VALUES ('0007_init_audit_logs.sql') ON CONFLICT DO NOTHING;

NOTIFY pgrst, 'reload schema';
