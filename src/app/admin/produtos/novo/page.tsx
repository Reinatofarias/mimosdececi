import React from 'react';
import { getAdminCategories } from '@/lib/dal/categories';
import { ProductForm } from '../ProductForm';

export const dynamic = 'force-dynamic';

export default async function NovoProduto() {
  const categories = await getAdminCategories();

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--space-xl)', color: 'var(--color-text)' }}>Novo Produto</h1>
      <ProductForm mode="create" categories={categories} />
    </div>
  );
}
