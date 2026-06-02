import React from 'react';
import Link from 'next/link';
import { getAdminProducts } from '@/lib/dal/products';
import { Button } from '@/components/ui/Button/Button';
import { Plus } from 'lucide-react';
import { DeleteProductButton } from './DeleteProductButton';

export const revalidate = 0; // Para sempre ver os mais recentes no admin

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)' }}>Produtos</h1>
        <Link href="/admin/produtos/novo">
          <Button variant="primary" leftIcon={<Plus size={18} />}>
            Novo Produto
          </Button>
        </Link>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-hover)' }}>
              <th style={{ padding: 'var(--space-md)', fontWeight: 600 }}>Nome</th>
              <th style={{ padding: 'var(--space-md)', fontWeight: 600 }}>Preço</th>
              <th style={{ padding: 'var(--space-md)', fontWeight: 600 }}>Status</th>
              <th style={{ padding: 'var(--space-md)', fontWeight: 600, textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  Nenhum produto cadastrado ainda.
                </td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--space-md)' }}>
                    {product.name}
                    {product.featured && <span style={{ marginLeft: '8px', fontSize: '12px', background: 'var(--color-promo-bg)', color: 'var(--color-promo-text)', padding: '2px 6px', borderRadius: '10px' }}>Destaque</span>}
                  </td>
                  <td style={{ padding: 'var(--space-md)' }}>{formatPrice(product.price)}</td>
                  <td style={{ padding: 'var(--space-md)' }}>
                    {product.active ? 'Ativo' : 'Inativo'}
                  </td>
                  <td style={{ padding: 'var(--space-md)', textAlign: 'right', display: 'flex', gap: 'var(--space-xs)', justifyContent: 'flex-end' }}>
                    <Link href={`/admin/produtos/${product.id}/editar`}>
                      <Button variant="ghost" size="sm">Editar</Button>
                    </Link>
                    <DeleteProductButton productId={product.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
