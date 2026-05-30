import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../Button/Button';
import styles from './ProductCard.module.css';
import type { Product } from '@/lib/types/database';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // Helpers para formatação de moeda
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const imageSrc = product.images?.[0] || 'https://via.placeholder.com/400?text=Mimos+de+Ceci';
  const hasDiscount = product.original_price && product.original_price > product.price;

  return (
    <article className={styles.card}>
      <Link href={`/produto/${product.slug}`} className={styles.imageContainer}>
        {hasDiscount && (
          <div className={styles.badge}>Oferta</div>
        )}
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </Link>
      
      <div className={styles.content}>
        <h3 className={styles.title}>
          <Link href={`/produto/${product.slug}`}>{product.name}</Link>
        </h3>
        
        <p className={styles.description}>{product.short_description}</p>
        
        <div className={styles.priceContainer}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className={styles.originalPrice}>
              {formatPrice(product.original_price!)}
            </span>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <Link href={`/produto/${product.slug}`} style={{ display: 'block' }}>
          <Button variant="primary" fullWidth>
            Ver Detalhes
          </Button>
        </Link>
      </div>
    </article>
  );
}
