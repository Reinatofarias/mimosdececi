import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { createAdminClient } from './supabase/admin';

export async function recordAuditLog(input: {
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const session = await getServerSession(authOptions);
    const supabase = createAdminClient();

    const { error } = await supabase.from('audit_logs').insert([{
      actor_email: session?.user?.email || null,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId || null,
      metadata: input.metadata || {},
    }]);

    if (error && !error.message.toLowerCase().includes('audit_logs')) {
      console.error('[audit] failed to write log', error);
    }
  } catch (error) {
    console.error('[audit] unexpected failure', error);
  }
}
