"use client";

import React, { useTransition } from 'react';
import { Order } from '@/lib/dal/orders';
import { updateOrderStatus, updatePaymentStatus, deleteOrder } from './actions';
import { Trash2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';

interface KanbanBoardProps {
  orders: Order[];
}

const COLUMNS = [
  { id: 'new', title: 'Novos', color: '#FFC107' },
  { id: 'confirmed', title: 'Confirmados', color: '#2196F3' },
  { id: 'in_production', title: 'Em Produção', color: '#9C27B0' },
  { id: 'ready', title: 'Prontos', color: '#FF9800' },
  { id: 'delivered', title: 'Entregues', color: '#4CAF50' },
];

export function KanbanBoard({ orders }: KanbanBoardProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (orderId: string, newStatus: string) => {
    startTransition(async () => {
      await updateOrderStatus(orderId, newStatus);
    });
  };

  const handlePaymentToggle = (orderId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    startTransition(async () => {
      await updatePaymentStatus(orderId, newStatus);
    });
  };

  const handleDelete = async (orderId: string) => {
    if (confirm('Tem certeza que deseja excluir este pedido?')) {
      startTransition(async () => {
        await deleteOrder(orderId);
      });
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'pix': return 'PIX';
      case 'credit_card': return 'Crédito';
      case 'debit_card': return 'Débito';
      case 'cash': return 'Dinheiro';
      default: return method;
    }
  };

  return (
    <div style={{ display: 'flex', gap: 'var(--space-md)', overflowX: 'auto', paddingBottom: 'var(--space-md)', minHeight: '600px', alignItems: 'flex-start' }}>
      {COLUMNS.map(column => {
        const columnOrders = orders.filter(o => o.status === column.id);

        return (
          <div key={column.id} style={{ 
            minWidth: '300px', 
            width: '300px', 
            backgroundColor: 'var(--color-surface-hover)', 
            borderRadius: 'var(--radius-lg)', 
            padding: 'var(--space-md)',
            borderTop: `4px solid ${column.color}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{column.title}</h3>
              <span style={{ backgroundColor: 'var(--color-surface)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                {columnOrders.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {columnOrders.map(order => (
                <div key={order.id} style={{ 
                  backgroundColor: 'var(--color-surface)', 
                  padding: 'var(--space-md)', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  opacity: isPending ? 0.7 : 1
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <strong>{order.customer_name}</strong>
                    <button 
                      onClick={() => handleDelete(order.id)}
                      disabled={isPending}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                      title="Excluir Pedido"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                    {new Date(order.created_at).toLocaleDateString('pt-BR')}
                  </div>

                  <div style={{ fontWeight: 600, color: 'var(--color-primary-dark)', marginBottom: '12px' }}>
                    {formatPrice(order.total_price)}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)' }}>
                      {getPaymentMethodLabel(order.payment_method)}
                    </span>
                    <button
                      onClick={() => handlePaymentToggle(order.id, order.payment_status)}
                      disabled={isPending}
                      style={{ 
                        fontSize: '12px', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        backgroundColor: order.payment_status === 'paid' ? '#4CAF5020' : '#F4433620',
                        color: order.payment_status === 'paid' ? '#4CAF50' : '#F44336',
                      }}
                    >
                      {order.payment_status === 'paid' ? '🟢 Pago' : '🔴 Pendente'}
                    </button>
                  </div>

                  {order.notes && (
                    <div style={{ fontSize: '13px', backgroundColor: 'var(--color-bg-warm)', padding: '8px', borderRadius: '4px', marginBottom: '12px', color: 'var(--color-text-secondary)' }}>
                      {order.notes}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select 
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                      disabled={isPending}
                      style={{ 
                        flexGrow: 1, 
                        padding: '6px', 
                        borderRadius: '4px', 
                        border: '1px solid var(--color-border)',
                        fontSize: '13px'
                      }}
                    >
                      {COLUMNS.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>

                    <a 
                      href={`https://wa.me/55${order.customer_phone.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', backgroundColor: '#25D366', color: 'white', borderRadius: '4px' }}
                      title="Abrir WhatsApp"
                    >
                      <MessageCircle size={18} />
                    </a>
                  </div>

                </div>
              ))}
              {columnOrders.length === 0 && (
                <div style={{ textAlign: 'center', padding: 'var(--space-md)', color: 'var(--color-text-muted)', fontSize: '13px', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                  Vazio
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
