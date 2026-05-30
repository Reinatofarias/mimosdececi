import React from 'react';
import Link from 'next/link';
import { getCoupons } from '@/lib/dal/coupons';
import { Button } from '@/components/ui/Button/Button';
import { Plus } from 'lucide-react';
import { CouponActions } from './CouponActions';

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();

  const formatDiscount = (type: string, value: number) => {
    if (type === 'percentage') return `${value}%`;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)' }}>Cupons de Desconto</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>Crie códigos promocionais para divulgar nas redes sociais.</p>
        </div>
        <Link href="/admin/cupons/novo">
          <Button variant="primary" leftIcon={<Plus size={18} />}>
            Novo Cupom
          </Button>
        </Link>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-hover)' }}>
              <th style={{ padding: 'var(--space-md)', fontWeight: 600 }}>Código</th>
              <th style={{ padding: 'var(--space-md)', fontWeight: 600 }}>Desconto</th>
              <th style={{ padding: 'var(--space-md)', fontWeight: 600 }}>Descrição</th>
              <th style={{ padding: 'var(--space-md)', fontWeight: 600, textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  Nenhum cupom cadastrado ainda.
                </td>
              </tr>
            ) : (
              coupons.map(coupon => (
                <tr key={coupon.id} style={{ borderBottom: '1px solid var(--color-border)', opacity: coupon.active ? 1 : 0.6 }}>
                  <td style={{ padding: 'var(--space-md)' }}>
                    <strong style={{ background: 'var(--color-surface-hover)', padding: '4px 8px', borderRadius: '4px', border: '1px dashed var(--color-border)' }}>
                      {coupon.code}
                    </strong>
                  </td>
                  <td style={{ padding: 'var(--space-md)', fontWeight: 500, color: 'var(--color-promo-text)' }}>
                    {formatDiscount(coupon.discount_type, coupon.discount_value)}
                  </td>
                  <td style={{ padding: 'var(--space-md)' }}>
                    {coupon.description || '-'}
                  </td>
                  <td style={{ padding: 'var(--space-md)' }}>
                    <CouponActions couponId={coupon.id} active={coupon.active} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
