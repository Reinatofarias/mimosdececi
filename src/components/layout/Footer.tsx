import React from 'react';
import Link from 'next/link';
import { Instagram, MapPin, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{ 
      backgroundColor: 'var(--color-bg-warm)', 
      borderTop: '1px solid var(--color-border)',
      paddingTop: 'var(--space-3xl)',
      paddingBottom: 'var(--space-md)',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: 'var(--space-2xl)',
          marginBottom: 'var(--space-3xl)'
        }}>
          
          {/* Brand */}
          <div>
            <Link href="/" className="text-accent" style={{
              fontSize: 'var(--text-3xl)',
              display: 'block',
              marginBottom: 'var(--space-md)'
            }}>
              Mimos de Ceci
            </Link>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
              Transformando momentos especiais em presentes inesquecíveis. Feitos com amor para cada ocasião.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ 
                color: 'var(--color-primary)',
                padding: 'var(--space-sm)',
                backgroundColor: 'var(--color-primary-lightest)',
                borderRadius: '50%',
                display: 'inline-flex'
              }}>
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--text-lg)' }}>Links Úteis</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <li><Link href="/" style={{ color: 'var(--color-text-secondary)' }}>Início</Link></li>
              <li><Link href="/catalogo" style={{ color: 'var(--color-text-secondary)' }}>Catálogo de Produtos</Link></li>
              <li><Link href="/sobre" style={{ color: 'var(--color-text-secondary)' }}>Sobre a Mimos de Ceci</Link></li>
              <li><Link href="/contato" style={{ color: 'var(--color-text-secondary)' }}>Contato</Link></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--text-lg)' }}>Contato</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <li style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
                <Phone size={18} color="var(--color-primary)" />
                (81) 99226-5790
              </li>
              <li style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
                <Mail size={18} color="var(--color-primary)" />
                contato@mimosdececi.com.br
              </li>
              <li style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
                <MapPin size={18} color="var(--color-primary)" />
                Recife, PE
              </li>
            </ul>
          </div>
          
        </div>

        {/* Copyright */}
        <div style={{ 
          borderTop: '1px solid var(--color-border)', 
          paddingTop: 'var(--space-md)',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-sm)'
        }}>
          <p>© {new Date().getFullYear()} Mimos de Ceci. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
