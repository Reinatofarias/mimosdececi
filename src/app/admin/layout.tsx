"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Package, LayoutDashboard, Settings, LogOut, Ticket, ClipboardList, LayoutList, Folder } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';

import { AuthProvider } from '@/components/AuthProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { href: '/admin/pedidos', label: 'Pedidos (CRM)', icon: <ClipboardList size={20} /> },
    { href: '/admin/produtos', label: 'Produtos', icon: <Package size={20} /> },
    { href: '/admin/categorias', label: 'Categorias', icon: <Folder size={20} /> },
    { href: '/admin/cupons', label: 'Cupons', icon: <Ticket size={20} /> },
    { href: '/admin/vitrine', label: 'Vitrine (Home)', icon: <LayoutList size={20} /> },
    { href: '/admin/configuracoes', label: 'Configurações', icon: <Settings size={20} /> },
  ];

  return (
    <AuthProvider>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-warm)', fontFamily: 'var(--font-admin)' }}>
      {/* Sidebar - Executive Premium Dark Slate */}
      <aside style={{ 
        width: '260px', 
        backgroundColor: '#111115', 
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--space-md)'
      }}>
        {/* Sidebar Header with Compact Brand Logo */}
        <div style={{ 
          padding: 'var(--space-md) 0 var(--space-lg)', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
          marginBottom: 'var(--space-lg)', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '8px' 
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform var(--transition-fast)' }} className="admin-logo-hover">
            <img 
              src="/logo-compact.png" 
              alt="Mimos de Ceci" 
              style={{ 
                height: '42px', 
                width: 'auto', 
                objectFit: 'contain',
                display: 'block'
              }} 
            />
          </Link>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 'var(--text-xs)', margin: 0, textAlign: 'center', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Painel Executivo
          </p>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', flexGrow: 1 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? 'rgba(244, 146, 158, 0.15)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.65)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  border: isActive ? '1px solid rgba(244, 146, 158, 0.2)' : '1px solid transparent'
                }}
                className="admin-nav-link"
              >
                <span style={{ color: isActive ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.45)' }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer with Logout */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 'var(--space-md)' }}>
          <Button 
            variant="ghost" 
            fullWidth 
            leftIcon={<LogOut size={18} />}
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{ 
              justifyContent: 'flex-start', 
              color: '#EF7A88', 
              fontSize: '14px', 
              fontWeight: 500,
              padding: '12px 16px',
              backgroundColor: 'transparent'
            }}
            className="admin-logout-btn"
          >
            Sair da Conta
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: 'var(--space-2xl)', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
      <style>{`
        h1, h2, h3, h4, h5, h6 {
          font-family: var(--font-admin) !important;
        }
        .admin-logo-hover:hover {
          transform: scale(1.03);
        }
        .admin-nav-link:hover {
          color: var(--color-primary) !important;
          background-color: rgba(255, 255, 255, 0.03) !important;
        }
        .admin-logout-btn:hover {
          background-color: rgba(239, 122, 136, 0.08) !important;
        }
      `}</style>
    </div>
    </AuthProvider>
  );
}
