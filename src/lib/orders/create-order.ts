import { createAdminClient } from '@/lib/supabase/admin';
import { isMissingColumnError } from '@/lib/supabase/errors';

export type OrderInput = {
  customer_name: string;
  customer_phone: string;
  notes?: string;
  total_price: number;
  total_cost?: number;
  payment_method?: string;
  payment_status?: string;
  customer_address?: string;
  delivery_date?: string | null;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  reminder_notes?: string;
  source?: 'admin' | 'storefront';
  items?: { product_id: string; product_name: string; product_price: number; quantity: number }[];
};

function splitOrderData(data: OrderInput) {
  const baseData = {
    customer_name: data.customer_name,
    customer_phone: data.customer_phone,
    notes: data.notes || '',
    total_price: data.total_price,
    total_cost: data.total_cost || 0,
    payment_method: data.payment_method || 'pix',
    payment_status: data.payment_status || 'pending',
    status: 'new',
  };

  return {
    baseData,
    fullData: {
      ...baseData,
      customer_address: data.customer_address || '',
      delivery_date: data.delivery_date || null,
      priority: data.priority || 'normal',
      reminder_notes: data.reminder_notes || '',
      status_history: [{
        status: 'new',
        at: new Date().toISOString(),
        note: data.source === 'storefront' ? 'Pre-pedido criado pela sacola' : 'Pedido criado no admin',
      }],
    },
  };
}

export async function createOrderRecord(data: OrderInput) {
  const supabase = createAdminClient();
  const { baseData, fullData } = splitOrderData(data);
  let orderResult = await supabase.from('orders').insert([fullData]).select('id').single();

  if (orderResult.error && isMissingColumnError(orderResult.error)) {
    orderResult = await supabase.from('orders').insert([baseData]).select('id').single();
  }

  if (orderResult.error || !orderResult.data) {
    return { data: null, error: orderResult.error };
  }

  if (data.items && data.items.length > 0) {
    const orderItemsToInsert = data.items.map((item) => ({
      order_id: orderResult.data.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_price: item.product_price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', orderResult.data.id);
      return { data: null, error: itemsError };
    }
  }

  return { data: { id: orderResult.data.id }, error: null };
}
