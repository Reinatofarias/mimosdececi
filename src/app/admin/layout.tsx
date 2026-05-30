"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Package, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';

import { AuthProvider } from '@/components/AuthProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { href: '/admin/produtos', label: 'Produtos', icon: <Package size={20} /> },
    { href: '/admin/configuracoes', label: 'Configurações', icon: <Settings size={20} /> },
  ];

  return (
    <AuthProvider>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-warm)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '260px', 
        backgroundColor: 'var(--color-surface)', 
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--space-md)'
      }}>
        <div style={{ padding: 'var(--space-md) 0', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-lg)' }}>
          <Link href="/" className="text-accent" style={{ fontSize: 'var(--text-2xl)' }}>
            Mimos de Ceci
          </Link>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: '4px' }}>
            Painel Administrativo
          </p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', flexGrow: 1 }}>
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
                  backgroundColor: isActive ? 'var(--color-primary-lightest)' : 'transparent',
                  color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s'
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-md)' }}>
          <Button 
            variant="ghost" 
            fullWidth 
            leftIcon={<LogOut size={20} />}
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{ justifyContent: 'flex-start', color: 'var(--color-error)' }}
          >
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: 'var(--space-2xl)', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
    </AuthProvider>
  );
}
