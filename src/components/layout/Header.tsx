import React from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '../ui/Button/Button';

export function Header() {
  return (
    <header style={{ 
      borderBottom: '1px solid rgba(244, 146, 158, 0.12)',
      backgroundColor: 'rgba(255, 255, 255, 0.82)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'all var(--transition-base)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '80px'
      }}>
        
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', transition: 'transform var(--transition-fast)' }} className="logo-hover">
          <img 
            src="/logo.png" 
            alt="Mimos de Ceci" 
            style={{ 
              height: '46px', 
              width: 'auto', 
              objectFit: 'contain',
              display: 'block'
            }} 
          />
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: 'flex', gap: 'var(--space-lg)' }} className="hide-on-mobile">
          <Link href="/" style={{ fontWeight: 500 }}>Início</Link>
          <Link href="/catalogo" style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>Catálogo</Link>
          <Link href="/sobre" style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>Sobre Nós</Link>
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
          <Button variant="ghost" size="sm" className="show-on-mobile" style={{ padding: '0 8px' }}>
            <Menu size={24} />
          </Button>
        </div>

      </div>
      <style>{`
        .show-on-mobile { display: none; }
        .logo-hover:hover {
          transform: scale(1.04);
        }
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
          .show-on-mobile { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}
