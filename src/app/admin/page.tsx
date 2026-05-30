import React from 'react';

export default function AdminDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-md)' }}>
        Dashboard
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2xl)' }}>
        Bem-vinda ao seu painel administrativo, Ceci!
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--space-md)'
      }}>
        {/* Placeholder cards */}
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)' }}>Produtos Cadastrados</h3>
          <p style={{ fontSize: 'var(--text-4xl)', fontWeight: 700, marginTop: 'var(--space-sm)' }}>--</p>
        </div>
      </div>
    </div>
  );
}
