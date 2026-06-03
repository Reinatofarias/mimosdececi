"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '../Button/Button';
import { AddToCartButton } from '../Cart/AddToCartButton';
import styles from './ProductCard.module.css';
import type { Product } from '@/lib/types/database';

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: 'default' | 'featured';
}

export function ProductCard({ product, index = 0, variant = 'default' }: ProductCardProps) {
  // Helpers para formatação de moeda
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const brandPlaceholder = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="100%" height="100%" fill="%23FFF5F7"/><circle cx="200" cy="200" r="80" fill="%23FFE0E5"/><path d="M200 160 C180 130, 140 130, 140 170 C140 210, 200 250, 200 260 C200 250, 260 210, 260 170 C260 130, 220 130, 200 160 Z" fill="%23F4929E" opacity="0.65"/><text x="50%" y="80%" dominant-baseline="middle" text-anchor="middle" font-family="'Playfair Display', serif" font-size="22" font-weight="bold" fill="%238A8A8A">Mimos de Ceci</text></svg>`;
  
  const imageSrc = product.images?.[0] || brandPlaceholder;
  const hasDiscount = product.original_price && product.original_price > product.price;
  const isFeatured = variant === 'featured' || product.featured;

  return (
    <motion.article 
      className={`${styles.card} ${variant === 'featured' ? styles.featuredCard : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -5 }}
    >
      <Link href={`/produto/${product.slug}`} className={styles.imageContainer}>
        {hasDiscount && (
          <div className={styles.badge}>Oferta</div>
        )}
        {isFeatured && (
          <div className={styles.featuredBadge}>Destaque</div>
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
          {hasDiscount ? (
            <>
              <div className={styles.originalPriceRow}>
                De: <span className={styles.originalPrice}>{formatPrice(product.original_price!)}</span>
              </div>
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>por apenas:</span>
                <span className={styles.price}>{formatPrice(product.price)}</span>
              </div>
            </>
          ) : (
            <span className={styles.priceOnly}>{formatPrice(product.price)}</span>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <AddToCartButton fullWidth product={{ id: product.id, name: product.name, slug: product.slug, price: product.price, image: imageSrc }} />
        <Link href={`/produto/${product.slug}`} style={{ display: 'block', marginTop: '8px' }}>
          <Button variant="primary" fullWidth>
            Ver Detalhes
          </Button>
        </Link>
      </div>
    </motion.article>
  );
}
