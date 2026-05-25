import { getSupabaseClient } from '../supabase';
import type { AuditAction, AuditLog, AuditResource } from '../types';
import type { AuthSession } from '../auth';

export interface RecordAuditInput {
  actor: AuthSession | { id: string; email: string; role: string };
  action: AuditAction;
  resource_type: AuditResource;
  resource_id?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Registra una acción en audit_logs.
 *
 * NUNCA debe romper el flujo principal: si la auditoría falla,
 * se loguea por consola pero la operación de negocio sigue.
 * No bloquea la respuesta al usuario.
 */
export async function recordAudit(input: RecordAuditInput): Promise<void> {
  try {
    const sb = getSupabaseClient();
    if (!sb) {
      console.warn('[audit] Supabase no configurado — auditoría omitida');
      return;
    }
    const { error } = await sb.from('audit_logs').insert({
      actor_id: input.actor.id,
      actor_email: input.actor.email,
      actor_role: input.actor.role,
      action: input.action,
      resource_type: input.resource_type,
      resource_id: input.resource_id ?? null,
      metadata: input.metadata ?? null,
    });
    if (error) {
      console.error('[audit] insert failed:', error.message);
    }
  } catch (e) {
    console.error('[audit] unexpected error:', (e as Error).message);
  }
}

export interface AuditListFilters {
  q?: string;            // searches actor_email
  action?: AuditAction;
  resource_type?: AuditResource;
  resource_id?: string;
  actor_id?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export async function listAuditLogs(filters: AuditListFilters = {}): Promise<{
  items: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}> {
  const sb = getSupabaseClient();
  if (!sb) return { items: [], total: 0, limit: 0, offset: 0 };

  const limit = Math.min(100, filters.limit ?? 25);
  const offset = filters.offset ?? 0;

  let q = sb.from('audit_logs').select('*', { count: 'exact' }).order('created_at', { ascending: false });
  if (filters.action) q = q.eq('action', filters.action);
  if (filters.resource_type) q = q.eq('resource_type', filters.resource_type);
  if (filters.resource_id) q = q.eq('resource_id', filters.resource_id);
  if (filters.actor_id) q = q.eq('actor_id', filters.actor_id);
  if (filters.from) q = q.gte('created_at', filters.from);
  if (filters.to) q = q.lte('created_at', filters.to);
  if (filters.q) q = q.ilike('actor_email', `%${filters.q}%`);
  q = q.range(offset, offset + limit - 1);

  const { data, error, count } = await q;
  if (error) throw new Error(error.message);
  return { items: (data ?? []) as AuditLog[], total: count ?? 0, limit, offset };
}
