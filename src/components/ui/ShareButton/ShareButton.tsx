"use client";

import React from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '../Button/Button';

interface ShareButtonProps {
  productName: string;
  productDescription: string;
  productPrice: number;
}

export function ShareButton({ productName, productDescription, productPrice }: ShareButtonProps) {
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const handleShare = async () => {
    const pageUrl = window.location.href;
    const text = `✨ Olha que presente lindo! ✨\n\n*${productName}*\n${productDescription}\n\n💰 ${formatPrice(productPrice)}\n\n🔗 Veja mais: ${pageUrl}`;

    // Try native share API first (works on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `${productName} - ${productDescription} - ${formatPrice(productPrice)}`,
          url: pageUrl,
        });
        return;
      } catch {
        // User cancelled or share failed, fall through to WhatsApp
      }
    }

    // Fallback: share via WhatsApp
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      variant="outline"
      size="lg"
      fullWidth
      leftIcon={<Share2 size={20} />}
      onClick={handleShare}
      style={{
        borderColor: 'var(--color-primary-light)',
        color: 'var(--color-primary-dark)',
        fontWeight: 600,
        fontSize: '1rem',
        transition: 'all 0.2s ease',
      }}
    >
      Compartilhar
    </Button>
  );
}
