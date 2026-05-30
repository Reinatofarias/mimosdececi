"use client";

import React, { useTransition, useState, useEffect } from 'react';
import { Order } from '@/lib/dal/orders';
import { updateOrderStatus, updatePaymentStatus, deleteOrder } from './actions';
import { Trash2, MessageCircle, AlertTriangle, CheckCircle, CreditCard, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';

interface KanbanBoardProps {
  orders: Order[];
}

const COLUMNS = [
  { id: 'new', title: 'Novos', color: '#EF7A88', bgLight: '#FFF0F2' },
  { id: 'confirmed', title: 'Confirmados', color: '#5C9EAD', bgLight: '#E8F1F5' },
  { id: 'in_production', title: 'Em Produção', color: '#E4B363', bgLight: '#FAF4E8' },
  { id: 'ready', title: 'Prontos', color: '#90BE6D', bgLight: '#EFF5EA' },
  { id: 'delivered', title: 'Entregues', color: '#4D9078', bgLight: '#EBF2EF' },
];

export function KanbanBoard({ orders: initialOrders }: KanbanBoardProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Sync component state when server-side props change
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    const previousOrders = orders;
    
    // Optimistic Update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
    setErrorAlert(null);

    startTransition(async () => {
      const res = await updateOrderStatus(orderId, newStatus);
      if (!res.success) {
        // Rollback state on error
        setOrders(previousOrders);
        setErrorAlert(res.error || 'Erro ao mover o pedido de status.');
      }
    });
  };

  const handlePaymentToggle = (orderId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    const previousOrders = orders;

    // Optimistic Update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: newStatus } : o));
    setErrorAlert(null);

    startTransition(async () => {
      const res = await updatePaymentStatus(orderId, newStatus);
      if (!res.success) {
        // Rollback state on error
        setOrders(previousOrders);
        if (res.error?.includes('column') || res.error?.includes('coluna') || res.error?.includes('payment_status')) {
          setErrorAlert('Aviso do Banco de Dados: A coluna "payment_status" não foi encontrada. Certifique-se de executar as atualizações SQL no painel Supabase.');
        } else {
          setErrorAlert(res.error || 'Não foi possível atualizar o pagamento.');
        }
      }
    });
  };

  const handleDelete = async (orderId: string) => {
    if (confirm('Tem certeza que deseja excluir permanentemente este pedido?')) {
      const previousOrders = orders;
      
      // Optimistic Update
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setErrorAlert(null);

      startTransition(async () => {
        const res = await deleteOrder(orderId);
        if (!res.success) {
          // Rollback state on error
          setOrders(previousOrders);
          setErrorAlert(res.error || 'Erro ao tentar excluir o pedido.');
        }
      });
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  };

  const getPaymentMethodLabel = (method: string) => {
    if (!method) return 'Não Informado';
    switch (method.toLowerCase()) {
      case 'pix': return 'PIX';
      case 'credit_card': return 'Crédito';
      case 'debit_card': return 'Débito';
      case 'cash': return 'Dinheiro';
      default: return method.toUpperCase();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', width: '100%' }}>
      {/* Alert Banner for Database Errors */}
      {errorAlert && (
        <div style={{ 
          backgroundColor: '#FFF3CD', 
          borderLeft: '4px solid #FFC107', 
          padding: '16px', 
          borderRadius: 'var(--radius-md)', 
          color: '#856404',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 'var(--space-md)'
        }}>
          <AlertTriangle size={20} color="#856404" />
          <div style={{ flexGrow: 1 }}>
            {errorAlert}
          </div>
          <button 
            onClick={() => setErrorAlert(null)} 
            style={{ fontWeight: 'bold', cursor: 'pointer', opacity: 0.7 }}
          >
            Fecar
          </button>
        </div>
      )}

      {/* Kanban Scrollable Container */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--space-lg)', 
        overflowX: 'auto', 
        paddingBottom: 'var(--space-lg)', 
        minHeight: '650px', 
        alignItems: 'flex-start',
        width: '100%'
      }}>
        {COLUMNS.map(column => {
          const columnOrders = orders.filter(o => o.status === column.id);

          return (
            <div key={column.id} style={{ 
              minWidth: '290px', 
              width: '290px', 
              backgroundColor: 'var(--color-bg-warm)', 
              borderRadius: 'var(--radius-lg)', 
              padding: 'var(--space-md)',
              borderTop: `4px solid ${column.color}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-md)',
              boxShadow: 'var(--shadow-sm)',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              {/* Column Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>{column.title}</h3>
                <span style={{ 
                  backgroundColor: column.bgLight, 
                  color: column.color, 
                  padding: '2px 10px', 
                  borderRadius: '12px', 
                  fontSize: '12px', 
                  fontWeight: 700 
                }}>
                  {columnOrders.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {columnOrders.map(order => (
                  <div key={order.id} style={{ 
                    backgroundColor: 'var(--color-surface)', 
                    padding: 'var(--space-lg)', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 2px 8px rgba(244, 146, 158, 0.05)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    opacity: isPending ? 0.8 : 1,
                    position: 'relative'
                  }} className="kanban-card">
                    {/* Card Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--color-text)', fontWeight: 600 }}>{order.customer_name}</strong>
                      <button 
                        onClick={() => handleDelete(order.id)}
                        disabled={isPending}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: 'var(--color-text-muted)', 
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'color 0.2s'
                        }}
                        className="delete-btn"
                        title="Excluir Pedido"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    
                    {/* Date */}
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </div>

                    {/* Price */}
                    <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-primary-dark)', marginBottom: '12px' }}>
                      {formatPrice(order.total_price)}
                    </div>

                    {/* Custom Badges (Payment Info) */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ 
                        fontSize: '10px', 
                        padding: '3px 8px', 
                        borderRadius: '12px', 
                        backgroundColor: 'var(--color-primary-lightest)', 
                        border: '1px solid var(--color-primary-light)',
                        color: 'var(--color-primary-darkest)',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <CreditCard size={10} />
                        {getPaymentMethodLabel(order.payment_method)}
                      </span>
                      <button
                        onClick={() => handlePaymentToggle(order.id, order.payment_status)}
                        disabled={isPending}
                        title="Clique para alternar status do pagamento"
                        style={{ 
                          fontSize: '10px', 
                          padding: '3px 8px', 
                          borderRadius: '12px', 
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 700,
                          backgroundColor: order.payment_status === 'paid' ? '#E8F5E9' : '#FFEBEE',
                          color: order.payment_status === 'paid' ? '#2E7D32' : '#C62828',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <span style={{ fontSize: '7px' }}>{order.payment_status === 'paid' ? '●' : '●'}</span>
                        {order.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                      </button>
                    </div>

                    {/* Notes (Optional) */}
                    {order.notes && (
                      <div style={{ 
                        fontSize: '11px', 
                        backgroundColor: 'var(--color-bg-pink)', 
                        padding: '8px 10px', 
                        borderRadius: '6px', 
                        marginBottom: '12px', 
                        color: 'var(--color-text-secondary)',
                        borderLeft: '3px solid var(--color-primary)'
                      }}>
                        {order.notes}
                      </div>
                    )}

                    {/* Card Actions (Status Select + WhatsApp) */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px' }}>
                      <select 
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        disabled={isPending}
                        style={{ 
                          flexGrow: 1, 
                          padding: '5px 8px', 
                          borderRadius: '6px', 
                          border: '1px solid var(--color-border)',
                          fontSize: '12px',
                          color: 'var(--color-text)',
                          backgroundColor: 'var(--color-surface)',
                          cursor: 'pointer'
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
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          width: '28px', 
                          height: '28px', 
                          backgroundColor: 'var(--color-whatsapp)', 
                          color: 'white', 
                          borderRadius: '6px',
                          transition: 'background-color 0.2s'
                        }}
                        className="whatsapp-btn"
                        title="Abrir WhatsApp da Cliente"
                      >
                        <MessageCircle size={15} />
                      </a>
                    </div>
                  </div>
                ))}
                {columnOrders.length === 0 && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: 'var(--space-lg) var(--space-md)', 
                    color: 'var(--color-text-muted)', 
                    fontSize: '12px', 
                    border: '1px dashed var(--color-border)', 
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface)' 
                  }}>
                    Sem pedidos
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
        .kanban-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(244, 146, 158, 0.08) !important;
          border-color: var(--color-primary-light) !important;
        }
        .delete-btn:hover {
          color: var(--color-error) !important;
          background-color: var(--color-bg-pink) !important;
        }
        .whatsapp-btn:hover {
          background-color: var(--color-whatsapp-hover) !important;
        }
      `}</style>
    </div>
  );
}
