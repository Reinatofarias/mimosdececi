import { createAdminClient } from '@/lib/supabase/admin';
import { isMissingColumnError } from '@/lib/supabase/errors';
import { getOrderProtocol } from './protocol';

export type OrderInput = {
  customer_name: string;
  customer_phone: string;
  notes?: string;
  total_price: number;
  total_cost?: number;
  coupon_code?: string | null;
  discount_amount?: number;
  payment_method?: string;
  payment_status?: string;
  customer_address?: string;
  customer_zip_code?: string;
  customer_street?: string;
  customer_number?: string;
  customer_complement?: string;
  customer_neighborhood?: string;
  customer_city?: string;
  customer_state?: string;
  delivery_date?: string | null;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  reminder_notes?: string;
  source?: 'admin' | 'storefront';
  items?: { product_id: string | null; product_name: string; product_price: number; cost_price?: number; quantity: number }[];
};

function splitOrderData(data: OrderInput) {
  const baseData = {
    customer_name: data.customer_name,
    customer_phone: data.customer_phone,
    notes: data.notes || '',
    total_price: data.total_price,
    total_cost: data.total_cost ?? 0,
    coupon_code: data.coupon_code || null,
    discount_amount: data.discount_amount || 0,
    payment_method: data.payment_method || 'pix',
    payment_status: data.payment_status || 'pending',
    status: 'new',
  };

  return {
    baseData,
    fullData: {
      ...baseData,
      source: data.source || 'admin',
      customer_address: data.customer_address || '',
      customer_zip_code: data.customer_zip_code || '',
      customer_street: data.customer_street || '',
      customer_number: data.customer_number || '',
      customer_complement: data.customer_complement || '',
      customer_neighborhood: data.customer_neighborhood || '',
      customer_city: data.customer_city || '',
      customer_state: data.customer_state || '',
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

type ResolvedOrderItem = {
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  product_cost: number;
  quantity: number;
};

async function resolveOrderFinancials(supabase: ReturnType<typeof createAdminClient>, data: OrderInput) {
  if (!data.items || data.items.length === 0) {
    return { data, items: [] as Omit<ResolvedOrderItem, 'order_id'>[] };
  }

  const productIds = data.items
    .map((item) => item.product_id)
    .filter((id): id is string => Boolean(id));
  const productsById = new Map<string, { id: string; name: string; price: number; cost_price: number }>();

  if (productIds.length > 0) {
    const { data: products, error: productLookupError } = await supabase
      .from('products')
      .select('id, name, price, cost_price')
      .in('id', productIds);

    if (!productLookupError && products) {
      products.forEach((product) => {
        productsById.set(product.id as string, {
          id: product.id as string,
          name: product.name as string,
          price: product.price as number,
          cost_price: (product.cost_price as number | null) ?? 0,
        });
      });
    }
  }

  const items = data.items.map((item) => {
    const product = item.product_id ? productsById.get(item.product_id) : null;
    return {
      product_id: product ? product.id : null,
      product_name: product ? product.name : item.product_name,
      product_price: product ? product.price : item.product_price,
      product_cost: product ? product.cost_price : item.cost_price ?? 0,
      quantity: item.quantity,
    };
  });
  const itemTotalPrice = items.reduce((sum, item) => sum + item.product_price * item.quantity, 0);
  const itemTotalCost = items.reduce((sum, item) => sum + item.product_cost * item.quantity, 0);

  return {
    data: {
      ...data,
      total_price: data.source === 'storefront' ? Math.max(0, itemTotalPrice - (data.discount_amount || 0)) : data.total_price,
      total_cost: itemTotalCost,
    },
    items,
  };
}

export async function createOrderRecord(data: OrderInput) {
  const supabase = createAdminClient();
  const resolvedOrder = await resolveOrderFinancials(supabase, data);
  const { baseData, fullData } = splitOrderData(resolvedOrder.data);
  let orderResult = await supabase.from('orders').insert([fullData]).select('id').single();

  if (orderResult.error && isMissingColumnError(orderResult.error)) {
    orderResult = await supabase.from('orders').insert([baseData]).select('id').single();
  }

  if (orderResult.error || !orderResult.data) {
    return { data: null, error: orderResult.error };
  }

  const protocol = getOrderProtocol(orderResult.data.id);
  const { error: protocolError } = await supabase
    .from('orders')
    .update({ order_code: protocol })
    .eq('id', orderResult.data.id);

  if (protocolError && !isMissingColumnError(protocolError)) {
    console.error('Erro ao salvar protocolo do pedido:', protocolError);
  }

  if (resolvedOrder.items.length > 0) {
    const orderItemsToInsert = resolvedOrder.items.map((item) => ({
      order_id: orderResult.data.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_price: item.product_price,
      product_cost: item.product_cost,
      quantity: item.quantity,
    }));

    let { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);

    if (itemsError && isMissingColumnError(itemsError)) {
      const legacyItems = orderItemsToInsert.map((item) => ({
        order_id: item.order_id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_price: item.product_price,
        quantity: item.quantity,
      }));
      const fallbackResult = await supabase.from('order_items').insert(legacyItems);
      itemsError = fallbackResult.error;
    }

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', orderResult.data.id);
      return { data: null, error: itemsError };
    }
  }

  return { data: { id: orderResult.data.id, protocol }, error: null };
}
