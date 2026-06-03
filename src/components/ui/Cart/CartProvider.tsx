"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, ShoppingBag, Trash2, X } from 'lucide-react';
import { createPreOrder } from '@/app/pre-pedido/actions';
import { Button } from '@/components/ui/Button/Button';
import { getOrderProtocol } from '@/lib/orders/protocol';

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  openCart: () => void;
};

type ViaCepResponse = {
  erro?: boolean;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'mimosdececi.cart';

function formatPrice(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}

export function CartProvider({ children, phoneNumber }: { children: React.ReactNode; phoneNumber: string }) {
  const pathname = usePathname();
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as CartItem[];
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [zipLookup, setZipLookup] = useState<{ zipCode: string; loading: boolean; error: string | null }>({ zipCode: '', loading: false, error: null });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [completedOrder, setCompletedOrder] = useState<{
    orderId: string;
    protocol: string;
    total: number;
    customerName: string;
    customerPhone: string;
    itemCount: number;
    whatsappUrl: string;
  } | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const zipCode = customer.zipCode.replace(/\D/g, '');

    if (zipCode.length !== 8) {
      return;
    }

    const controller = new AbortController();

    fetch(`https://viacep.com.br/ws/${zipCode}/json/`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Falha ao consultar CEP.');
        const data = await response.json() as ViaCepResponse;
        if (data.erro) throw new Error('CEP nao encontrado.');

        setCustomer((current) => {
          if (current.zipCode !== zipCode) return current;
          return {
            ...current,
            street: data.logradouro || current.street,
            complement: current.complement || data.complemento || '',
            neighborhood: data.bairro || current.neighborhood,
            city: data.localidade || current.city,
            state: data.uf || current.state,
          };
        });
        setZipLookup((current) => current.zipCode === zipCode ? { zipCode, loading: false, error: null } : current);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setZipLookup((current) => current.zipCode === zipCode
          ? { zipCode, loading: false, error: error instanceof Error ? error.message : 'Nao foi possivel consultar o CEP.' }
          : current);
      });

    return () => controller.abort();
  }, [customer.zipCode]);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const hideCart = pathname?.startsWith('/admin');
  const deliveryAddress = [
    customer.zipCode ? `CEP ${customer.zipCode}` : '',
    [customer.street, customer.number].filter(Boolean).join(', '),
    customer.complement,
    customer.neighborhood,
    [customer.city, customer.state].filter(Boolean).join(' - '),
  ].filter(Boolean).join(' | ');

  const value = useMemo<CartContextValue>(() => ({
    items,
    addItem(item) {
      setCompletedOrder(null);
      setItems((prev) => {
        const existing = prev.find((cartItem) => cartItem.id === item.id);
        if (existing) {
          return prev.map((cartItem) => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem);
        }
        return [...prev, { ...item, quantity: 1 }];
      });
      setMessage(null);
      setOpen(true);
    },
    removeItem(id) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    updateQuantity(id, quantity) {
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item));
    },
    openCart() {
      setOpen(true);
    },
  }), [items]);

  const buildWhatsappMessage = (protocol?: string) => encodeURIComponent([
    'Ola! Quero confirmar um pre-pedido na Mimos de Ceci.',
    protocol ? `Protocolo do pre-pedido: ${protocol}` : '',
    '',
    ...items.map((item) => `- ${item.quantity}x ${item.name} (${formatPrice(item.price * item.quantity)})`),
    '',
    `Total estimado: ${formatPrice(total)}`,
    '',
    `Nome: ${customer.name}`,
    `Telefone: ${customer.phone}`,
    `Endereco: ${deliveryAddress}`,
    `Observacoes: ${customer.notes}`,
  ].filter((line) => line !== '').join('\n'));

  const handleZipCodeChange = (value: string) => {
    const zipCode = value.replace(/\D/g, '').slice(0, 8);
    setCustomer((current) => ({ ...current, zipCode }));
    setZipLookup({ zipCode, loading: zipCode.length === 8, error: null });
  };

  const handlePreOrder = async () => {
    setMessage(null);

    if (items.length === 0) {
      setMessage({ type: 'error', text: 'Adicione ao menos um produto na sacola.' });
      return;
    }

    if (!customer.name.trim() || !customer.phone.trim() || !customer.zipCode.trim() || !customer.street.trim() || !customer.number.trim() || !customer.neighborhood.trim() || !customer.city.trim() || !customer.state.trim()) {
      setMessage({ type: 'error', text: 'Preencha nome, WhatsApp, CEP e endereco de entrega.' });
      return;
    }

    setSubmitting(true);
    const result = await createPreOrder({
      customer_name: customer.name.trim(),
      customer_phone: customer.phone.trim(),
      customer_address: deliveryAddress,
      notes: customer.notes.trim(),
      total_price: total,
      items: items.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
      })),
    });
    setSubmitting(false);

    if (!result.success) {
      setMessage({ type: 'error', text: result.error || 'Nao foi possivel registrar o pedido.' });
      return;
    }

    const protocol = result.protocol || getOrderProtocol(result.orderId);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${buildWhatsappMessage(protocol)}`;
    setCompletedOrder({
      orderId: result.orderId,
      protocol,
      total,
      customerName: customer.name.trim(),
      customerPhone: customer.phone.trim(),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      whatsappUrl,
    });
    setMessage({ type: 'success', text: 'Pedido registrado em Novos no CRM.' });
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setItems([]);
    setCustomer({ name: '', phone: '', zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', notes: '' });
    setZipLookup({ zipCode: '', loading: false, error: null });
  };

  const handleCloseCart = () => {
    setOpen(false);
    setMessage(null);
    if (completedOrder) {
      setCompletedOrder(null);
    }
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {!hideCart && items.length > 0 && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            bottom: 94,
            right: 24,
            zIndex: 8999,
            border: 0,
            borderRadius: 999,
            background: '#111115',
            color: 'white',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,.2)',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          <ShoppingBag size={18} />
          {items.reduce((sum, item) => sum + item.quantity, 0)}
        </button>
      )}

      {!hideCart && open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,.45)', display: 'flex', justifyContent: 'flex-end' }}>
          <aside style={{ width: '420px', maxWidth: '100%', height: '100%', background: 'white', padding: 24, overflowY: 'auto', boxShadow: '-12px 0 32px rgba(0,0,0,.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 24 }}>Sacola</h2>
              <button type="button" onClick={handleCloseCart} style={{ border: 0, background: 'transparent', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            {completedOrder ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ padding: 14, borderRadius: 10, background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', fontWeight: 700 }}>
                  Pedido registrado em Novos no CRM.
                </div>
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, padding: 14, background: 'var(--color-bg)' }}>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Protocolo do pedido</div>
                  <strong style={{ display: 'block', wordBreak: 'break-all' }}>{completedOrder.protocol}</strong>
                  <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 14 }}>
                    <div>
                      <div style={{ color: 'var(--color-text-secondary)' }}>Cliente</div>
                      <strong>{completedOrder.customerName}</strong>
                    </div>
                    <div>
                      <div style={{ color: 'var(--color-text-secondary)' }}>WhatsApp</div>
                      <strong>{completedOrder.customerPhone}</strong>
                    </div>
                    <div>
                      <div style={{ color: 'var(--color-text-secondary)' }}>Itens</div>
                      <strong>{completedOrder.itemCount}</strong>
                    </div>
                    <div>
                      <div style={{ color: 'var(--color-text-secondary)' }}>Total</div>
                      <strong>{formatPrice(completedOrder.total)}</strong>
                    </div>
                  </div>
                </div>
                <a href={completedOrder.whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" fullWidth leftIcon={<MessageCircle size={18} />}>
                    Abrir WhatsApp novamente
                  </Button>
                </a>
                <Button type="button" variant="outline" fullWidth onClick={handleCloseCart}>
                  Continuar comprando
                </Button>
              </div>
            ) : items.length === 0 ? (
              <p style={{ color: 'var(--color-text-secondary)' }}>Sua sacola esta vazia.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {items.map((item) => (
                  <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
                    <div>
                      <strong>{item.name}</strong>
                      <p style={{ margin: '4px 0', color: 'var(--color-text-secondary)' }}>{formatPrice(item.price)}</p>
                      <input type="number" min={1} value={item.quantity} onChange={(e) => value.updateQuantity(item.id, Number(e.target.value))} style={{ width: 70, padding: 6, borderRadius: 6, border: '1px solid var(--color-border)' }} />
                    </div>
                    <button type="button" onClick={() => value.removeItem(item.id)} style={{ border: 0, background: 'transparent', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            )}

            {!completedOrder && <div style={{ marginTop: 18, fontSize: 20, fontWeight: 800 }}>Total: {formatPrice(total)}</div>}

            {!completedOrder && <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {message && (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                  color: message.type === 'success' ? '#047857' : '#991B1B',
                  border: `1px solid ${message.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
                  fontSize: 14,
                  fontWeight: 700,
                }}>
                  {message.text}
                </div>
              )}
              <input placeholder="Nome" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
              <input placeholder="WhatsApp" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input placeholder="CEP" inputMode="numeric" autoComplete="postal-code" value={customer.zipCode} onChange={(e) => handleZipCodeChange(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
                <input placeholder="UF" value={customer.state} onChange={(e) => setCustomer({ ...customer, state: e.target.value.toUpperCase().slice(0, 2) })} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
              </div>
              {zipLookup.zipCode === customer.zipCode && (zipLookup.loading || zipLookup.error) && (
                <div style={{ marginTop: -4, fontSize: 12, color: zipLookup.error ? '#991B1B' : 'var(--color-text-secondary)' }}>
                  {zipLookup.loading ? 'Buscando endereco pelo CEP...' : zipLookup.error}
                </div>
              )}
              <input placeholder="Rua / Avenida" value={customer.street} onChange={(e) => setCustomer({ ...customer, street: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 8 }}>
                <input placeholder="Numero" value={customer.number} onChange={(e) => setCustomer({ ...customer, number: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
                <input placeholder="Complemento" value={customer.complement} onChange={(e) => setCustomer({ ...customer, complement: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input placeholder="Bairro" value={customer.neighborhood} onChange={(e) => setCustomer({ ...customer, neighborhood: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
                <input placeholder="Cidade" value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
              </div>
              <textarea placeholder="Observacoes" rows={3} value={customer.notes} onChange={(e) => setCustomer({ ...customer, notes: e.target.value })} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />
              <Button
                type="button"
                variant="primary"
                fullWidth
                leftIcon={<MessageCircle size={18} />}
                onClick={handlePreOrder}
                isLoading={submitting}
                disabled={items.length === 0}
              >
                Registrar pedido e enviar WhatsApp
              </Button>
            </div>}
          </aside>
        </div>
      )}
    </CartContext.Provider>
  );
}
