"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminMessage } from '@/components/admin/AdminMessage';
import { Button } from '@/components/ui/Button/Button';
import type { Category, Product } from '@/lib/types/database';
import { createCoupon } from '../actions';

type CouponFormProps = {
  products: Pick<Product, 'id' | 'name' | 'price' | 'category_id'>[];
  categories: Pick<Category, 'id' | 'name'>[];
};

export function CouponForm({ products, categories }: CouponFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_order_value: '',
    max_discount_value: '',
    max_uses: '',
    start_date: '',
    end_date: '',
    usage_type: 'multiple' as 'single' | 'multiple',
    notes: '',
    active: true,
  });

  const toCents = (value: string) => value.trim() ? Math.round(Number(value.replace(',', '.')) * 100) : null;
  const toNumber = (value: string) => value.trim() ? Number(value) : null;
  const toggleValue = (current: string[], value: string) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
  const formatMoney = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
  };
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '8px', fontWeight: 500 };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const rawValue = Number(formData.discount_value.replace(',', '.'));
    const valueToSave = formData.discount_type === 'fixed' ? Math.round(rawValue * 100) : rawValue;
    const result = await createCoupon({
      code: formData.code.toUpperCase().replace(/\s+/g, ''),
      description: formData.description,
      discount_type: formData.discount_type,
      discount_value: valueToSave,
      min_order_value: toCents(formData.min_order_value),
      max_discount_value: toCents(formData.max_discount_value),
      max_uses: toNumber(formData.max_uses),
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      usage_type: formData.usage_type,
      applies_to: { product_ids: selectedProducts, category_ids: selectedCategories },
      notes: formData.notes || null,
      active: formData.active,
    });

    setLoading(false);
    if (result.success) {
      router.push('/admin/cupons');
      return;
    }
    setMessage({ type: 'error', text: result.error || 'Nao foi possivel criar o cupom.' });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {message && <AdminMessage type={message.type} onDismiss={() => setMessage(null)}>{message.text}</AdminMessage>}

      <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
          <div>
            <label style={labelStyle}>Codigo do Cupom *</label>
            <input required value={formData.code} onChange={(event) => setFormData({ ...formData, code: event.target.value.toUpperCase() })} style={{ ...inputStyle, textTransform: 'uppercase' }} placeholder="Ex: NAMORADOS10" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)' }}>
            <div>
              <label style={labelStyle}>Tipo de Desconto</label>
              <select value={formData.discount_type} onChange={(event) => setFormData({ ...formData, discount_type: event.target.value as 'percentage' | 'fixed' })} style={inputStyle}>
                <option value="percentage">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Valor do Desconto *</label>
              <input type="number" step="0.01" required value={formData.discount_value} onChange={(event) => setFormData({ ...formData, discount_value: event.target.value })} style={inputStyle} placeholder={formData.discount_type === 'percentage' ? 'Ex: 10' : 'Ex: 15.00'} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Descricao</label>
            <input value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} style={inputStyle} placeholder="Ex: Campanha de dia dos namorados" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)' }}>
            <div>
              <label style={labelStyle}>Pedido minimo (R$)</label>
              <input type="number" step="0.01" value={formData.min_order_value} onChange={(event) => setFormData({ ...formData, min_order_value: event.target.value })} style={inputStyle} placeholder="Ex: 100.00" />
            </div>
            <div>
              <label style={labelStyle}>Desconto maximo (R$)</label>
              <input type="number" step="0.01" value={formData.max_discount_value} onChange={(event) => setFormData({ ...formData, max_discount_value: event.target.value })} style={inputStyle} placeholder="Para percentual" />
            </div>
            <div>
              <label style={labelStyle}>Limite de usos</label>
              <input type="number" min="1" value={formData.max_uses} onChange={(event) => setFormData({ ...formData, max_uses: event.target.value })} style={inputStyle} placeholder="Padrao: 1000" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)' }}>
            <div>
              <label style={labelStyle}>Inicio da validade</label>
              <input type="datetime-local" value={formData.start_date} onChange={(event) => setFormData({ ...formData, start_date: event.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Fim da validade</label>
              <input type="datetime-local" value={formData.end_date} onChange={(event) => setFormData({ ...formData, end_date: event.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Tipo de uso</label>
              <select value={formData.usage_type} onChange={(event) => setFormData({ ...formData, usage_type: event.target.value as 'single' | 'multiple' })} style={inputStyle}>
                <option value="multiple">Multiuso</option>
                <option value="single">Uso unico por cliente</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-md)' }}>
            <div>
              <label style={labelStyle}>Categorias elegiveis</label>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 10, maxHeight: 180, overflowY: 'auto', display: 'grid', gap: 8 }}>
                {categories.map((category) => (
                  <label key={category.id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
                    <input type="checkbox" checked={selectedCategories.includes(category.id)} onChange={() => setSelectedCategories((current) => toggleValue(current, category.id))} />
                    {category.name}
                  </label>
                ))}
                {categories.length === 0 && <span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>Nenhuma categoria cadastrada.</span>}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Produtos elegiveis</label>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 10, maxHeight: 180, overflowY: 'auto', display: 'grid', gap: 8 }}>
                {products.map((product) => (
                  <label key={product.id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
                    <input type="checkbox" checked={selectedProducts.includes(product.id)} onChange={() => setSelectedProducts((current) => toggleValue(current, product.id))} />
                    <span>{product.name} · {formatMoney(product.price)}</span>
                  </label>
                ))}
                {products.length === 0 && <span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>Nenhum produto cadastrado.</span>}
              </div>
            </div>
          </div>

          <textarea rows={3} value={formData.notes} onChange={(event) => setFormData({ ...formData, notes: event.target.value })} style={inputStyle} placeholder="Notas internas da campanha" />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={formData.active} onChange={(event) => setFormData({ ...formData, active: event.target.checked })} />
            <span style={{ fontWeight: 500 }}>Cupom Ativo</span>
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)' }}>
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={loading}>Cancelar</Button>
        <Button type="submit" variant="primary" size="lg" isLoading={loading}>Salvar Cupom</Button>
      </div>
    </form>
  );
}
