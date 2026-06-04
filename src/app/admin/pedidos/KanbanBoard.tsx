"use client";

import React, { useTransition, useState } from 'react';
import { Order } from '@/lib/dal/orders';
import type { Product } from '@/lib/types/database';
import { updateOrderStatus, updatePaymentStatus, deleteOrder, updateOrderDetails, updateOrderItems, updatePaymentInfo, confirmOrder } from './actions';
import { Trash2, MessageCircle, CreditCard, Calendar, MapPin, PackagePlus, Search, Eye, X, Save, CheckCircle } from 'lucide-react';
import { AdminMessage } from '@/components/admin/AdminMessage';
import { isMissingColumnError } from '@/lib/supabase/errors';
import { getOrderProtocol } from '@/lib/orders/protocol';

interface KanbanBoardProps {
  orders: Order[];
  products: Product[];
}

type OrderStatus = Order['status'];
type EditableOrderDetails = {
  customer_name: string;
  customer_phone: string;
  customer_zip_code: string;
  customer_street: string;
  customer_number: string;
  customer_complement: string;
  customer_neighborhood: string;
  customer_city: string;
  customer_state: string;
  delivery_date: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes: string;
  reminder_notes: string;
};
type EditableOrderItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  product_cost: number;
  quantity: number;
};
type EditablePayment = {
  payment_status: string;
  payment_method: string;
  amount_paid: string;
  payment_notes: string;
};

const COLUMNS: { id: OrderStatus; title: string; color: string; bgLight: string }[] = [
  { id: 'new', title: 'Novos', color: '#EF7A88', bgLight: '#FFF0F2' },
  { id: 'confirmed', title: 'Confirmados', color: '#5C9EAD', bgLight: '#E8F1F5' },
  { id: 'in_production', title: 'Em Produção', color: '#E4B363', bgLight: '#FAF4E8' },
  { id: 'ready', title: 'Prontos', color: '#90BE6D', bgLight: '#EFF5EA' },
  { id: 'delivered', title: 'Entregues', color: '#4D9078', bgLight: '#EBF2EF' },
];

