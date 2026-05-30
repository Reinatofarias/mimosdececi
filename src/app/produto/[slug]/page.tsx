import React from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/dal/products';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton/WhatsAppButton';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const revalidate = 60; // Revalida a página a cada 60 segundos

interface ProductPageProps {
  params: { slug: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const imageSrc = product.images?.[0] || 'https://via.placeholder.com/800?text=Sem+Imagem';
  const hasDiscount = product.original_price && product.original_price > product.price;

  return (
    <>
      <Header />
      <main style={{ backgroundColor: 'var(--color-bg-warm)', minHeight: '100vh', padding: 'var(--space-2xl) 0' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-3xl)',
            backgroundColor: 'var(--color-surface)',
            padding: 'var(--space-2xl)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
          }}>
            
            {/* Esquerda: Imagem */}
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <Image 
                src={imageSrc} 
                alt={product.name}
                fill
                style={{ objectFit: 'cover' }}
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
                  fontWeight: 600,
                  fontSize: 'var(--text-sm)'
                }}>
                  Oferta Especial
                </div>
              )}
            </div>

            {/* Direita: Informações */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h1 className="text-accent" style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-sm)' }}>
                {product.name}
              </h1>
              
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span style={{ 
                    fontSize: 'var(--text-xl)', 
                    color: 'var(--color-text-muted)', 
                    textDecoration: 'line-through',
                    marginLeft: 'var(--space-sm)'
                  }}>
                    {formatPrice(product.original_price!)}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: 'var(--space-2xl)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-xs)', color: 'var(--color-text-primary)' }}>
                  Detalhes do Mimo
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {product.description || product.short_description || 'Nenhuma descrição detalhada disponível.'}
                </p>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <WhatsAppButton productName={product.name} productPrice={product.price} />
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 'var(--space-sm)' }}>
                  Ao clicar, você será redirecionada(o) para falar com a Ceci.
                </p>
              </div>
            </div>

          </div>

        </div>
      </main>
      <Footer />
      
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
