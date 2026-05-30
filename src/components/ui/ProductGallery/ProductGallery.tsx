"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  hasDiscount: boolean;
}

export function ProductGallery({ images, productName, hasDiscount }: ProductGalleryProps) {
  const brandPlaceholder = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="100%" height="100%" fill="%23FFF5F7"/><circle cx="300" cy="300" r="120" fill="%23FFE0E5"/><path d="M300 240 C270 195, 210 195, 210 255 C210 315, 300 375, 300 390 C300 375, 390 315, 390 255 C390 195, 330 195, 300 240 Z" fill="%23F4929E" opacity="0.65"/><text x="50%" y="80%" dominant-baseline="middle" text-anchor="middle" font-family="'Playfair Display', serif" font-size="32" font-weight="bold" fill="%238A8A8A">Mimos de Ceci</text></svg>`;

  const galleryImages = images && images.length > 0 ? images : [brandPlaceholder];
  const [activeImage, setActiveImage] = useState(galleryImages[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', width: '100%' }}>
      {/* Active Main Image */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        aspectRatio: '1/1', 
        borderRadius: 'var(--radius-lg)', 
        overflow: 'hidden',
        border: '1px solid rgba(244, 146, 158, 0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        <Image 
          src={activeImage} 
          alt={productName}
          fill
          style={{ objectFit: 'cover', transition: 'all 0.3s ease' }}
          priority
        />
        {hasDiscount && (
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'var(--color-promo-bg)',
            color: 'var(--color-promo-text)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontWeight: 700,
            fontSize: '11px',
            boxShadow: '0 2px 8px rgba(232, 93, 110, 0.25)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Oferta Especial
          </div>
        )}
      </div>

      {/* Thumbnails list */}
      {galleryImages.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0', scrollbarWidth: 'none' }}>
          {galleryImages.map((img, idx) => {
            const isActive = img === activeImage;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(img)}
                style={{
                  position: 'relative',
                  width: '68px',
                  height: '68px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  flexShrink: 0,
                  cursor: 'pointer',
                  border: isActive ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  boxShadow: isActive ? '0 2px 8px rgba(244, 146, 158, 0.15)' : 'none',
                  transition: 'all 0.2s ease',
                  padding: 0,
                  backgroundColor: 'transparent'
                }}
              >
                <img 
                  src={img} 
                  alt={`${productName} thumbnail ${idx + 1}`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  );
}