export function KanbanBoard({ orders: initialOrders, products }: KanbanBoardProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailDraft, setDetailDraft] = useState<EditableOrderDetails | null>(null);
  const [itemDraft, setItemDraft] = useState<EditableOrderItem[]>([]);
  const [paymentDraft, setPaymentDraft] = useState<EditablePayment | null>(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingItems, setSavingItems] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const toDateTimeLocal = (value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailDraft({
      customer_name: order.customer_name || '',
      customer_phone: order.customer_phone || '',
      customer_zip_code: order.customer_zip_code || '',
      customer_street: order.customer_street || '',
      customer_number: order.customer_number || '',
      customer_complement: order.customer_complement || '',
      customer_neighborhood: order.customer_neighborhood || '',
      customer_city: order.customer_city || '',
      customer_state: order.customer_state || '',
      delivery_date: toDateTimeLocal(order.delivery_date),
      priority: (order.priority || 'normal') as EditableOrderDetails['priority'],
      notes: order.notes || '',
      reminder_notes: order.reminder_notes || '',
    });
    setItemDraft((order.order_items || []).map((item) => ({
      id: item.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_price: item.product_price,
      product_cost: item.product_cost || 0,
      quantity: item.quantity,
    })));
    setPaymentDraft({
      payment_status: order.payment_status || 'pending',
      payment_method: order.payment_method || 'pix',
      amount_paid: String(((order.amount_paid || 0) / 100).toFixed(2)),
      payment_notes: order.payment_notes || '',
    });
    setSelectedProductId('');
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const previousOrders = orders;
    
    // Optimistic Update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
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
        if (isMissingColumnError({ message: res.error })) {
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

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'partial': return 'Parcial';
      case 'refunded': return 'Estornado';
      case 'cancelled': return 'Cancelado';
      default: return 'Pendente';
    }
  };

  const getOrderCode = (order: Order) => order.order_code || getOrderProtocol(order.id);

  const buildOrderWhatsappUrl = (order: Order) => {
    const items = order.order_items || [];
    const message = [
      `Ola, ${order.customer_name}! Aqui e a Mimos de Ceci sobre o pedido ${getOrderCode(order)}.`,
      '',
      ...items.map((item) => `- ${item.quantity}x ${item.product_name} (${formatPrice(item.product_price * item.quantity)})`),
      order.discount_amount ? `Desconto: -${formatPrice(order.discount_amount)}` : '',
      `Total: ${formatPrice(order.total_price)}`,
      order.amount_paid ? `Valor pago: ${formatPrice(order.amount_paid)}` : '',
      Math.max(0, (order.total_price || 0) - (order.amount_paid || 0)) > 0 ? `Saldo pendente: ${formatPrice(Math.max(0, (order.total_price || 0) - (order.amount_paid || 0)))}` : '',
      order.delivery_date ? `Entrega combinada: ${new Date(order.delivery_date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}` : '',
      order.customer_address ? `Endereco: ${order.customer_address}` : '',
    ].filter(Boolean).join('\n');
    return `https://wa.me/55${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  };

  const buildConfirmationWhatsappUrl = (order: Order) => {
    const message = [
      `Pedido ${getOrderCode(order)} confirmado na Mimos de Ceci.`,
      '',
      ...(order.order_items || []).map((item) => `- ${item.quantity}x ${item.product_name}`),
      '',
      `Total: ${formatPrice(order.total_price || 0)}`,
      `Pagamento: ${getPaymentStatusLabel(order.payment_status)}${order.amount_paid ? ` (${formatPrice(order.amount_paid)})` : ''}`,
      order.delivery_date ? `Entrega: ${new Date(order.delivery_date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}` : '',
      order.customer_address ? `Endereco: ${order.customer_address}` : '',
    ].filter(Boolean).join('\n');
    return `https://wa.me/55${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  };

  const handleSaveDetails = async () => {
    if (!selectedOrder || !detailDraft) return;
    setSavingDetails(true);
    setErrorAlert(null);
    const result = await updateOrderDetails(selectedOrder.id, {
      ...detailDraft,
      delivery_date: detailDraft.delivery_date ? new Date(detailDraft.delivery_date).toISOString() : null,
    });
    setSavingDetails(false);

    if (!result.success) {
      setErrorAlert(result.error || 'Nao foi possivel salvar os detalhes do pedido.');
      return;
    }

    const updatedOrder: Order = {
      ...selectedOrder,
      ...detailDraft,
      customer_state: detailDraft.customer_state.toUpperCase().slice(0, 2),
      customer_address: [
        detailDraft.customer_zip_code ? `CEP ${detailDraft.customer_zip_code}` : '',
        [detailDraft.customer_street, detailDraft.customer_number].filter(Boolean).join(', '),
        detailDraft.customer_complement,
        detailDraft.customer_neighborhood,
        [detailDraft.customer_city, detailDraft.customer_state].filter(Boolean).join(' - '),
      ].filter(Boolean).join(' | '),
      delivery_date: detailDraft.delivery_date ? new Date(detailDraft.delivery_date).toISOString() : null,
      priority: detailDraft.priority,
    };
    setOrders((current) => current.map((order) => order.id === updatedOrder.id ? updatedOrder : order));
    setSelectedOrder(updatedOrder);
    setErrorAlert('Detalhes do pedido atualizados.');
  };

  const handleAddProductItem = () => {
    const product = products.find((item) => item.id === selectedProductId);
    if (!product) return;
    setItemDraft((current) => {
      const existing = current.find((item) => item.product_id === product.id);
      if (existing) {
        return current.map((item) => item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, {
        id: `draft-${product.id}`,
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        product_cost: product.cost_price || 0,
        quantity: 1,
      }];
    });
    setSelectedProductId('');
  };

  const handleSaveItems = async () => {
    if (!selectedOrder) return;
    setSavingItems(true);
    setErrorAlert(null);
    const result = await updateOrderItems(selectedOrder.id, itemDraft.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      product_price: item.product_price,
      product_cost: item.product_cost,
      quantity: item.quantity,
    })));
    setSavingItems(false);

    if (!result.success || !result.order) {
      setErrorAlert(result.error || 'Nao foi possivel salvar os itens do pedido.');
      return;
    }

    const updatedOrder: Order = {
      ...selectedOrder,
      total_price: result.order.total_price,
      total_cost: result.order.total_cost,
      discount_amount: result.order.discount_amount,
      order_items: result.order.order_items,
    };
    setOrders((current) => current.map((order) => order.id === updatedOrder.id ? updatedOrder : order));
    setSelectedOrder(updatedOrder);
    setItemDraft(result.order.order_items.map((item) => ({ ...item, product_cost: item.product_cost || 0 })));
    setErrorAlert('Itens do pedido atualizados.');
  };

  const handleSavePayment = async () => {
    if (!selectedOrder || !paymentDraft) return;
    setSavingPayment(true);
    setErrorAlert(null);
    const result = await updatePaymentInfo(selectedOrder.id, {
      payment_status: paymentDraft.payment_status,
      payment_method: paymentDraft.payment_method,
      amount_paid: Math.round(Number(paymentDraft.amount_paid.replace(',', '.') || 0) * 100),
      payment_notes: paymentDraft.payment_notes,
    });
    setSavingPayment(false);

    if (!result.success || !result.payment) {
      setErrorAlert(result.error || 'Nao foi possivel salvar o pagamento.');
      return;
    }

    const updatedOrder: Order = {
      ...selectedOrder,
      payment_status: result.payment.payment_status,
      payment_method: result.payment.payment_method,
      amount_paid: result.payment.amount_paid,
      paid_at: result.payment.paid_at,
      payment_notes: result.payment.payment_notes,
    };
    setOrders((current) => current.map((order) => order.id === updatedOrder.id ? updatedOrder : order));
    setSelectedOrder(updatedOrder);
    setErrorAlert('Pagamento atualizado.');
  };

  const handleConfirmSelectedOrder = async () => {
    if (!selectedOrder) return;
    setConfirming(true);
    setErrorAlert(null);
    const result = await confirmOrder(selectedOrder.id);
    setConfirming(false);

    if (!result.success) {
      setErrorAlert(result.error || 'Nao foi possivel confirmar o pedido.');
      return;
    }

    const updatedOrder: Order = { ...selectedOrder, status: 'confirmed', stock_decremented_at: selectedOrder.stock_decremented_at || new Date().toISOString() };
    setOrders((current) => current.map((order) => order.id === updatedOrder.id ? updatedOrder : order));
    setSelectedOrder(updatedOrder);
    setErrorAlert('Pedido confirmado e pronto para producao.');
  };

  const filteredOrders = orders.filter((order) => {
    const searchable = [
      order.customer_name,
      order.customer_phone,
      order.order_code,
      order.notes,
      order.customer_address,
      order.reminder_notes,
      ...(order.order_items || []).map((item) => item.product_name),
    ].filter(Boolean).join(' ').toLowerCase();

    const matchesSearch = searchable.includes(searchTerm.trim().toLowerCase());
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;
    return matchesSearch && matchesPriority && matchesPayment;
  });

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'urgent': return 'Urgente';
      case 'low': return 'Baixa';
      default: return 'Normal';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return { bg: '#FEE2E2', text: '#991B1B' };
      case 'high': return { bg: '#FEF3C7', text: '#92400E' };
      case 'low': return { bg: '#E0F2FE', text: '#075985' };
      default: return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', width: '100%' }}>
      {/* Alert Banner for Database Errors */}
      {errorAlert && (
        <AdminMessage type="warning" onDismiss={() => setErrorAlert(null)}>
          {errorAlert}
        </AdminMessage>
      )}

      <div style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-md)',
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 1fr) 180px 180px',
        gap: 'var(--space-md)',
        alignItems: 'center'
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 10px', background: 'var(--color-bg)' }}>
          <Search size={16} color="var(--color-text-muted)" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar cliente, telefone, endereco ou observacao"
            style={{ width: '100%', border: 0, outline: 0, padding: '10px 0', background: 'transparent' }}
          />
        </label>
        <select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}
        >
          <option value="all">Todas prioridades</option>
          <option value="urgent">Urgente</option>
          <option value="high">Alta</option>
          <option value="normal">Normal</option>
          <option value="low">Baixa</option>
        </select>
        <select
          value={paymentFilter}
          onChange={(event) => setPaymentFilter(event.target.value)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}
        >
          <option value="all">Todos pagamentos</option>
          <option value="pending">Pendente</option>
          <option value="partial">Parcial</option>
          <option value="paid">Pago</option>
          <option value="refunded">Estornado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

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
          const columnOrders = filteredOrders.filter(o => o.status === column.id);

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
                      <div>
                        <strong style={{ fontSize: '14px', color: 'var(--color-text)', fontWeight: 600 }}>{order.customer_name}</strong>
                        <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 2 }}>{getOrderCode(order)} · {order.source === 'storefront' ? 'Site' : 'Admin'}</div>
                      </div>
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

                    {order.delivery_date && (
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />
                        Entrega: {new Date(order.delivery_date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    )}

                    {/* Price */}
                    <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-primary-dark)', marginBottom: '12px' }}>
                      {formatPrice(order.total_price)}
                      <span style={{ display: 'block', marginTop: 2, fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                        Lucro: {formatPrice((order.total_price || 0) - (order.total_cost || 0))}
                      </span>
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
                      <span style={{
                        fontSize: '10px',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontWeight: 700,
                        backgroundColor: getPriorityColor(order.priority).bg,
                        color: getPriorityColor(order.priority).text,
                      }}>
                        {getPriorityLabel(order.priority)}
                      </span>
                      {order.coupon_code && (
                        <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '12px', backgroundColor: '#EEF2FF', color: '#3730A3', fontWeight: 700 }}>
                          {order.coupon_code}
                        </span>
                      )}
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
                          backgroundColor: order.payment_status === 'paid' ? '#E8F5E9' : order.payment_status === 'partial' ? '#FEF3C7' : '#FFEBEE',
                          color: order.payment_status === 'paid' ? '#2E7D32' : order.payment_status === 'partial' ? '#92400E' : '#C62828',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <span style={{ fontSize: '7px' }}>{order.payment_status === 'paid' ? '●' : '●'}</span>
                        {getPaymentStatusLabel(order.payment_status)}
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

                    {order.customer_address && (
                      <div style={{ 
                        fontSize: '11px',
                        display: 'flex',
                        gap: '6px',
                        color: 'var(--color-text-secondary)',
                        marginBottom: '10px',
                        lineHeight: 1.4
                      }}>
                        <MapPin size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                        <span>{order.customer_address}</span>
                      </div>
                    )}

                    {order.reminder_notes && (
                      <div style={{ 
                        fontSize: '11px',
                        backgroundColor: '#FFFBEB',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        marginBottom: '12px',
                        color: '#92400E',
                        borderLeft: '3px solid #F59E0B'
                      }}>
                        {order.reminder_notes}
                      </div>
                    )}

                    {/* Card Actions (Status Select + WhatsApp) */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px' }}>
                      <select 
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
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

                      <button
                        type="button"
                        onClick={() => openOrderDetail(order)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-text)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                        title="Ver detalhes do pedido"
                      >
                        <Eye size={15} />
                      </button>
                      <a 
                        href={buildOrderWhatsappUrl(order)}
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
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(17,17,21,.48)', display: 'grid', placeItems: 'center', padding: 20 }}>
          <section style={{ width: 'min(760px, 100%)', maxHeight: '88vh', overflowY: 'auto', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: '0 24px 70px rgba(0,0,0,.24)' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, padding: '18px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 700 }}>{getOrderCode(selectedOrder)}</div>
                <h2 style={{ margin: '4px 0 0', fontSize: 22 }}>{selectedOrder.customer_name}</h2>
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)' }}>{selectedOrder.source === 'storefront' ? 'Pedido recebido pelo site' : 'Pedido criado no admin'}</p>
              </div>
              <button type="button" onClick={() => { setSelectedOrder(null); setDetailDraft(null); setItemDraft([]); setPaymentDraft(null); }} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--color-text)' }}><X size={22} /></button>
            </header>
            <div style={{ padding: 20, display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                {[
                  ['Total', formatPrice(selectedOrder.total_price || 0)],
                  ['Pago', formatPrice(selectedOrder.amount_paid || 0)],
                  ['Saldo', formatPrice(Math.max(0, (selectedOrder.total_price || 0) - (selectedOrder.amount_paid || 0)))],
                  ['Custo', formatPrice(selectedOrder.total_cost || 0)],
                  ['Lucro', formatPrice((selectedOrder.total_price || 0) - (selectedOrder.total_cost || 0))],
                  ['Pagamento', getPaymentStatusLabel(selectedOrder.payment_status)],
                ].map(([label, value]) => (
                  <div key={label} style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{label}</div>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>

              {paymentDraft && (
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: 14, display: 'grid', gap: 10 }}>
                  <h3 style={{ fontSize: 15, margin: 0 }}>Pagamento e confirmacao</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                    <select value={paymentDraft.payment_status} onChange={(event) => setPaymentDraft({ ...paymentDraft, payment_status: event.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                      <option value="pending">Pendente</option>
                      <option value="partial">Parcial</option>
                      <option value="paid">Pago</option>
                      <option value="refunded">Estornado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                    <select value={paymentDraft.payment_method} onChange={(event) => setPaymentDraft({ ...paymentDraft, payment_method: event.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                      <option value="pix">PIX</option>
                      <option value="credit_card">Credito</option>
                      <option value="debit_card">Debito</option>
                      <option value="cash">Dinheiro</option>
                      <option value="pre_order">Pre-pedido</option>
                    </select>
                    <input value={paymentDraft.amount_paid} onChange={(event) => setPaymentDraft({ ...paymentDraft, amount_paid: event.target.value })} placeholder="Valor pago" type="number" step="0.01" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
                  </div>
                  <textarea rows={2} value={paymentDraft.payment_notes} onChange={(event) => setPaymentDraft({ ...paymentDraft, payment_notes: event.target.value })} placeholder="Observacao financeira" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
                    <button type="button" onClick={handleSavePayment} disabled={savingPayment} style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 8, border: 0, borderRadius: 8, padding: '11px 14px', background: 'var(--color-primary)', color: 'white', fontWeight: 800, cursor: 'pointer' }}>
                      <Save size={16} />
                      {savingPayment ? 'Salvando...' : 'Salvar pagamento'}
                    </button>
                    <button type="button" onClick={handleConfirmSelectedOrder} disabled={confirming || selectedOrder.status === 'confirmed'} style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 8, border: 0, borderRadius: 8, padding: '11px 14px', background: '#111115', color: 'white', fontWeight: 800, cursor: 'pointer' }}>
                      <CheckCircle size={16} />
                      {confirming ? 'Confirmando...' : 'Confirmar pedido'}
                    </button>
                  </div>
                  <a href={buildConfirmationWhatsappUrl(selectedOrder)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-whatsapp)', fontWeight: 800, textDecoration: 'none' }}>
                    Enviar mensagem de confirmacao no WhatsApp
                  </a>
                </div>
              )}

              <div>
                <h3 style={{ fontSize: 15, marginBottom: 8 }}>Itens do pedido</h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  {(selectedOrder.order_items || []).map((item) => (
                    <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
                      <span>{item.quantity}x {item.product_name}</span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{formatPrice(item.product_price * item.quantity)} · custo {formatPrice((item.product_cost || 0) * item.quantity)}</span>
                    </div>
                  ))}
                  {(selectedOrder.order_items || []).length === 0 && <span style={{ color: 'var(--color-text-secondary)' }}>Pedido personalizado sem itens cadastrados.</span>}
                </div>
              </div>

              <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: 14, display: 'grid', gap: 10 }}>
                <h3 style={{ fontSize: 15, margin: 0 }}>Editar itens</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 8 }}>
                  <select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                    <option value="">Adicionar produto cadastrado...</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.name} · {formatPrice(product.price)}</option>
                    ))}
                  </select>
                  <button type="button" onClick={handleAddProductItem} disabled={!selectedProductId} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid var(--color-border)', borderRadius: 8, padding: '0 12px', background: 'var(--color-surface)', cursor: 'pointer', fontWeight: 700 }}>
                    <PackagePlus size={16} />
                    Adicionar
                  </button>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {itemDraft.map((item, index) => (
                    <div key={`${item.id}-${index}`} style={{ display: 'grid', gridTemplateColumns: '1fr 76px 90px 34px', gap: 8, alignItems: 'center' }}>
                      <input value={item.product_name} onChange={(event) => setItemDraft((current) => current.map((draft, draftIndex) => draftIndex === index ? { ...draft, product_name: event.target.value, product_id: null } : draft))} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
                      <input type="number" min={1} value={item.quantity} onChange={(event) => setItemDraft((current) => current.map((draft, draftIndex) => draftIndex === index ? { ...draft, quantity: Math.max(1, Number(event.target.value || 1)) } : draft))} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>{formatPrice(item.product_price * item.quantity)}</span>
                      <button type="button" onClick={() => setItemDraft((current) => current.filter((_, draftIndex) => draftIndex !== index))} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-danger)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                  {itemDraft.length === 0 && <span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>Nenhum item no pedido.</span>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
                    Total previsto: {formatPrice(Math.max(0, itemDraft.reduce((sum, item) => sum + item.product_price * item.quantity, 0) - (selectedOrder.discount_amount || 0)))}
                  </span>
                  <button type="button" onClick={handleSaveItems} disabled={savingItems || itemDraft.length === 0} style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 8, border: 0, borderRadius: 8, padding: '11px 14px', background: 'var(--color-primary)', color: 'white', fontWeight: 800, cursor: 'pointer' }}>
                    <Save size={16} />
                    {savingItems ? 'Salvando...' : 'Salvar itens'}
                  </button>
                </div>
              </div>

              {detailDraft && (
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: 14, display: 'grid', gap: 10 }}>
                  <h3 style={{ fontSize: 15, margin: 0 }}>Editar operacao</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
                    <input value={detailDraft.customer_name} onChange={(event) => setDetailDraft({ ...detailDraft, customer_name: event.target.value })} placeholder="Cliente" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
                    <input value={detailDraft.customer_phone} onChange={(event) => setDetailDraft({ ...detailDraft, customer_phone: event.target.value })} placeholder="WhatsApp" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
                    <input value={detailDraft.delivery_date} onChange={(event) => setDetailDraft({ ...detailDraft, delivery_date: event.target.value })} type="datetime-local" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
                    <select value={detailDraft.priority} onChange={(event) => setDetailDraft({ ...detailDraft, priority: event.target.value as EditableOrderDetails['priority'] })} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                      <option value="normal">Prioridade normal</option>
                      <option value="low">Baixa</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 90px', gap: 10 }}>
                    <input value={detailDraft.customer_zip_code} onChange={(event) => setDetailDraft({ ...detailDraft, customer_zip_code: event.target.value.replace(/\D/g, '').slice(0, 8) })} placeholder="CEP" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
                    <input value={detailDraft.customer_street} onChange={(event) => setDetailDraft({ ...detailDraft, customer_street: event.target.value })} placeholder="Rua / Avenida" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
                    <input value={detailDraft.customer_number} onChange={(event) => setDetailDraft({ ...detailDraft, customer_number: event.target.value })} placeholder="Numero" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                    <input value={detailDraft.customer_complement} onChange={(event) => setDetailDraft({ ...detailDraft, customer_complement: event.target.value })} placeholder="Complemento" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
                    <input value={detailDraft.customer_neighborhood} onChange={(event) => setDetailDraft({ ...detailDraft, customer_neighborhood: event.target.value })} placeholder="Bairro" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
                    <input value={detailDraft.customer_city} onChange={(event) => setDetailDraft({ ...detailDraft, customer_city: event.target.value })} placeholder="Cidade" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
                    <input value={detailDraft.customer_state} onChange={(event) => setDetailDraft({ ...detailDraft, customer_state: event.target.value.toUpperCase().slice(0, 2) })} placeholder="UF" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
                  </div>
                  <textarea rows={3} value={detailDraft.notes} onChange={(event) => setDetailDraft({ ...detailDraft, notes: event.target.value })} placeholder="Observacoes do pedido" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
                  <textarea rows={3} value={detailDraft.reminder_notes} onChange={(event) => setDetailDraft({ ...detailDraft, reminder_notes: event.target.value })} placeholder="Lembretes internos" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
                  <button type="button" onClick={handleSaveDetails} disabled={savingDetails} style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 8, border: 0, borderRadius: 8, padding: '11px 14px', background: 'var(--color-primary)', color: 'white', fontWeight: 800, cursor: 'pointer' }}>
                    <Save size={16} />
                    {savingDetails ? 'Salvando...' : 'Salvar detalhes do pedido'}
                  </button>
                </div>
              )}

              <div>
                <h3 style={{ fontSize: 15, marginBottom: 8 }}>Historico de status</h3>
                <div style={{ display: 'grid', gap: 6 }}>
                  {((selectedOrder.status_history || []) as { status: string; at: string; note?: string }[]).map((entry, index) => (
                    <div key={`${entry.status}-${entry.at}-${index}`} style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {new Date(entry.at).toLocaleString('pt-BR')} · {entry.status}{entry.note ? ` · ${entry.note}` : ''}
                    </div>
                  ))}
                </div>
              </div>

              <a href={buildOrderWhatsappUrl(selectedOrder)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <button type="button" style={{ width: '100%', border: 0, borderRadius: 8, padding: '12px 14px', background: 'var(--color-whatsapp)', color: 'white', fontWeight: 800, cursor: 'pointer' }}>
                  Abrir WhatsApp com resumo do pedido
                </button>
              </a>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
