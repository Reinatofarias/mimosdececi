"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError('E-mail ou senha incorretos.');
      setLoading(false);
    } else {
      router.push('/admin');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(120% 120% at 50% 50%, var(--color-primary-lightest) 0%, var(--color-bg-warm) 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: 'var(--space-md)',
      fontFamily: 'var(--font-body)'
    }}>
      {/* Soft Blurred Ambient Glowing Orbs */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '15%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'var(--color-primary-light)',
        opacity: 0.22,
        filter: 'blur(100px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '15%',
        width: '280px',
        height: '280px',
        borderRadius: '50%',
        background: 'var(--color-primary)',
        opacity: 0.15,
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Glassmorphic Login Card */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.78)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        padding: 'var(--space-2xl) var(--space-xl)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(244, 146, 158, 0.16)',
        boxShadow: '0 20px 48px rgba(244, 146, 158, 0.12), 0 4px 12px rgba(0, 0, 0, 0.02)',
        width: '100%',
        maxWidth: '410px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Brand Logo Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-sm)' }}>
          <Image 
            src="/logo.png" 
            alt="Mimos de Ceci" 
            width={180}
            height={64}
            style={{ 
              height: '52px', 
              width: 'auto', 
              objectFit: 'contain',
              display: 'block'
            }} 
          />
        </div>
        <p style={{ 
          color: 'var(--color-text-secondary)', 
          fontSize: '11px', 
          margin: '0 0 var(--space-2xl)', 
          fontWeight: 700, 
          letterSpacing: '1.5px', 
          textTransform: 'uppercase' 
        }}>
          Acesso ao Painel Executivo
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {error && (
            <div style={{
              backgroundColor: '#FADBD8',
              color: '#C0392B',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              textAlign: 'left',
              borderLeft: '4px solid #E74C3C',
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          <div style={{ textAlign: 'left' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              E-mail Administrativo
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seuemail@exemplo.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(244, 146, 158, 0.25)',
                backgroundColor: 'rgba(255, 255, 255, 0.65)',
                outline: 'none',
                fontSize: '14px',
                color: 'var(--color-text)',
                transition: 'all 0.2s ease',
              }}
              className="login-input"
            />
          </div>

          <div style={{ textAlign: 'left', marginBottom: 'var(--space-sm)' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Senha de Segurança
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(244, 146, 158, 0.25)',
                backgroundColor: 'rgba(255, 255, 255, 0.65)',
                outline: 'none',
                fontSize: '14px',
                color: 'var(--color-text)',
                transition: 'all 0.2s ease',
              }}
              className="login-input"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading} style={{ boxShadow: 'var(--shadow-pink)', transition: 'transform 0.2s' }} className="login-btn">
            Entrar no Painel
          </Button>
        </form>
      </div>

      <style>{`
        .login-input:focus {
          border-color: var(--color-primary-dark) !important;
          background-color: #FFFFFF !important;
          box-shadow: 0 0 0 3px rgba(244, 146, 158, 0.15) !important;
        }
        .login-btn:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
