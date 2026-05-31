import React from 'react';
import { getProducts } from '@/lib/dal/products';
import { ShowcaseList } from './ShowcaseList';

export const dynamic = 'force-dynamic';

export default async function ShowcasePage() {
  const products = await getProducts(); // Returns all active products

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-text)' }}>Gerenciar Vitrine</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
          Escolha quais produtos ganharão destaque na página inicial da loja.
        </p>
      </div>

      <ShowcaseList products={products} />
    </div>
  );
}
