import React from 'react';
import Link from 'next/link';
import { getOrders } from '@/lib/dal/orders';
import { Button } from '@/components/ui/Button/Button';
import { Plus } from 'lucide-react';
import { StatusSelect } from './StatusSelect';

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)' }}>Pedidos</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Gerencie as vendas feitas no WhatsApp.</p>
        </div>
        <Link href="/admin/pedidos/novo">
          <Button variant="primary" leftIcon={<Plus size={18} />}>
            Novo Pedido
          </Button>
        </Link>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-hover)' }}>
                <th style={{ padding: 'var(--space-md)', fontWeight: 600 }}>Data</th>
                <th style={{ padding: 'var(--space-md)', fontWeight: 600 }}>Cliente</th>
                <th style={{ padding: 'var(--space-md)', fontWeight: 600 }}>Total</th>
                <th style={{ padding: 'var(--space-md)', fontWeight: 600 }}>WhatsApp</th>
                <th style={{ padding: 'var(--space-md)', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    Nenhum pedido cadastrado ainda.
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: 'var(--space-md)', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                      {formatDate(order.created_at)}
                    </td>
                    <td style={{ padding: 'var(--space-md)' }}>
                      <strong>{order.customer_name}</strong>
                      {order.notes && (
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          Nota: {order.notes}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: 'var(--space-md)', fontWeight: 500 }}>
                      {formatPrice(order.total_price)}
                    </td>
                    <td style={{ padding: 'var(--space-md)' }}>
                      <a href={`https://wa.me/55${order.customer_phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                        {order.customer_phone}
                      </a>
                    </td>
                    <td style={{ padding: 'var(--space-md)' }}>
                      <StatusSelect orderId={order.id} initialStatus={order.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
