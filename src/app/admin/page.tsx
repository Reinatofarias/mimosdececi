import React from 'react';
import { getProducts } from '@/lib/dal/products';
import { getOrders, getAllOrderItems } from '@/lib/dal/orders';
import { Package, Ticket, ClipboardCheck, Clock, TrendingUp, Trophy } from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboard() {
  const products = await getProducts();
  const activeProducts = products.filter(p => p.active);
  const featuredProducts = products.filter(p => p.featured);

  const orders = await getOrders();
  const pendingOrders = orders.filter(o => ['new', 'confirmed', 'in_production'].includes(o.status));
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  // Financial calculations for current month
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  
  const currentMonthOrders = orders.filter(o => {
    if (o.status === 'cancelled') return false;
    const orderDate = new Date(o.created_at).getTime();
    return orderDate >= currentMonthStart;
  });

  const faturamentoCentavos = currentMonthOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);
  const custoCentavos = currentMonthOrders.reduce((sum, order) => sum + (order.total_cost || 0), 0);
  const lucroCentavos = faturamentoCentavos - custoCentavos;

  const faturamentoStr = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(faturamentoCentavos / 100);
  const custoStr = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(custoCentavos / 100);
  const lucroStr = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lucroCentavos / 100);

  const orderItems = await getAllOrderItems();
  const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {};
  
  orderItems.forEach((item: any) => {
    if (!productStats[item.product_name]) {
      productStats[item.product_name] = { name: item.product_name, quantity: 0, revenue: 0 };
    }
    productStats[item.product_name].quantity += item.quantity || 1;
    productStats[item.product_name].revenue += (item.product_price || 0) * (item.quantity || 1);
  });

  const topProducts = Object.values(productStats).sort((a, b) => b.quantity - a.quantity).slice(0, 5);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
          Painel Executivo
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '6px', fontSize: '14px' }}>
          Bem-vinda de volta ao painel de gestão, Ceci! Acompanhe suas vendas e catálogo.
        </p>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-lg)',
        marginBottom: 'var(--space-md)'
      }}>

        {/* Faturamento do Mês */}
        <div style={{ 
          backgroundColor: 'var(--color-surface)', 
          padding: 'var(--space-lg)', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid rgba(16, 185, 129, 0.2)', 
          borderTop: '4px solid #10B981',
          boxShadow: '0 2px 12px rgba(16, 185, 129, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-secondary)' }}>
              Faturamento (Mês)
            </span>
            <TrendingUp size={16} color="#10B981" />
          </div>
          <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            {faturamentoStr}
          </p>
        </div>

        {/* Custos do Mês */}
        <div style={{ 
          backgroundColor: 'var(--color-surface)', 
          padding: 'var(--space-lg)', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid rgba(239, 68, 68, 0.2)', 
          borderTop: '4px solid #EF4444',
          boxShadow: '0 2px 12px rgba(239, 68, 68, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-secondary)' }}>
              Custos (Mês)
            </span>
            <TrendingUp size={16} color="#EF4444" style={{ transform: 'rotateX(180deg)' }} />
          </div>
          <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            {custoStr}
          </p>
        </div>

        {/* Lucro do Mês */}
        <div style={{ 
          backgroundColor: 'var(--color-surface)', 
          padding: 'var(--space-lg)', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid rgba(59, 130, 246, 0.2)', 
          borderTop: '4px solid #3B82F6',
          boxShadow: '0 2px 12px rgba(59, 130, 246, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-secondary)' }}>
              Lucro Líquido (Mês)
            </span>
            <Package size={16} color="#3B82F6" />
          </div>
          <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            {lucroStr}
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-lg)'
      }}>
        
        {/* Total Products */}
        <div style={{ 
          backgroundColor: 'var(--color-surface)', 
          padding: 'var(--space-lg)', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid rgba(244, 146, 158, 0.1)', 
          borderTop: '4px solid var(--color-primary)',
          boxShadow: '0 2px 12px rgba(244, 146, 158, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-secondary)' }}>
              Total de Produtos
            </span>
            <Package size={16} color="var(--color-primary)" />
          </div>
          <p style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            {products.length}
          </p>
        </div>

        {/* Active Products */}
        <div style={{ 
          backgroundColor: 'var(--color-surface)', 
          padding: 'var(--space-lg)', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid rgba(244, 146, 158, 0.1)', 
          borderTop: '4px solid #5C9EAD',
          boxShadow: '0 2px 12px rgba(244, 146, 158, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-secondary)' }}>
              Produtos Ativos
            </span>
            <TrendingUp size={16} color="#5C9EAD" />
          </div>
          <p style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            {activeProducts.length}
          </p>
        </div>

        {/* Featured */}
        <div style={{ 
          backgroundColor: 'var(--color-surface)', 
          padding: 'var(--space-lg)', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid rgba(244, 146, 158, 0.1)', 
          borderTop: '4px solid var(--color-primary-dark)',
          boxShadow: '0 2px 12px rgba(244, 146, 158, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-secondary)' }}>
              Em Destaque
            </span>
            <Ticket size={16} color="var(--color-primary-dark)" />
          </div>
          <p style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            {featuredProducts.length}
          </p>
        </div>

        {/* Pending Orders */}
        <div style={{ 
          backgroundColor: 'var(--color-surface)', 
          padding: 'var(--space-lg)', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid rgba(244, 146, 158, 0.1)', 
          borderTop: '4px solid #E4B363',
          boxShadow: '0 2px 12px rgba(244, 146, 158, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-secondary)' }}>
              Pedidos Ativos
            </span>
            <Clock size={16} color="#E4B363" />
          </div>
          <p style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, color: '#E4B363', margin: 0 }}>
            {pendingOrders.length}
          </p>
        </div>

        {/* Delivered Orders */}
        <div style={{ 
          backgroundColor: 'var(--color-surface)', 
          padding: 'var(--space-lg)', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid rgba(244, 146, 158, 0.1)', 
          borderTop: '4px solid #90BE6D',
          boxShadow: '0 2px 12px rgba(244, 146, 158, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-secondary)' }}>
              Entregas Realizadas
            </span>
            <ClipboardCheck size={16} color="#90BE6D" />
          </div>
          <p style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, color: '#90BE6D', margin: 0 }}>
            {deliveredOrders.length}
          </p>
        </div>

      </div>

      {/* Top Produtos */}
      <div style={{ backgroundColor: 'var(--color-surface)', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginTop: 'var(--space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-md)' }}>
          <Trophy size={20} color="#E4B363" />
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>Produtos Mais Vendidos (Geral)</h2>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '12px 0', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Mimo</th>
              <th style={{ padding: '12px 0', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'center' }}>Qtd Vendida</th>
              <th style={{ padding: '12px 0', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Faturamento (R$)</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Nenhuma venda registrada ainda.</td></tr>
            ) : topProducts.map((p, index) => (
              <tr key={index} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <td style={{ padding: '12px 0', fontWeight: 500, color: 'var(--color-text)' }}>{p.name}</td>
                <td style={{ padding: '12px 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>{p.quantity}</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600, color: 'var(--color-primary-darker)' }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.revenue / 100)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
