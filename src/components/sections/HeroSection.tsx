import React from 'react';
import { Button } from '../ui/Button/Button';
import { Gift } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section style={{
      backgroundColor: 'var(--color-primary-lightest)',
      padding: 'var(--space-4xl) 0',
      textAlign: 'center',
      borderBottom: '1px solid var(--color-primary-lighter)'
    }}>
      <div className="container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-lg)',
        maxWidth: '800px'
      }}>
        
        <h1 style={{ 
          fontSize: 'var(--text-5xl)', 
          color: 'var(--color-primary-darkest)',
          marginBottom: 'var(--space-xs)'
        }}>
          Presentes feitos com o coração
        </h1>
        
        <p style={{ 
          fontSize: 'var(--text-xl)', 
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6
        }}>
          Transformamos momentos especiais em lembranças inesquecíveis. 
          Descubra nossas cestas, mimos e kits personalizados para encantar quem você ama.
        </p>

        <div style={{ 
          display: 'flex', 
          gap: 'var(--space-md)', 
          flexWrap: 'wrap', 
          justifyContent: 'center',
          marginTop: 'var(--space-md)'
        }}>
          <Link href="/catalogo">
            <Button variant="primary" size="lg" leftIcon={<Gift size={20} />}>
              Ver Catálogo
            </Button>
          </Link>
          <Button variant="outline" size="lg">
            Saber Mais
          </Button>
        </div>

      </div>
    </section>
  );
}
