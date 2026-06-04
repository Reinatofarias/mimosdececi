"use server";

import { type ActionResult, requireAdminAction } from '@/lib/admin-auth';
import { recordAuditLog } from '@/lib/audit';
import { createOrderRecord, type OrderInput } from '@/lib/orders/create-order';
import { createAdminClient } from '@/lib/supabase/admin';
import { isMissingColumnError } from '@/lib/supabase/errors';
import { orderSchema } from '@/lib/validations/zod';
import { revalidatePath } from 'next/cache';

const ORDER_STATUSES = new Set(['new', 'confirmed', 'in_production', 'ready', 'delivered', 'cancelled']);
const PAYMENT_STATUSES = new Set(['pending', 'paid']);
const STOCK_DECREMENT_STATUSES = new Set(['confirmed', 'in_production', 'ready', 'delivered']);

type OrderDetailsInput = {
  customer_name: string;
  customer_phone: string;
  customer_zip_code?: string;
  customer_street?: string;
  customer_number?: string;
  customer_complement?: string;
  customer_neighborhood?: string;
  customer_city?: string;
  customer_state?: string;
  delivery_date?: string | null;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
  reminder_notes?: string;
};

function buildAddress(data: OrderDetailsInput) {
  return [
    data.customer_zip_code ? `CEP ${data.customer_zip_code}` : '',
    [data.customer_street, data.customer_number].filter(Boolean).join(', '),
    data.customer_complement,
    data.customer_neighborhood,
    [data.customer_city, data.customer_state].filter(Boolean).join(' - '),
  ].filter(Boolean).join(' | ');
}

export async function createOrder(data: OrderInput): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  const parsedData = orderSchema.safeParse(data);
  if (!parsedData.success) {
    console.error('Validation error:', parsedData.error);
    return { success: false, error: 'Dados inválidos. Verifique os campos do formulário.' };
  }

  const orderResult = await createOrderRecord({ ...data, source: 'admin' });

  if (orderResult.error || !orderResult.data) {
    console.error('Erro ao criar pedido:', orderResult.error);
    return { success: false, error: orderResult.error?.message || 'Erro desconhecido ao criar pedido.' };
  }

  await recordAuditLog({ action: 'create', entityType: 'order', entityId: orderResult.data.id, metadata: { customer: data.customer_name } });
  revalidatePath('/admin');
  revalidatePath('/admin/pedidos');
  return { success: true };
}

export async function updateOrderStatus(id: string, status: string): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  if (!ORDER_STATUSES.has(status)) {
    return { success: false, error: 'Status de pedido inválido.' };
  }

  const supabase = createAdminClient();
  let orderResult = await supabase
    .from('orders')
    .select('status, status_history, stock_decremented_at, order_items(product_id, quantity)')
    .eq('id', id)
    .single();
  let canUseStockColumns = true;

  if (orderResult.error && isMissingColumnError(orderResult.error)) {
    canUseStockColumns = false;
    orderResult = await supabase
      .from('orders')
      .select('status_history')
      .eq('id', id)
      .single();
  }

  const order = orderResult.data as {
    status_history?: { status: string; at: string; note?: string }[] | null;
    stock_decremented_at?: string | null;
    order_items?: { product_id: string | null; quantity: number }[];
  } | null;

  if (canUseStockColumns && order && STOCK_DECREMENT_STATUSES.has(status) && !order.stock_decremented_at) {
    const items = (order.order_items || []) as { product_id: string | null; quantity: number }[];
    for (const item of items) {
      if (!item.product_id) continue;
      const { data: product } = await supabase.from('products').select('stock_quantity').eq('id', item.product_id).single();
      const currentStock = Number(product?.stock_quantity || 0);
      await supabase
        .from('products')
        .update({ stock_quantity: Math.max(0, currentStock - Number(item.quantity || 0)) })
        .eq('id', item.product_id);
    }
  }

  const nextHistory = [
    ...(((order?.status_history as { status: string; at: string; note?: string }[] | null) || [])),
    { status, at: new Date().toISOString() },
  ];
  const updatePayload = {
    status,
    status_history: nextHistory,
    stock_decremented_at: canUseStockColumns && order && STOCK_DECREMENT_STATUSES.has(status) && !order.stock_decremented_at ? new Date().toISOString() : order?.stock_decremented_at,
  };
  let updateResult = await supabase.from('orders').update(updatePayload).eq('id', id);

  if (updateResult.error && isMissingColumnError(updateResult.error)) {
    updateResult = await supabase.from('orders').update({ status }).eq('id', id);
  }

  if (updateResult.error) {
    console.error('Erro ao atualizar status do pedido:', updateResult.error);
    return { success: false, error: updateResult.error.message };
  }

  await recordAuditLog({ action: 'status_update', entityType: 'order', entityId: id, metadata: { status } });
  revalidatePath('/admin');
  revalidatePath('/admin/pedidos');
  revalidatePath('/admin/produtos');
  return { success: true };
}

