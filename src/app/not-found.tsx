import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button/Button';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <Header />
      
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 'var(--space-4xl) var(--space-md)',
        backgroundColor: 'var(--color-bg-warm)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '500px' }}>
          <Image 
            src="/logo.png" 
            alt="Mimos de Ceci" 
            width={220}
            height={80}
            style={{ height: '80px', width: 'auto', margin: '0 auto var(--space-xl)', opacity: 0.8 }} 
          />
          <h1 style={{ 
            fontSize: 'var(--text-4xl)', 
            color: 'var(--color-primary-dark)', 
            marginBottom: 'var(--space-md)',
            fontFamily: 'var(--font-display)'
          }}>
            Ops! Página não encontrada
          </h1>
          <p style={{ 
            fontSize: 'var(--text-lg)', 
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-2xl)',
            lineHeight: 1.6
          }}>
            Parece que a página que você está procurando não existe, foi movida ou o link está quebrado.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
            <Link href="/">
              <Button variant="primary" size="lg">Voltar ao Início</Button>
            </Link>
            <Link href="/catalogo">
              <Button variant="outline" size="lg" style={{ borderColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>Ver Catálogo</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
