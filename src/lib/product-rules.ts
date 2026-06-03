import type { Product } from '@/lib/types/database';

export const PRODUCT_STATUS_LABELS: Record<NonNullable<Product['product_status']>, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  archived: 'Arquivado',
};

export const PRODUCT_AVAILABILITY_LABELS: Record<NonNullable<Product['availability']>, string> = {
  available: 'Disponivel',
  made_to_order: 'Sob encomenda',
  sold_out: 'Esgotado',
  hidden: 'Oculto',
};

export function slugifyProductName(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function isProductPublic(product: Pick<Product, 'active' | 'product_status' | 'availability'>) {
  return product.active && product.product_status !== 'draft' && product.product_status !== 'archived' && product.availability !== 'hidden';
}
