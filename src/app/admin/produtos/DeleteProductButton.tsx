"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Trash2 } from 'lucide-react';
import { deleteProduct } from './actions';
import { useRouter } from 'next/navigation';

export function DeleteProductButton({ productId }: { productId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) {
      setIsDeleting(true);
      const result = await deleteProduct(productId);
      if (result.success) {
        router.refresh();
      } else {
        alert('Erro ao excluir produto: ' + result.error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleDelete} 
      disabled={isDeleting}
      style={{ color: 'var(--color-text-muted)' }}
    >
      <Trash2 size={18} />
    </Button>
  );
}
