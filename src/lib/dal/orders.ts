import { createAdminClient } from '../supabase/admin';

export type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  status: 'new' | 'confirmed' | 'in_production' | 'ready' | 'delivered' | 'cancelled';
  notes: string;
  total_price: number;
  total_cost: number;
  payment_method: string;
  payment_status: string;
  coupon_code: string | null;
  discount_amount: number;
  cancelled_reason: string | null;
  customer_address?: string;
  delivery_date?: string | null;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  reminder_notes?: string;
  attachments?: { label: string; url: string }[];
  status_history?: { status: string; at: string; note?: string }[];
  created_at: string;
  updated_at: string;
};

export type OrderItemSalesRow = {
  product_name: string;
  quantity: number;
  product_price: number;
};

export async function getOrders(): Promise<Order[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data as Order[];
}

export async function getAllOrderItems(): Promise<OrderItemSalesRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('order_items')
    .select(`
      product_name,
      quantity,
      product_price,
      orders!inner(status)
    `)
    .neq('orders.status', 'cancelled');

  if (error) {
    console.error('Error fetching order items:', error);
    return [];
  }

  return data as OrderItemSalesRow[];
}
