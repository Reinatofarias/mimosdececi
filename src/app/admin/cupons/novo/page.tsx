"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import { createCoupon } from '../actions';

export default function NovoCupomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Se for porcentagem, é direto. Se for fixo, multiplica por 100 pra salvar em centavos
      const rawValue = parseFloat(formData.discount_value.replace(',', '.'));
      const valueToSave = formData.discount_type === 'fixed' ? Math.round(rawValue * 100) : rawValue;

      const result = await createCoupon({
        code: formData.code.toUpperCase().replace(/\s+/g, ''),
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: valueToSave,
        active: formData.active,
      });

      if (result.success) {
        alert('Cupom criado com sucesso!');
        router.push('/admin/cupons');
      } else {
        alert('Erro ao criar cupom: ' + result.error);
      }
    } catch (error) {
      console.error(error);
      alert('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2xl)' }}>Novo Cupom</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Código do Cupom *</label>
              <input 
                type="text" 
                required 
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textTransform: 'uppercase' }}
                placeholder="Ex: NAMORADOS10"
              />
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>O código que o cliente vai te mandar no WhatsApp.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Tipo de Desconto</label>
                <select 
                  value={formData.discount_type}
                  onChange={e => setFormData({...formData, discount_type: e.target.value as 'percentage' | 'fixed'})}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                >
                  <option value="percentage">Porcentagem (%)</option>
                  <option value="fixed">Valor Fixo (R$)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Valor do Desconto *
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  required 
                  value={formData.discount_value}
                  onChange={e => setFormData({...formData, discount_value: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                  placeholder={formData.discount_type === 'percentage' ? "Ex: 10" : "Ex: 15.00"}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Descrição (Opcional)</label>
              <input 
                type="text" 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                placeholder="Ex: Promoção de dia dos namorados do Instagram"
              />
            </div>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '8px' }}>
              <input 
                type="checkbox" 
                checked={formData.active}
                onChange={e => setFormData({...formData, active: e.target.checked})}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontWeight: 500 }}>Cupom Ativo (Pode ser usado agora)</span>
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
