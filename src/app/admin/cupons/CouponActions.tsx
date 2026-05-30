"use client";

import React, { useTransition } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Trash2 } from 'lucide-react';
import { deleteCoupon, toggleCouponActive } from './actions';
import { useRouter } from 'next/navigation';

export function CouponActions({ couponId, active }: { couponId: string, active: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleCouponActive(couponId, !active);
      if (!result.success) {
        alert('Erro ao alterar status: ' + result.error);
      }
    });
  };

  const handleDelete = async () => {
    if (confirm('Deseja realmente excluir este cupom?')) {
      const result = await deleteCoupon(couponId);
      if (result.success) {
        router.refresh();
      } else {
        alert('Erro ao excluir cupom: ' + result.error);
      }
    }
  };

  return (
    <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end', alignItems: 'center' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '14px' }}>
        <input 
          type="checkbox" 
          checked={active} 
          onChange={handleToggle}
          disabled={isPending}
        />
        Ativo
      </label>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleDelete} 
        disabled={isPending}
        style={{ color: 'var(--color-text-muted)' }}
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}