export async function updatePaymentStatus(id: string, payment_status: string): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  if (!PAYMENT_STATUSES.has(payment_status)) {
    return { success: false, error: 'Status de pagamento inválido.' };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('orders').update({ payment_status }).eq('id', id);

  if (error) {
    console.error('Erro ao atualizar pagamento:', error);
    return { success: false, error: error.message };
  }

  await recordAuditLog({ action: 'payment_update', entityType: 'order', entityId: id, metadata: { payment_status } });
  revalidatePath('/admin/pedidos');
  return { success: true };
}

export async function updateOrderDetails(id: string, data: OrderDetailsInput): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  if (!data.customer_name.trim() || !data.customer_phone.trim()) {
    return { success: false, error: 'Nome e telefone do cliente sao obrigatorios.' };
  }

  const supabase = createAdminClient();
  const payload = {
    customer_name: data.customer_name.trim(),
    customer_phone: data.customer_phone.trim(),
    customer_zip_code: data.customer_zip_code?.trim() || '',
    customer_street: data.customer_street?.trim() || '',
    customer_number: data.customer_number?.trim() || '',
    customer_complement: data.customer_complement?.trim() || '',
    customer_neighborhood: data.customer_neighborhood?.trim() || '',
    customer_city: data.customer_city?.trim() || '',
    customer_state: data.customer_state?.trim().toUpperCase().slice(0, 2) || '',
    customer_address: buildAddress(data),
    delivery_date: data.delivery_date || null,
    priority: data.priority || 'normal',
    notes: data.notes?.trim() || '',
    reminder_notes: data.reminder_notes?.trim() || '',
  };

  let updateResult = await supabase.from('orders').update(payload).eq('id', id);

  if (updateResult.error && isMissingColumnError(updateResult.error)) {
    updateResult = await supabase.from('orders').update({
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      notes: payload.notes,
    }).eq('id', id);
  }

  if (updateResult.error) {
    console.error('Erro ao atualizar detalhes do pedido:', updateResult.error);
    return { success: false, error: updateResult.error.message };
  }

  await recordAuditLog({
    action: 'order.details_update',
    entityType: 'order',
    entityId: id,
    metadata: { customer: payload.customer_name, delivery_date: payload.delivery_date, priority: payload.priority },
  });
  revalidatePath('/admin');
  revalidatePath('/admin/pedidos');
  return { success: true };
}

export async function deleteOrder(id: string): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  const supabase = createAdminClient();
  const { error } = await supabase.from('orders').delete().eq('id', id);

  if (error) {
    console.error('Erro ao excluir pedido:', error);
    return { success: false, error: error.message };
  }

  await recordAuditLog({ action: 'delete', entityType: 'order', entityId: id });
  revalidatePath('/admin');
  revalidatePath('/admin/pedidos');
  return { success: true };
}
