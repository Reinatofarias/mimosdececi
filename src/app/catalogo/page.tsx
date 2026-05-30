import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getProducts } from '@/lib/dal/products';
import { ProductCard } from '@/components/ui/ProductCard/ProductCard';

export const revalidate = 60;

export default async function CatalogPage() {
  const products = await getProducts();

  return (
    <>
      <Header />
      <main style={{ backgroundColor: 'var(--color-bg-warm)', minHeight: '100vh', padding: 'var(--space-3xl) 0' }}>
        <div className="container">
          
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
            <h1 className="text-accent" style={{ fontSize: 'var(--text-4xl)' }}>
              Nosso Catálogo
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-sm)' }}>
              Veja todos os presentes e mimos que preparamos com muito carinho para você surpreender quem ama.
            </p>
          </div>

          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--color-text-muted)' }}>
              <p>Nenhum produto cadastrado no catálogo ainda.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'var(--space-xl)'
            }}>
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
