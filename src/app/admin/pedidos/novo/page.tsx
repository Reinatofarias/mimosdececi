"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import { createOrder } from '../actions';

export default function NovoPedidoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    notes: '',
    total_price: '',
    payment_method: 'pix',
    payment_status: 'pending',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const priceCents = Math.round(parseFloat(formData.total_price.replace(',', '.')) * 100);

      const result = await createOrder({
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        notes: formData.notes,
        total_price: priceCents,
        payment_method: formData.payment_method,
        payment_status: formData.payment_status,
      });

      if (result.success) {
        alert('Pedido registrado com sucesso!');
        router.push('/admin/pedidos');
      } else {
        alert('Erro ao registrar pedido: ' + result.error);
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
      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2xl)' }}>Registrar Novo Pedido</h1>
      
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xl)' }}>
        Anote aqui os dados do cliente que fechou a compra com você pelo WhatsApp para acompanhar a entrega.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Nome do Cliente *</label>
              <input 
                type="text" 
                required 
                value={formData.customer_name}
                onChange={e => setFormData({...formData, customer_name: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                placeholder="Ex: Maria Silva"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>WhatsApp do Cliente *</label>
              <input 
                type="text" 
                required 
                value={formData.customer_phone}
                onChange={e => setFormData({...formData, customer_phone: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                placeholder="Ex: (81) 99999-9999"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Valor Total Cobrado (R$) *</label>
              <input 
                type="number" 
                step="0.01"
                required 
                value={formData.total_price}
                onChange={e => setFormData({...formData, total_price: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                placeholder="Ex: 165.00"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Forma de Pagamento</label>
                <select 
                  value={formData.payment_method}
                  onChange={e => setFormData({...formData, payment_method: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                >
                  <option value="pix">PIX</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="debit_card">Cartão de Débito</option>
                  <option value="cash">Dinheiro</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Status do Pagamento</label>
                <select 
                  value={formData.payment_status}
                  onChange={e => setFormData({...formData, payment_status: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                >
                  <option value="pending">Aguardando Pagamento</option>
                  <option value="paid">Pago</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Anotações (Qual produto comprou, endereço, etc)</label>
              <textarea 
                rows={4}
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', resize: 'vertical' }}
                placeholder="O que foi vendido e para onde entregar?"
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)' }}>
          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="lg" isLoading={loading}>
            Salvar Pedido
          </Button>
        </div>

      </form>
    </div>
  );
}
