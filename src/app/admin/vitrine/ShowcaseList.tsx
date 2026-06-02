"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { toggleFeatured } from './actions';
import { Star, Search } from 'lucide-react';
import type { Product } from '@/lib/types/database';

interface ShowcaseListProps {
  products: Product[];
}

export function ShowcaseList({ products }: ShowcaseListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggle = async (id: string, current: boolean) => {
    const res = await toggleFeatured(id, current);
    if (!res.success) alert(res.error);
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        <Search size={20} color="var(--color-text-secondary)" style={{ marginRight: '12px' }} />
        <input 
          type="text" 
          placeholder="Buscar produto para destacar..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px' }}
        />
      </div>

      {/* List */}
      <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
              <th style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Produto</th>
              <th style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'center' }}>Vitrine (Destaque)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={2} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Nenhum produto encontrado.</td></tr>
            ) : filtered.map((product) => (
              <tr key={product.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--color-bg)', position: 'relative' }}>
                      <Image src={product.images?.[0] || '/logo-compact.png'} alt={product.name} fill style={{ objectFit: 'cover' }} />
                    </div>
                    {product.name}
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <button 
                    onClick={() => handleToggle(product.id, product.featured || false)}
                    style={{ 
                      padding: '8px 16px', 
                      background: product.featured ? '#fef08a' : 'none', 
                      border: product.featured ? '1px solid #eab308' : '1px solid var(--color-border)', 
                      borderRadius: 'var(--radius-full)',
                      cursor: 'pointer', 
                      color: product.featured ? '#854d0e' : 'var(--color-text-secondary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 600,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Star size={16} fill={product.featured ? '#eab308' : 'none'} />
                    {product.featured ? 'Em Destaque' : 'Destacar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
