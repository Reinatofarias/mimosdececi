import { isAdminSession } from '@/lib/admin-auth';
import { getAuditLogs, summarizeAuditMetadata } from '@/lib/dal/audit-logs';

function csvEscape(value: unknown) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const isAdmin = await isAdminSession();
  if (!isAdmin) return new Response('Nao autorizado.', { status: 401 });

  const { searchParams } = new URL(request.url);
  const logs = await getAuditLogs({
    entityType: searchParams.get('entityType') || 'all',
    action: searchParams.get('action') || 'all',
    actor: searchParams.get('actor') || '',
    limit: 500,
  });

  const rows = [
    ['criado_em', 'ator', 'acao', 'entidade', 'entidade_id', 'detalhes'],
    ...logs.map((log) => [
      log.created_at,
      log.actor_email || 'Sistema',
      log.action,
      log.entity_type,
      log.entity_id || '',
      summarizeAuditMetadata(log.metadata),
    ]),
  ];
  const csv = rows.map((row) => row.map(csvEscape).join(',')).join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="auditoria-mimos-de-ceci.csv"',
    },
  });
}
