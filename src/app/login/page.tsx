"use client";

import React, { useState } from 'react';
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
      backgroundColor: 'var(--color-bg-warm)',
      padding: 'var(--space-md)'
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--space-2xl)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <h1 className="text-accent" style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-xs)' }}>
          Mimos de Ceci
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2xl)' }}>
          Acesso ao Painel Administrativo
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {error && (
            <div style={{
              backgroundColor: 'var(--color-error)',
              color: 'white',
              padding: 'var(--space-sm)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-sm)'
            }}>
              {error}
            </div>
          )}

          <div style={{ textAlign: 'left' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 500 }}>
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ textAlign: 'left', marginBottom: 'var(--space-sm)' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: 'var(--space-xs)', fontWeight: 500 }}>
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                outline: 'none'
              }}
            />
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={loading}>
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
