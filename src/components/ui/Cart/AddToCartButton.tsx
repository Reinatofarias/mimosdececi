"use client";

import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { useCart } from './CartProvider';

export function AddToCartButton({
  product,
  fullWidth = false,
}: {
  product: { id: string; name: string; slug: string; price: number; image?: string };
  fullWidth?: boolean;
}) {
  const cart = useCart();

  return (
    <Button
      type="button"
      variant="outline"
      fullWidth={fullWidth}
      leftIcon={<ShoppingBag size={18} />}
      onClick={() => cart.addItem(product)}
    >
      Adicionar à Sacola
    </Button>
  );
}
