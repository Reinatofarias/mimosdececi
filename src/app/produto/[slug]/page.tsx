import React from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/dal/products';
import { ProductGallery } from '@/components/ui/ProductGallery/ProductGallery';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton/WhatsAppButton';
import { ShareButton } from '@/components/ui/ShareButton/ShareButton';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const revalidate = 60; // Revalida a página a cada 60 segundos

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

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
            
            {/* Esquerda: Imagem com Galeria Interativa */}
            <ProductGallery 
              images={product.images || []} 
              productName={product.name} 
              hasDiscount={hasDiscount || false} 
            />

            {/* Direita: Informações */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h1 className="text-accent" style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-sm)' }}>
                {product.name}
              </h1>
              
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                {hasDiscount ? (
                  <>
                    <div style={{ 
                      fontSize: 'var(--text-lg)', 
                      color: 'var(--color-text-muted)',
                      fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
                      marginBottom: '4px'
                    }}>
                      De: <span style={{ textDecoration: 'line-through', color: 'var(--color-original-price)' }}>
                        {formatPrice(product.original_price!)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ 
                        fontSize: 'var(--text-lg)', 
                        color: 'var(--color-text-secondary)', 
                        fontWeight: 500,
                        fontFamily: "var(--font-outfit), 'Outfit', sans-serif"
                      }}>
                        por apenas:
                      </span>
                      <span style={{ 
                        fontSize: 'var(--text-4xl)', 
                        fontWeight: 700, 
                        color: 'var(--color-primary-dark)',
                        fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
                        letterSpacing: '-0.5px'
                      }}>
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </>
                ) : (
                  <span style={{ 
                    fontSize: 'var(--text-4xl)', 
                    fontWeight: 700, 
                    color: 'var(--color-primary-dark)',
                    fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
                    letterSpacing: '-0.5px'
                  }}>
                    {formatPrice(product.price)}
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

              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                <WhatsAppButton productName={product.name} productPrice={product.price} />
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
                  Ao clicar, você será redirecionada(o) para falar com a Ceci.
                </p>
                <ShareButton 
                  productName={product.name} 
                  productDescription={product.description || product.short_description || ''}
                  productPrice={product.price} 
                />
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
