import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getProducts } from '@/lib/dal/products';
import { ProductCard } from '@/components/ui/ProductCard/ProductCard';

export const revalidate = 60;

export default async function CatalogPage() {
  const products = await getProducts();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <Header />
      
      <main style={{ backgroundColor: 'var(--color-bg-warm)', flex: 1, padding: 'var(--space-3xl) 0' }}>
        <div className="container">
          
          {/* Premium Page Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
            <span style={{ 
              fontFamily: 'var(--font-accent)', 
              color: 'var(--color-primary-darker)', 
              fontSize: 'var(--text-2xl)',
              display: 'block',
              marginBottom: '4px'
            }}>
              Coleção de Afetos
            </span>
            <h1 style={{ 
              fontSize: 'var(--text-4xl)', 
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              color: 'var(--color-text)',
              margin: 0
            }}>
              Nosso Catálogo
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-sm)', maxWidth: '600px', margin: '12px auto 0', fontSize: 'var(--text-base)' }}>
              Explore nossos presentes e mimos artesanais exclusivos, preparados com todo carinho para tornar momentos especiais inesquecíveis.
            </p>
            <div style={{ width: '40px', height: '3px', backgroundColor: 'var(--color-primary)', margin: '16px auto 0', borderRadius: 'var(--radius-full)' }} />
          </div>

          {/* Catalog Grid */}
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-4xl) 0', color: 'var(--color-text-muted)', maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-2xl)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <p style={{ fontSize: '15px' }}>Nenhum produto cadastrado no catálogo ainda.</p>
              </div>
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
    </div>
  );
}
