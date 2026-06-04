import { isAdminSession } from '@/lib/admin-auth';
import { getOrders } from '@/lib/dal/orders';

function csvEscape(value: unknown) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

export async function GET() {
  const isAdmin = await isAdminSession();
  if (!isAdmin) return new Response('Nao autorizado.', { status: 401 });

  const orders = await getOrders();
  const rows = [
    ['protocolo', 'origem', 'cliente', 'telefone', 'status', 'pagamento', 'total', 'valor_pago', 'saldo', 'custo', 'lucro', 'cupom', 'desconto', 'entrega', 'endereco', 'criado_em'],
    ...orders.map((order) => [
      order.order_code || order.id,
      order.source || 'admin',
      order.customer_name,
      order.customer_phone,
      order.status,
      order.payment_status,
      (order.total_price || 0) / 100,
      (order.amount_paid || 0) / 100,
      Math.max(0, (order.total_price || 0) - (order.amount_paid || 0)) / 100,
      (order.total_cost || 0) / 100,
      ((order.total_price || 0) - (order.total_cost || 0)) / 100,
      order.coupon_code || '',
      (order.discount_amount || 0) / 100,
      order.delivery_date || '',
      order.customer_address || '',
      order.created_at,
    ]),
  ];
  const csv = rows.map((row) => row.map(csvEscape).join(',')).join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="pedidos-mimos-de-ceci.csv"',
    },
  });
}
