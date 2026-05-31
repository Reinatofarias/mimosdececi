import React from 'react';
import { getCategories } from '@/lib/dal/categories';
import { CategoryList } from './CategoryList';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-text)' }}>Gerenciar Categorias</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
          Crie e edite as categorias dos seus produtos (ex: Cestas de Café, Dia das Mães, etc).
        </p>
      </div>

      <CategoryList categories={categories} />
    </div>
  );
}
