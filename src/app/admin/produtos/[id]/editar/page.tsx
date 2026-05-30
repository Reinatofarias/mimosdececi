import React from 'react';
import { getProductById } from '@/lib/dal/products';
import { notFound } from 'next/navigation';
import { EditProductForm } from './EditProductForm';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2xl)' }}>Editar Produto</h1>
      <EditProductForm product={product} />
    </div>
  );
}
