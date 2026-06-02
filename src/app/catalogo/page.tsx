import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getPublicProducts } from '@/lib/dal/products';
import { ProductCard } from '@/components/ui/ProductCard/ProductCard';
import { FadeIn } from '@/components/ui/FadeIn/FadeIn';
import { getCategories } from '@/lib/dal/categories';
import { CategoryFilter } from '@/components/ui/CategoryFilter/CategoryFilter';

export const revalidate = 0;

interface CatalogPageProps {
  searchParams: Promise<{ categoria?: string; min?: string; max?: string }>;
}

function parsePriceFilter(value?: string) {
  if (!value) return null;
  const parsed = Number(value.replace(',', '.'));
  if (Number.isNaN(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { categoria: categoryId, min, max } = await searchParams;
  const minPrice = parsePriceFilter(min);
  const maxPrice = parsePriceFilter(max);

  const [rawProducts, categories] = await Promise.all([
    getPublicProducts(categoryId),
    getCategories(),
  ]);

  const products = rawProducts.filter((product) => {
    if (minPrice !== null && product.price < minPrice) return false;
    if (maxPrice !== null && product.price > maxPrice) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <Header />

      <main style={{ backgroundColor: 'var(--color-bg-warm)', flex: 1, padding: 'var(--space-3xl) 0' }}>
        <div className="container">
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
              <span style={{
                fontFamily: 'var(--font-accent)',
                color: 'var(--color-primary-darker)',
                fontSize: 'var(--text-2xl)',
                display: 'block',
                marginBottom: '4px',
              }}>
                Colecao de Afetos
              </span>
              <h1 style={{
                fontSize: 'var(--text-4xl)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                color: 'var(--color-text)',
                margin: 0,
              }}>
                Nosso Catalogo
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-sm)', maxWidth: '600px', margin: '12px auto 0', fontSize: 'var(--text-base)' }}>
                Explore nossos presentes e mimos artesanais exclusivos, preparados com todo carinho para tornar momentos especiais inesqueciveis.
              </p>
              <div style={{ width: '40px', height: '3px', backgroundColor: 'var(--color-primary)', margin: '16px auto 0', borderRadius: 'var(--radius-full)' }} />
            </div>
          </FadeIn>

          <CategoryFilter categories={categories} />

          <form action="/catalogo" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(120px, 180px)) auto',
            gap: 'var(--space-sm)',
            alignItems: 'end',
            marginBottom: 'var(--space-2xl)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)',
          }}>
            {categoryId && <input type="hidden" name="categoria" value={categoryId} />}
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Preco minimo
              <input name="min" type="number" step="0.01" min="0" defaultValue={min || ''} placeholder="R$ 0" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Preco maximo
              <input name="max" type="number" step="0.01" min="0" defaultValue={max || ''} placeholder="R$ 200" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
            </label>
            <button type="submit" style={{ height: '41px', borderRadius: '8px', border: 0, background: 'var(--color-primary)', color: 'white', fontWeight: 700, cursor: 'pointer', padding: '0 16px' }}>
              Filtrar
            </button>
            <Link href={categoryId ? `/catalogo?categoria=${categoryId}` : '/catalogo'} style={{ height: '41px', display: 'inline-flex', alignItems: 'center', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
              Limpar preco
            </Link>
          </form>

          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-4xl) 0', color: 'var(--color-text-muted)', maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-2xl)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <p style={{ fontSize: '15px' }}>Nenhum produto encontrado com esses filtros.</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-xl)' }}>
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
