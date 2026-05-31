import React from 'react';
import { getProducts } from '@/lib/dal/products';
import { OrderForm } from './OrderForm';

export const revalidate = 0; // Ensures products are fresh when opening page

export default async function NovoPedidoPage() {
  const products = await getProducts();
  const activeProducts = products.filter(p => p.active);

  return (
    <OrderForm products={activeProducts} />
  );
}
