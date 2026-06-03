"use client";

import React, { useState } from 'react';
import { createCategory, deleteCategory, toggleCategoryStatus } from './actions';
import { AdminMessage } from '@/components/admin/AdminMessage';
import { Button } from '@/components/ui/Button/Button';
import { Trash2, Plus, Power, PowerOff } from 'lucide-react';
import type { Category } from '@/lib/types/database';

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    setMessage(null);
    const res = await createCategory(newName);
    if (!res.success) {
      setMessage({ type: 'error', text: res.error || 'Nao foi possivel criar a categoria.' });
    } else {
      setNewName('');
      setMessage({ type: 'success', text: 'Categoria criada.' });
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta categoria? Os produtos associados ficarao sem categoria.')) return;
    setMessage(null);
    const res = await deleteCategory(id);
    if (!res.success) {
      setMessage({ type: 'error', text: res.error || 'Nao foi possivel excluir a categoria.' });
    } else {
      setMessage({ type: 'success', text: 'Categoria excluida.' });
    }
  };

  const handleToggle = async (id: string, status: boolean) => {
    setMessage(null);
    const res = await toggleCategoryStatus(id, status);
    if (!res.success) {
      setMessage({ type: 'error', text: res.error || 'Nao foi possivel alterar a categoria.' });
    } else {
      setMessage({ type: 'success', text: status ? 'Categoria desativada.' : 'Categoria ativada.' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {message && (
        <AdminMessage type={message.type} onDismiss={() => setMessage(null)}>
          {message.text}
        </AdminMessage>
      )}

      <div style={{ backgroundColor: 'white', padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Nova Categoria</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ex: Dia das Maes"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
          />
        </div>
        <Button onClick={handleCreate} disabled={loading || !newName.trim()}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Criar
        </Button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
              <th style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Nome</th>
              <th style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Slug</th>
              <th style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Nenhuma categoria cadastrada.</td></tr>
            ) : categories.map((cat) => (
              <tr key={cat.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '16px', fontWeight: 500 }}>{cat.name}</td>
                <td style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>{cat.slug}</td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: cat.active ? '#dcfce7' : '#f1f5f9',
                    color: cat.active ? '#166534' : '#64748b',
                  }}>
                    {cat.active ? 'Ativa' : 'Inativa'}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleToggle(cat.id, cat.active)}
                      style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
                      title={cat.active ? 'Desativar' : 'Ativar'}
                    >
                      {cat.active ? <PowerOff size={18} /> : <Power size={18} />}
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
