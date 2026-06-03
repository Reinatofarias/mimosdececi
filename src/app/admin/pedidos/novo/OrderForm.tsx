"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminMessage } from '@/components/admin/AdminMessage';
import { Button } from '@/components/ui/Button/Button';
import { createOrder } from '../actions';
import { PackagePlus, X } from 'lucide-react';
import type { Product } from '@/lib/types/database';

interface OrderFormProps {
  products: Product[];
}

export function OrderForm({ products }: OrderFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    notes: '',
    total_price: '',
    total_cost: '',
    payment_method: 'pix',
    payment_status: 'pending',
    customer_address: '',
    delivery_date: '',
    priority: 'normal',
    reminder_notes: '',
  });

  const [selectedItems, setSelectedItems] = useState<{ product_id: string; product_name: string; product_price: number; cost_price: number; quantity: number }[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const calculatedTotals = React.useMemo(() => {
    const totalPrice = selectedItems.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
    const totalCost = selectedItems.reduce((sum, item) => sum + (item.cost_price * item.quantity), 0);

    return {
      total_price: selectedItems.length > 0 ? (totalPrice / 100).toFixed(2) : '',
      total_cost: selectedItems.length > 0 ? (totalCost / 100).toFixed(2) : '',
    };
  }, [selectedItems]);

  const displayedTotalPrice = formData.total_price || calculatedTotals.total_price;
  const displayedTotalCost = formData.total_cost || calculatedTotals.total_cost;

  const handleAddProduct = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    setSelectedItems(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        return prev.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product_id: product.id, product_name: product.name, product_price: product.price, cost_price: product.cost_price || 0, quantity: 1 }];
    });

    setSelectedProductId('');
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedItems(prev => prev.filter(item => item.product_id !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const priceCents = Math.round(parseFloat(displayedTotalPrice.replace(',', '.')) * 100);
      const costCents = displayedTotalCost ? Math.round(parseFloat(displayedTotalCost.replace(',', '.')) * 100) : 0;

      const result = await createOrder({
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        notes: formData.notes,
        total_price: priceCents,
        total_cost: costCents,
        payment_method: formData.payment_method,
        payment_status: formData.payment_status,
        customer_address: formData.customer_address,
        delivery_date: formData.delivery_date || null,
        priority: formData.priority,
        reminder_notes: formData.reminder_notes,
        items: selectedItems,
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Pedido registrado com sucesso.' });
        router.push('/admin/pedidos');
      } else {
        setMessage({ type: 'error', text: 'Erro ao registrar pedido: ' + result.error });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Ocorreu um erro inesperado.' });
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
        {message && (
          <AdminMessage type={message.type} onDismiss={() => setMessage(null)}>
            {message.text}
          </AdminMessage>
        )}
        
        {/* Formulário do Cliente */}
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
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Endereço de Entrega</label>
              <input
                type="text"
                value={formData.customer_address}
                onChange={e => setFormData({...formData, customer_address: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                placeholder="Rua, número, bairro e referência"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Lembretes Internos</label>
              <textarea
                rows={3}
                value={formData.reminder_notes}
                onChange={e => setFormData({...formData, reminder_notes: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', resize: 'vertical' }}
                placeholder="Ex: Confirmar horário um dia antes, enviar foto antes da entrega..."
              />
            </div>
          </div>
        </div>

        {/* Seleção de Produtos */}
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: 500, fontSize: '1.1rem' }}>Produtos do Pedido</label>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-lg)' }}>
            <select 
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            >
              <option value="">Selecione um produto cadastrado...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} - R$ {(p.price / 100).toFixed(2).replace('.', ',')}
                </option>
              ))}
            </select>
            <Button type="button" variant="outline" onClick={handleAddProduct} disabled={!selectedProductId}>
              <PackagePlus size={18} style={{ marginRight: '6px' }} /> Adicionar
            </Button>
          </div>

          {selectedItems.length > 0 && (
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedItems.map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg-warm)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{item.quantity}x</span> {item.product_name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>R$ {((item.product_price * item.quantity) / 100).toFixed(2).replace('.', ',')}</span>
                      <button type="button" onClick={() => handleRemoveProduct(item.product_id)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <X size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Valor Total Cobrado (R$) *</label>
              <input 
                type="number" 
                step="0.01"
                required 
                value={displayedTotalPrice}
                onChange={e => setFormData({...formData, total_price: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                placeholder="Ex: 165.00"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Custo dos Materiais (R$)</label>
              <input 
                type="number" 
                step="0.01"
                value={displayedTotalCost}
                onChange={e => setFormData({...formData, total_cost: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                placeholder="Ex: 45.50"
              />
            </div>
          </div>
        </div>

        {/* Pagamento e Anotações */}
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Data Combinada de Entrega</label>
                <input
                  type="datetime-local"
                  value={formData.delivery_date}
                  onChange={e => setFormData({...formData, delivery_date: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Prioridade</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                >
                  <option value="low">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Anotações Especiais (Endereço, cartão, etc)</label>
              <textarea 
                rows={4}
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', resize: 'vertical' }}
                placeholder="O que mais você precisa lembrar deste pedido?"
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
