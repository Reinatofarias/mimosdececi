import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu } from 'lucide-react';
import { Button } from '../ui/Button/Button';

export function Header() {
  return (
    <header style={{ 
      borderBottom: '1px solid var(--color-border)',
      backgroundColor: 'var(--color-bg)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '80px'
      }}>
        
        {/* Logo */}
        <Link href="/" className="text-accent" style={{
          fontSize: 'var(--text-3xl)',
          textDecoration: 'none'
        }}>
          Mimos de Ceci
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: 'flex', gap: 'var(--space-lg)' }} className="hide-on-mobile">
          <Link href="/" style={{ fontWeight: 500 }}>Início</Link>
          <Link href="/catalogo" style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>Catálogo</Link>
          <Link href="/sobre" style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>Sobre Nós</Link>
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
          <Button variant="ghost" size="sm" aria-label="Buscar" style={{ padding: '0 8px' }}>
            <Search size={20} />
          </Button>
          <Button variant="primary" size="sm" leftIcon={<ShoppingBag size={18} />}>
            Catálogo
          </Button>
          <Button variant="ghost" size="sm" className="show-on-mobile" style={{ padding: '0 8px' }}>
            <Menu size={24} />
          </Button>
        </div>

      </div>
      <style>{`
        .show-on-mobile { display: none; }
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
          .show-on-mobile { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}
