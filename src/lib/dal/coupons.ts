import { createClient } from '../supabase/server';

export type Coupon = {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  active: boolean;
  created_at: string;
};

export async function getCoupons(): Promise<Coupon[]> {
  const supabase = await createClient();
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
