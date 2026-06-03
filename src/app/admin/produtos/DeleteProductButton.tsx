"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminMessage } from '@/components/admin/AdminMessage';
import { Button } from '@/components/ui/Button/Button';
import { Trash2 } from 'lucide-react';
import { deleteProduct } from './actions';

export function DeleteProductButton({ productId }: { productId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este produto? Esta acao nao pode ser desfeita.')) return;

    setIsDeleting(true);
    setError(null);
    const result = await deleteProduct(productId);

    if (result.success) {
      router.refresh();
    } else {
      setError('Erro ao excluir produto: ' + result.error);
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
      {error && (
        <AdminMessage type="error" onDismiss={() => setError(null)}>
          {error}
        </AdminMessage>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        style={{ color: 'var(--color-text-muted)' }}
      >
        <Trash2 size={18} />
      </Button>
    </div>
  );
}
