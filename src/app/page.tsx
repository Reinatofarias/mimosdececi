import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { ProductCard } from '@/components/ui/ProductCard/ProductCard';
import { FadeIn } from '@/components/ui/FadeIn/FadeIn';
import { getFeaturedProducts, getPublicProducts } from '@/lib/dal/products';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const [featuredProducts, allProducts] = await Promise.all([
    getFeaturedProducts(),
    getPublicProducts()
  ]);

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

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: 'var(--space-xl)' 
            }}>
              {featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
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
