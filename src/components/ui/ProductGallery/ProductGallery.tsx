"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  hasDiscount: boolean;
}

export function ProductGallery({ images, productName, hasDiscount }: ProductGalleryProps) {
  const brandPlaceholder = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="100%" height="100%" fill="%23FFF5F7"/><circle cx="300" cy="300" r="120" fill="%23FFE0E5"/><path d="M300 240 C270 195, 210 195, 210 255 C210 315, 300 375, 300 390 C300 375, 390 315, 390 255 C390 195, 330 195, 300 240 Z" fill="%23F4929E" opacity="0.65"/><text x="50%" y="80%" dominant-baseline="middle" text-anchor="middle" font-family="'Playfair Display', serif" font-size="32" font-weight="bold" fill="%238A8A8A">Mimos de Ceci</text></svg>`;

  const galleryImages = images && images.length > 0 ? images : [brandPlaceholder];
  const [activeImage, setActiveImage] = useState(galleryImages[0]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', width: '100%' }}>
        {/* Active Main Image */}
        <div 
          onClick={() => setIsLightboxOpen(true)}
          style={{ 
            position: 'relative', 
            width: '100%', 
            aspectRatio: '1/1', 
            borderRadius: 'var(--radius-lg)', 
            overflow: 'hidden',
            border: '1px solid rgba(244, 146, 158, 0.08)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            cursor: 'zoom-in'
          }}
        >
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
              letterSpacing: '0.5px',
              zIndex: 10
            }}>
              Oferta Especial
            </div>
          )}
          
          <div style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(4px)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <ZoomIn size={20} color="var(--color-primary-darker)" />
          </div>
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
                  <Image 
                    src={img} 
                    alt={`${productName} thumbnail ${idx + 1}`} 
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => {
              if (isZoomed) setIsZoomed(false);
              else setIsLightboxOpen(false);
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(false);
              }}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                zIndex: 10000
              }}
            >
              <X size={24} />
            </button>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: isZoomed ? 1.8 : 1 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                position: 'relative',
                width: '90%',
                maxWidth: '1000px',
                aspectRatio: '1 / 1',
                maxHeight: '90vh',
                cursor: isZoomed ? 'zoom-out' : 'zoom-in'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(!isZoomed);
              }}
            >
              <Image
                src={activeImage}
                alt={productName}
                fill
                style={{ objectFit: 'contain' }}
                sizes="100vw"
                quality={100}
              />
            </motion.div>
            
            <div style={{ position: 'absolute', bottom: '24px', color: 'rgba(255,255,255,0.6)', fontSize: '14px', pointerEvents: 'none' }}>
              Clique na imagem para {isZoomed ? 'diminuir' : 'ampliar'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
