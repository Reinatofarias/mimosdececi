import { createAdminClient } from '../supabase/admin';

export type AuditLog = {
  id: string;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type AuditLogFilters = {
  entityType?: string;
  action?: string;
  actor?: string;
  limit?: number;
};

export async function getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLog[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from('audit_logs')
    .select('id, actor_email, action, entity_type, entity_id, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(Math.min(Math.max(filters.limit || 100, 1), 500));

  if (filters.entityType && filters.entityType !== 'all') {
    query = query.eq('entity_type', filters.entityType);
  }

  if (filters.action && filters.action !== 'all') {
    query = query.eq('action', filters.action);
  }

  if (filters.actor?.trim()) {
    query = query.ilike('actor_email', `%${filters.actor.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }

  return data as AuditLog[];
}

export function summarizeAuditMetadata(metadata: Record<string, unknown> | null) {
  if (!metadata) return '-';
  const entries = Object.entries(metadata).filter(([, value]) => value !== null && value !== undefined && value !== '');
  if (entries.length === 0) return '-';
  return entries.slice(0, 4).map(([key, value]) => `${key}: ${String(value)}`).join(' | ');
}
