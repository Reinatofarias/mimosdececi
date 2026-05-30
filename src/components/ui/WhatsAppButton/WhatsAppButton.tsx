"use client";

import React from 'react';
import { Phone } from 'lucide-react';
import { Button } from '../Button/Button';

interface WhatsAppButtonProps {
  productName: string;
  productPrice: number;
}

export function WhatsAppButton({ productName, productPrice }: WhatsAppButtonProps) {
  const WHATSAPP_NUMBER = "5581992265790"; // Número da loja
  
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const message = `Oi Ceci! Gostaria de encomendar o presente: *${productName}* (${formatPrice(productPrice)}).`;
  
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  return (
    <Button 
      variant="primary" 
      size="lg" 
      fullWidth 
      leftIcon={<Phone size={20} />}
      onClick={() => window.open(whatsappUrl, '_blank')}
      style={{
        backgroundColor: '#25D366', // Verde do WhatsApp
        borderColor: '#25D366',
        color: 'white',
        fontSize: '1.1rem',
        fontWeight: 600,
      }}
    >
      Comprar pelo WhatsApp
    </Button>
  );
}
