import React from 'react';
import { getProductById } from '@/lib/dal/products';
import { getCategories } from '@/lib/dal/categories';
import { notFound } from 'next/navigation';
import { EditProductForm } from './EditProductForm';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategories()
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2xl)' }}>Editar Produto</h1>
      <EditProductForm product={product} categories={categories} />
    </div>
  );
}
