import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { ProductCard } from '@/components/ui/ProductCard/ProductCard';
import { getFeaturedProducts, getProducts } from '@/lib/dal/products';

// Para forçar atualização periódica se desejado:
export const revalidate = 60; // Revalida a cada 60 segundos no servidor

export default async function Home() {
  // Busca simultânea para otimizar tempo
  const [featuredProducts, allProducts] = await Promise.all([
    getFeaturedProducts(),
    getProducts()
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <main style={{ flex: 1 }}>
        <HeroSection />

        {/* Destaques */}
        {featuredProducts.length > 0 && (
          <section className="container" style={{ padding: 'var(--space-3xl) var(--space-md)' }}>
            <h2 style={{ 
              fontSize: 'var(--text-3xl)', 
              textAlign: 'center', 
              marginBottom: 'var(--space-2xl)',
              color: 'var(--color-primary-dark)'
            }}>
              Mimos em Destaque
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: 'var(--space-xl)' 
            }}>
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Catálogo Geral (se não houver destaques) */}
        {featuredProducts.length === 0 && allProducts.length > 0 && (
          <section className="container" style={{ padding: 'var(--space-3xl) var(--space-md)' }}>
            <h2 style={{ 
              fontSize: 'var(--text-3xl)', 
              textAlign: 'center', 
              marginBottom: 'var(--space-2xl)',
              color: 'var(--color-primary-dark)'
            }}>
              Nossos Presentes
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: 'var(--space-xl)' 
            }}>
              {allProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {featuredProducts.length === 0 && allProducts.length === 0 && (
          <section className="container" style={{ padding: 'var(--space-4xl) var(--space-md)', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
              Nenhum mimo disponível no momento.
            </h2>
            <p>Acesse o painel do Supabase e adicione seus primeiros produtos!</p>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
