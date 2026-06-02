import React from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/dal/products';
import { ProductGallery } from '@/components/ui/ProductGallery/ProductGallery';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton/WhatsAppButton';
import { ShareButton } from '@/components/ui/ShareButton/ShareButton';
import { AddToCartButton } from '@/components/ui/Cart/AddToCartButton';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { absoluteUrl } from '@/lib/site-url';

export const revalidate = 60; // Revalida a página a cada 60 segundos

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: ProductPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Produto não encontrado | Mimos de Ceci',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const imageUrl = product.images?.[0] || '/logo.png';
  const price = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price / 100);

  return {
    title: `${product.name} | Mimos de Ceci`,
    description: product.short_description || product.description?.substring(0, 160) || `Compre ${product.name} por apenas ${price} na Mimos de Ceci.`,
    openGraph: {
      title: `${product.name} — ${price}`,
      description: product.short_description || `Presenteie quem você ama com ${product.name}.`,
      images: [imageUrl, ...previousImages],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — ${price}`,
      description: product.short_description,
      images: [imageUrl],
    }
  };
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

  const hasDiscount = product.original_price && product.original_price > product.price;
  const productUrl = absoluteUrl(`/produto/${product.slug}`);
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.short_description || product.name,
    image: product.images?.map((image) => image.startsWith('http') ? image : absoluteUrl(image)) || [],
    url: productUrl,
    brand: {
      '@type': 'Brand',
      name: 'Mimos de Ceci',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: (product.price / 100).toFixed(2),
      availability: product.availability === 'sold_out' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: productUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
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
                <AddToCartButton
                  fullWidth
                  product={{ id: product.id, name: product.name, slug: product.slug, price: product.price, image: product.images?.[0] }}
                />
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
