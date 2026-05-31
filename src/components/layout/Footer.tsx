import React from 'react';
import Link from 'next/link';
import { MapPin, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{ 
      backgroundColor: '#111115', 
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      paddingTop: 'var(--space-3xl)',
      paddingBottom: 'var(--space-xl)',
      marginTop: 'auto',
      color: 'rgba(255, 255, 255, 0.6)'
    }}>
      <div className="container">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: 'var(--space-2xl)',
          marginBottom: 'var(--space-3xl)'
        }}>
          
          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <Link href="/" style={{
              display: 'inline-block',
              transition: 'transform var(--transition-fast)'
            }} className="footer-logo-hover">
              <img 
                src="/logo-white.png" 
                alt="Mimos de Ceci" 
                style={{ 
                  height: '42px', 
                  width: 'auto', 
                  objectFit: 'contain',
                  display: 'block'
                }} 
              />
            </Link>
            <p style={{ lineHeight: 1.6, fontSize: '14px' }}>
              Transformando momentos especiais em presentes inesquecíveis. Cestas e kits personalizados feitos com amor para cada ocasião especial.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <a href="https://www.instagram.com/mimosdececioficial" target="_blank" rel="noopener noreferrer" style={{ 
                color: 'var(--color-primary)',
                padding: '10px',
                backgroundColor: 'rgba(244, 146, 158, 0.12)',
                borderRadius: '50%',
                display: 'inline-flex',
                transition: 'all 0.2s ease'
              }} className="social-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 style={{ marginBottom: 'var(--space-lg)', fontSize: 'var(--text-lg)', color: '#FFFFFF', fontWeight: 600 }}>Links Úteis</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link href="/" style={{ transition: 'color 0.2s' }} className="footer-link">Início</Link></li>
              <li><Link href="/catalogo" style={{ transition: 'color 0.2s' }} className="footer-link">Catálogo de Produtos</Link></li>
              <li><Link href="/sobre" style={{ transition: 'color 0.2s' }} className="footer-link">Sobre Nós</Link></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 style={{ marginBottom: 'var(--space-lg)', fontSize: 'var(--text-lg)', color: '#FFFFFF', fontWeight: 600 }}>Contato</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', fontSize: '14px' }}>
                <Phone size={16} color="var(--color-primary)" />
                (81) 99226-5790
              </li>
              <li style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', fontSize: '14px' }}>
                <Mail size={16} color="var(--color-primary)" />
                contato@mimosdececi.com.br
              </li>
              <li style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', fontSize: '14px' }}>
                <MapPin size={16} color="var(--color-primary)" />
                Recife, PE
              </li>
            </ul>
          </div>
          
        </div>

        {/* Copyright */}
        <div style={{ 
          borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
          paddingTop: 'var(--space-lg)',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: '13px'
        }}>
          <p>© {new Date().getFullYear()} Mimos de Ceci. Todos os direitos reservados.</p>
        </div>
      </div>
      <style>{`
        .footer-logo-hover:hover {
          transform: scale(1.03);
        }
        .footer-link {
          color: rgba(255, 255, 255, 0.6) !important;
        }
        .footer-link:hover {
          color: var(--color-primary) !important;
        }
        .social-icon:hover {
          background-color: var(--color-primary) !important;
          color: #FFFFFF !important;
          transform: translateY(-2px);
        }
      `}</style>
    </footer>
  );
}
