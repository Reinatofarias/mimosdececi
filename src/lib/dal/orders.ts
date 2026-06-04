import { createAdminClient } from '../supabase/admin';

export type Order = {
  id: string;
  order_code?: string | null;
  source?: 'admin' | 'storefront' | string;
  customer_name: string;
  customer_phone: string;
  status: 'new' | 'confirmed' | 'in_production' | 'ready' | 'delivered' | 'cancelled';
  notes: string;
  total_price: number;
  total_cost: number;
  payment_method: string;
  payment_status: string;
  amount_paid?: number;
  paid_at?: string | null;
  payment_notes?: string;
  coupon_code: string | null;
  discount_amount: number;
  cancelled_reason: string | null;
  customer_address?: string;
  customer_zip_code?: string;
  customer_street?: string;
  customer_number?: string;
  customer_complement?: string;
  customer_neighborhood?: string;
  customer_city?: string;
  customer_state?: string;
  delivery_date?: string | null;
  delivery_fee?: number;
  delivery_window?: string;
  delivery_notes?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  reminder_notes?: string;
  attachments?: { label: string; url: string }[];
  status_history?: { status: string; at: string; note?: string }[];
  stock_decremented_at?: string | null;
  order_items?: OrderItem[];
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  product_cost?: number;
  quantity: number;
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
    .select('*, order_items(*)')
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
