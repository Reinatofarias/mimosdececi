import React from 'react';
import { getProducts } from '@/lib/dal/products';

export const revalidate = 0;

export default async function AdminDashboard() {
  const products = await getProducts();
  const activeProducts = products.filter(p => p.active);
  const featuredProducts = products.filter(p => p.featured);

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-md)' }}>
        Dashboard
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2xl)' }}>
        Bem-vinda ao seu painel administrativo, Ceci!
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--space-md)'
      }}>
        
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)' }}>Total de Produtos</h3>
          <p style={{ fontSize: 'var(--text-4xl)', fontWeight: 700, marginTop: 'var(--space-sm)', color: 'var(--color-primary-dark)' }}>
            {products.length}
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)' }}>Produtos Ativos</h3>
          <p style={{ fontSize: 'var(--text-4xl)', fontWeight: 700, marginTop: 'var(--space-sm)' }}>
            {activeProducts.length}
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)' }}>Em Destaque</h3>
          <p style={{ fontSize: 'var(--text-4xl)', fontWeight: 700, marginTop: 'var(--space-sm)', color: 'var(--color-accent)' }}>
            {featuredProducts.length}
          </p>
        </div>

      </div>
    </div>
  );
}
