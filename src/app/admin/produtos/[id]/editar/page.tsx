import React from 'react';
import { getAdminProductById } from '@/lib/dal/products';
import { getAdminCategories } from '@/lib/dal/categories';
import { notFound } from 'next/navigation';
import { ProductForm } from '../../ProductForm';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    getAdminCategories()
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2xl)' }}>Editar Produto</h1>
      <ProductForm mode="edit" product={product} categories={categories} />
    </div>
  );
}
