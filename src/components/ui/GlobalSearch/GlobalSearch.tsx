"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { searchProducts } from '@/lib/dal/search';
import type { Product } from '@/lib/types/database';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      const data = await searchProducts(query);
      setResults(data);
      setIsLoading(false);
    };
    
    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Format price helper
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--space-2xl) var(--space-md)'
          }}
        >
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '8px' }}
          >
            <X size={32} />
          </button>

          <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', marginTop: 'var(--space-3xl)' }}>
            <div style={{ position: 'relative', borderBottom: '2px solid var(--color-primary)', display: 'flex', alignItems: 'center' }}>
              <Search size={32} color="var(--color-primary-darker)" style={{ marginRight: '16px' }} />
              <input 
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="O que você está procurando?"
                style={{
                  width: '100%',
                  fontSize: 'var(--text-3xl)',
                  fontFamily: 'var(--font-display)',
                  border: 'none',
                  background: 'transparent',
                  padding: '16px 0',
                  color: 'var(--color-text)',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginTop: 'var(--space-xl)' }}>
              {isLoading && <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)' }}>Buscando...</p>}
              {!isLoading && query.length >= 2 && results.length === 0 && (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)' }}>Nenhum mimo encontrado para "{query}".</p>
              )}
              
              {!isLoading && results.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {results.map((product) => (
                    <motion.li 
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Link 
                        href={`/produto/${product.slug}`}
                        onClick={onClose}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          padding: '16px', 
                          borderRadius: '12px',
                          textDecoration: 'none',
                          backgroundColor: 'var(--color-surface)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                          transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        className="search-result-item"
                      >
                        <span style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text)', fontWeight: 500 }}>{product.name}</span>
                        <span style={{ fontSize: 'var(--text-lg)', color: 'var(--color-primary-darker)', fontWeight: 600 }}>{formatPrice(product.price)}</span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            .search-result-item:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(244, 146, 158, 0.2) !important;
            }
          `}} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
