import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { ProductCard } from '@/components/ui/ProductCard/ProductCard';
import { FadeIn } from '@/components/ui/FadeIn/FadeIn';
import { getFeaturedProducts, getPublicProducts } from '@/lib/dal/products';
import { Button } from '@/components/ui/Button/Button';
import Image from 'next/image';
import Link from 'next/link';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const [featuredProducts, allProducts] = await Promise.all([
    getFeaturedProducts(),
    getPublicProducts()
  ]);
  const primaryFeatured = featuredProducts[0];
  const secondaryFeatured = featuredProducts.slice(1);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <Header />
      
      <main style={{ flex: 1 }}>
        <HeroSection />

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="container" style={{ padding: 'var(--space-3xl) var(--space-md)' }}>
            <FadeIn>
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
                <h2 style={{ 
                  fontSize: 'var(--text-3xl)', 
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  margin: 0
                }}>
                  Mimos em Destaque
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: '6px' }}>
                  Nossas criações mais amadas e encomendadas
                </p>
                <div style={{ width: '40px', height: '3px', backgroundColor: 'var(--color-primary)', margin: '12px auto 0', borderRadius: 'var(--radius-full)' }} />
              </div>
            </FadeIn>

            {primaryFeatured && (
              <FadeIn>
                <Link
                  href={`/produto/${primaryFeatured.slug}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(280px, 1.05fr) minmax(280px, .95fr)',
                    gap: 'var(--space-xl)',
                    alignItems: 'stretch',
                    background: 'var(--color-surface)',
                    border: '1px solid rgba(228, 179, 99, 0.45)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    boxShadow: '0 18px 48px rgba(228, 179, 99, 0.14), 0 4px 16px rgba(244, 146, 158, 0.06)',
                    marginBottom: 'var(--space-xl)',
                  }}
                >
                  <div style={{ position: 'relative', minHeight: '360px', background: 'var(--color-bg-warm)' }}>
                    <Image
                      src={primaryFeatured.images?.[0] || '/logo-compact.png'}
                      alt={primaryFeatured.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{ objectFit: 'cover' }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: 18,
                      left: 18,
                      background: '#111115',
                      color: 'white',
                      borderRadius: '999px',
                      padding: '6px 12px',
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '.8px',
                    }}>
                      Destaque da vitrine
                    </span>
                    {primaryFeatured.original_price && primaryFeatured.original_price > primaryFeatured.price && (
                      <span style={{
                        position: 'absolute',
                        top: 18,
                        right: 18,
                        background: 'var(--color-promo-badge)',
                        color: 'white',
                        borderRadius: '999px',
                        padding: '6px 12px',
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '.8px',
                      }}>
                        Oferta
                      </span>
                    )}
                  </div>
                  <div style={{ padding: 'var(--space-2xl)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--space-md)' }}>
                    <span style={{ color: 'var(--color-primary-dark)', fontSize: 'var(--text-sm)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.9px' }}>
                      Escolha da Ceci
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text)', margin: 0 }}>
                      {primaryFeatured.name}
                    </h3>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 }}>
                      {primaryFeatured.short_description || primaryFeatured.description}
                    </p>
                    <div>
                      {primaryFeatured.original_price && primaryFeatured.original_price > primaryFeatured.price && (
                        <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                          De: <span style={{ textDecoration: 'line-through' }}>{formatPrice(primaryFeatured.original_price)}</span>
                        </div>
                      )}
                      <strong style={{ display: 'block', color: 'var(--color-primary-dark)', fontSize: 'var(--text-3xl)', marginTop: 4 }}>
                        {formatPrice(primaryFeatured.price)}
                      </strong>
                    </div>
                    <div>
                      <Button variant="primary">Ver Destaque</Button>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            )}

            {secondaryFeatured.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 'var(--space-xl)',
              }}>
                {secondaryFeatured.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} variant="featured" />
                ))}
              </div>
            )}
          </section>
        )}

        {/* General Catalog (Fallback if no features) */}
        {featuredProducts.length === 0 && allProducts.length > 0 && (
          <section className="container" style={{ padding: 'var(--space-3xl) var(--space-md)' }}>
            <FadeIn>
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
                <h2 style={{ 
                  fontSize: 'var(--text-3xl)', 
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  margin: 0
                }}>
                  Nossos Presentes
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: '6px' }}>
                  Conheça o nosso catálogo completo de mimos e lembranças
                </p>
                <div style={{ width: '40px', height: '3px', backgroundColor: 'var(--color-primary)', margin: '12px auto 0', borderRadius: 'var(--radius-full)' }} />
              </div>
            </FadeIn>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: 'var(--space-xl)' 
            }}>
              {allProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {featuredProducts.length === 0 && allProducts.length === 0 && (
          <section className="container" style={{ padding: 'var(--space-4xl) var(--space-md)', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ 
              backgroundColor: 'var(--color-bg-warm)', 
              border: '1px dashed var(--color-primary-light)', 
              borderRadius: 'var(--radius-lg)', 
              padding: 'var(--space-3xl) var(--space-xl)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h2 style={{ 
                fontFamily: 'var(--font-display)', 
                color: 'var(--color-text)', 
                fontSize: 'var(--text-2xl)',
                marginBottom: 'var(--space-sm)' 
              }}>
                Nenhum mimo disponível no momento
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', marginBottom: 'var(--space-lg)' }}>
                Nossa vitrine está sendo atualizada com novidades encantadoras. Volte em breve ou acesse o painel para cadastrar!
              </p>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
