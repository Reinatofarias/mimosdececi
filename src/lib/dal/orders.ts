import { createAdminClient } from '../supabase/admin';

export type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  status: 'new' | 'confirmed' | 'in_production' | 'ready' | 'delivered' | 'cancelled';
  notes: string;
  total_price: number;
  coupon_code: string | null;
  discount_amount: number;
  cancelled_reason: string | null;
  created_at: string;
  updated_at: string;
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
