import Link from 'next/link';
import { Download, Filter } from 'lucide-react';
import { getAuditLogs, summarizeAuditMetadata } from '@/lib/dal/audit-logs';

export const revalidate = 0;

type AuditPageProps = {
  searchParams: Promise<{
    entityType?: string;
    action?: string;
    actor?: string;
  }>;
};

const ENTITY_OPTIONS = [
  ['all', 'Todas entidades'],
  ['order', 'Pedidos'],
  ['product', 'Produtos'],
  ['product_image', 'Imagens'],
  ['coupon', 'Cupons'],
  ['category', 'Categorias'],
  ['settings', 'Configuracoes'],
  ['showcase_section', 'Vitrine'],
];

const ACTION_OPTIONS = [
  ['all', 'Todas acoes'],
  ['create', 'Criacao'],
  ['update', 'Edicao'],
  ['delete', 'Exclusao'],
  ['status_update', 'Status'],
  ['payment_update', 'Pagamento rapido'],
  ['order.payment_info_update', 'Pagamento detalhado'],
  ['order.details_update', 'Detalhes do pedido'],
  ['order.items_update', 'Itens do pedido'],
  ['order.production_update', 'Producao'],
  ['order.confirm', 'Confirmacao'],
  ['order.preorder', 'Pre-pedido'],
  ['coupon.create', 'Cupom criado'],
  ['coupon.toggle', 'Cupom ativo/inativo'],
  ['upload', 'Upload'],
  ['upload_failed', 'Falha de upload'],
];

function buildQueryString(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== 'all') query.set(key, value);
  });
  return query.toString();
}

function getActionColor(action: string) {
  if (action.includes('delete') || action.includes('failed')) return { bg: '#FEE2E2', text: '#991B1B' };
  if (action.includes('payment') || action.includes('confirm')) return { bg: '#DCFCE7', text: '#166534' };
  if (action.includes('production') || action.includes('status')) return { bg: '#FEF3C7', text: '#92400E' };
  return { bg: '#EEF2FF', text: '#3730A3' };
}

export default async function AuditPage({ searchParams }: AuditPageProps) {
  const params = await searchParams;
  const filters = {
    entityType: params.entityType || 'all',
    action: params.action || 'all',
    actor: params.actor || '',
  };
  const logs = await getAuditLogs({ ...filters, limit: 200 });
  const csvQuery = buildQueryString(filters);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', margin: 0 }}>Auditoria</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 6 }}>
            Acompanhe alteracoes administrativas, falhas operacionais e eventos importantes do painel.
          </p>
        </div>
        <Link href={`/admin/relatorios/auditoria.csv${csvQuery ? `?${csvQuery}` : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', textDecoration: 'none', fontWeight: 700 }}>
          <Download size={16} />
          Exportar CSV
        </Link>
      </div>

      <form action="/admin/auditoria" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) minmax(180px, 1fr) minmax(180px, 1fr) auto', gap: 'var(--space-md)', alignItems: 'end' }}>
        <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
          Entidade
          <select name="entityType" defaultValue={filters.entityType} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}>
            {ENTITY_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
          Acao
          <select name="action" defaultValue={filters.action} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}>
            {ACTION_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 700 }}>
          Ator
          <input name="actor" defaultValue={filters.actor} placeholder="email do admin" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
        </label>
        <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 0, borderRadius: 8, padding: '11px 14px', background: 'var(--color-primary)', color: 'white', fontWeight: 800, cursor: 'pointer' }}>
          <Filter size={16} />
          Filtrar
        </button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)' }}>
        {[
          ['Eventos exibidos', String(logs.length)],
          ['Acoes criticas', String(logs.filter((log) => log.action.includes('delete') || log.action.includes('failed')).length)],
          ['Pedidos auditados', String(logs.filter((log) => log.entity_type === 'order').length)],
        ].map(([label, value]) => (
          <div key={label} style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 14 }}>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 700 }}>{label}</div>
            <strong style={{ fontSize: 24 }}>{value}</strong>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 980, borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-hover)' }}>
              <th style={{ padding: 'var(--space-md)' }}>Quando</th>
              <th style={{ padding: 'var(--space-md)' }}>Ator</th>
              <th style={{ padding: 'var(--space-md)' }}>Acao</th>
              <th style={{ padding: 'var(--space-md)' }}>Entidade</th>
              <th style={{ padding: 'var(--space-md)' }}>ID</th>
              <th style={{ padding: 'var(--space-md)' }}>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 'var(--space-xl)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>Nenhum evento encontrado.</td>
              </tr>
            ) : logs.map((log) => {
              const actionColor = getActionColor(log.action);
              return (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--space-md)', color: 'var(--color-text-secondary)', fontSize: 13 }}>{new Date(log.created_at).toLocaleString('pt-BR')}</td>
                  <td style={{ padding: 'var(--space-md)', fontSize: 13 }}>{log.actor_email || 'Sistema'}</td>
                  <td style={{ padding: 'var(--space-md)' }}>
                    <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: 999, background: actionColor.bg, color: actionColor.text, fontWeight: 800, fontSize: 11 }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-md)', fontWeight: 700 }}>{log.entity_type}</td>
                  <td style={{ padding: 'var(--space-md)', color: 'var(--color-text-secondary)', fontSize: 12 }}>{log.entity_id || '-'}</td>
                  <td style={{ padding: 'var(--space-md)', color: 'var(--color-text-secondary)', fontSize: 12 }}>{summarizeAuditMetadata(log.metadata)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
