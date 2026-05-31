"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, Search } from 'lucide-react';
import { Button } from '../ui/Button/Button';
import { GlobalSearch } from '../ui/GlobalSearch/GlobalSearch';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close menu on route change / outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
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
            <Button 
              variant="ghost" 
              size="sm" 
              style={{ padding: '0 8px' }}
              onClick={() => setSearchOpen(true)}
              aria-label="Buscar"
            >
              <Search size={20} />
            </Button>

            {/* Mobile hamburger */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="show-on-mobile" 
              style={{ padding: '0 8px' }}
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={24} />
            </Button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {/* Drawer Panel */}
          <div 
            ref={drawerRef}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '280px',
              maxWidth: '80vw',
              height: '100%',
              backgroundColor: '#FFFFFF',
              boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Drawer Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-lg)',
              borderBottom: '1px solid var(--color-border)',
            }}>
              <img 
                src="/logo.png" 
                alt="Mimos de Ceci" 
                style={{ height: '36px', width: 'auto', objectFit: 'contain' }} 
              />
              <button 
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar menu"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Drawer Nav Links */}
            <nav style={{
              display: 'flex',
              flexDirection: 'column',
              padding: 'var(--space-lg)',
              gap: 'var(--space-xs)',
              flex: 1,
            }}>
              {[
                { href: '/', label: 'Início' },
                { href: '/catalogo', label: 'Catálogo' },
                { href: '/sobre', label: 'Sobre Nós' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: '1.05rem',
                    color: 'var(--color-text)',
                    transition: 'all 0.15s ease',
                    display: 'block',
                  }}
                  className="mobile-nav-link"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Drawer Footer */}
            <div style={{
              padding: 'var(--space-lg)',
              borderTop: '1px solid var(--color-border)',
            }}>
              <p style={{
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                margin: 0,
              }}>
                © {new Date().getFullYear()} Mimos de Ceci
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <style>{`
        .show-on-mobile { display: none; }
        .logo-hover:hover {
          transform: scale(1.04);
        }
        .mobile-nav-link:hover {
          background-color: var(--color-bg-pink) !important;
          color: var(--color-primary-dark) !important;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
          .show-on-mobile { display: inline-flex !important; }
        }
      `}</style>
    </>
  );
}
