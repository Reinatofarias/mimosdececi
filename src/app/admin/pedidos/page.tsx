import React from 'react';
import Link from 'next/link';
import { getOrders } from '@/lib/dal/orders';
import { getAdminProducts } from '@/lib/dal/products';
import { Button } from '@/components/ui/Button/Button';
import { Plus } from 'lucide-react';
import { KanbanBoard } from './KanbanBoard';

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  const products = await getAdminProducts();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)' }}>Pedidos</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Gerencie suas vendas pelo Quadro Kanban.</p>
        </div>
        <Link href="/admin/pedidos/novo">
          <Button variant="primary" leftIcon={<Plus size={18} />}>
            Novo Pedido
          </Button>
        </Link>
      </div>

      <KanbanBoard orders={orders} products={products} />
    </div>
  );
}
