"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminMessage } from '@/components/admin/AdminMessage';
import { Button } from '@/components/ui/Button/Button';
import { createCoupon } from '../actions';

export default function NovoCupomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    product_ids: '',
    category_ids: '',
    notes: '',
    active: true,
  });

  const toCents = (value: string) => {
    if (!value.trim()) return null;
    return Math.round(parseFloat(value.replace(',', '.')) * 100);
  };

  const toNumber = (value: string) => value.trim() ? Number(value) : null;
  const toList = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const rawValue = parseFloat(formData.discount_value.replace(',', '.'));
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
        applies_to: {
          product_ids: toList(formData.product_ids),
          category_ids: toList(formData.category_ids),
        },
        notes: formData.notes || null,
        active: formData.active,
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Cupom criado com sucesso.' });
        router.push('/admin/cupons');
      } else {
        setMessage({ type: 'error', text: `Erro ao criar cupom: ${result.error}` });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Ocorreu um erro inesperado.' });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 500,
  };

  return (
    <div style={{ maxWidth: '780px' }}>
      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2xl)' }}>Novo Cupom</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {message && (
          <AdminMessage type={message.type} onDismiss={() => setMessage(null)}>
            {message.text}
          </AdminMessage>
        )}

        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div>
              <label style={labelStyle}>Codigo do Cupom *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                style={{ ...inputStyle, textTransform: 'uppercase' }}
                placeholder="Ex: NAMORADOS10"
              />
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>O codigo que o cliente vai usar no pre-pedido.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div>
                <label style={labelStyle}>Tipo de Desconto</label>
                <select
                  value={formData.discount_type}
                  onChange={e => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                  style={inputStyle}
                >
                  <option value="percentage">Porcentagem (%)</option>
                  <option value="fixed">Valor Fixo (R$)</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Valor do Desconto *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.discount_value}
                  onChange={e => setFormData({ ...formData, discount_value: e.target.value })}
                  style={inputStyle}
                  placeholder={formData.discount_type === 'percentage' ? 'Ex: 10' : 'Ex: 15.00'}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Descricao</label>
              <input
                type="text"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                style={inputStyle}
                placeholder="Ex: Promocao de dia dos namorados do Instagram"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div>
                <label style={labelStyle}>Pedido minimo (R$)</label>
                <input type="number" step="0.01" value={formData.min_order_value} onChange={e => setFormData({ ...formData, min_order_value: e.target.value })} style={inputStyle} placeholder="Ex: 100.00" />
              </div>
              <div>
                <label style={labelStyle}>Desconto maximo (R$)</label>
                <input type="number" step="0.01" value={formData.max_discount_value} onChange={e => setFormData({ ...formData, max_discount_value: e.target.value })} style={inputStyle} placeholder="Para cupons percentuais" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div>
                <label style={labelStyle}>Inicio da validade</label>
                <input type="datetime-local" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Fim da validade</label>
                <input type="datetime-local" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div>
                <label style={labelStyle}>Limite de usos</label>
                <input type="number" min="1" value={formData.max_uses} onChange={e => setFormData({ ...formData, max_uses: e.target.value })} style={inputStyle} placeholder="Sem limite" />
              </div>
              <div>
                <label style={labelStyle}>Tipo de uso</label>
                <select value={formData.usage_type} onChange={e => setFormData({ ...formData, usage_type: e.target.value as 'single' | 'multiple' })} style={inputStyle}>
                  <option value="multiple">Multiuso</option>
                  <option value="single">Uso unico por cliente</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Produtos incluidos</label>
              <input type="text" value={formData.product_ids} onChange={e => setFormData({ ...formData, product_ids: e.target.value })} style={inputStyle} placeholder="IDs separados por virgula. Vazio = todos." />
            </div>

            <div>
              <label style={labelStyle}>Categorias incluidas</label>
              <input type="text" value={formData.category_ids} onChange={e => setFormData({ ...formData, category_ids: e.target.value })} style={inputStyle} placeholder="IDs separados por virgula. Vazio = todas." />
            </div>

            <div>
              <label style={labelStyle}>Notas internas</label>
              <textarea rows={3} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} style={inputStyle} placeholder="Contexto da campanha, canal de divulgacao, excecoes..." />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '8px' }}>
              <input
                type="checkbox"
                checked={formData.active}
                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontWeight: 500 }}>Cupom Ativo</span>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)' }}>
          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="lg" isLoading={loading}>
            Salvar Cupom
          </Button>
        </div>
      </form>
    </div>
  );
}
