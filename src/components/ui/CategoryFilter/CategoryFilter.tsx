"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Category } from '@/lib/types/database';

interface CategoryFilterProps {
  categories: Category[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('categoria');

  const handleSelect = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set('categoria', categoryId);
    } else {
      params.delete('categoria');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  if (!categories || categories.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      overflowX: 'auto',
      paddingBottom: '12px',
      marginBottom: 'var(--space-xl)',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleSelect(null)}
        style={{
          padding: '8px 24px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid',
          borderColor: currentCategory ? 'var(--color-border)' : 'var(--color-primary)',
          backgroundColor: currentCategory ? 'var(--color-surface)' : 'var(--color-primary-light)',
          color: currentCategory ? 'var(--color-text)' : 'var(--color-primary-darker)',
          fontWeight: currentCategory ? 'normal' : '600',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontFamily: 'inherit'
        }}
      >
        Todos os Mimos
      </motion.button>

      {categories.map((category) => {
        const isSelected = currentCategory === category.id;
        
        return (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(category.id)}
            style={{
              padding: '8px 24px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid',
              borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
              backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface)',
              color: isSelected ? 'var(--color-primary-darker)' : 'var(--color-text)',
              fontWeight: isSelected ? '600' : 'normal',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit'
            }}
          >
            {category.name}
          </motion.button>
        );
      })}
      <style dangerouslySetInnerHTML={{__html: `
        div::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
