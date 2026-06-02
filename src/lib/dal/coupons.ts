import { createAdminClient } from '../supabase/admin';

export type Coupon = {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value?: number | null;
  max_discount_value?: number | null;
  max_uses?: number | null;
  current_uses?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  usage_type?: 'single' | 'multiple' | null;
  applies_to?: {
    product_ids?: string[];
    category_ids?: string[];
  } | null;
  notes?: string | null;
  active: boolean;
  created_at: string;
};

export async function getCoupons(): Promise<Coupon[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching coupons:', error);
    return [];
  }

  return data as Coupon[];
}
