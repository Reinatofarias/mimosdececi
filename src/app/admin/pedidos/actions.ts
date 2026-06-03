"use server";

import { type ActionResult, requireAdminAction } from '@/lib/admin-auth';
import { recordAuditLog } from '@/lib/audit';
import { createAdminClient } from '@/lib/supabase/admin';
import { isMissingColumnError } from '@/lib/supabase/errors';
import { orderSchema } from '@/lib/validations/zod';
import { revalidatePath } from 'next/cache';

const ORDER_STATUSES = new Set(['new', 'confirmed', 'in_production', 'ready', 'delivered', 'cancelled']);
const PAYMENT_STATUSES = new Set(['pending', 'paid']);

type OrderInput = {
  customer_name: string;
  customer_phone: string;
  notes: string;
  total_price: number;
  total_cost: number;
  payment_method: string;
  payment_status: string;
  customer_address?: string;
  delivery_date?: string | null;
  priority?: string;
  reminder_notes?: string;
  items?: { product_id: string; product_name: string; product_price: number; quantity: number }[];
};

function splitOrderData(data: OrderInput) {
  const baseData = {
    customer_name: data.customer_name,
    customer_phone: data.customer_phone,
    notes: data.notes,
    total_price: data.total_price,
    total_cost: data.total_cost,
    payment_method: data.payment_method,
    payment_status: data.payment_status,
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
      status_history: [{ status: 'new', at: new Date().toISOString(), note: 'Pedido criado' }],
    },
  };
}

export async function createOrder(data: OrderInput): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  const parsedData = orderSchema.safeParse(data);
  if (!parsedData.success) {
    console.error('Validation error:', parsedData.error);
    return { success: false, error: 'Dados inválidos. Verifique os campos do formulário.' };
  }

  const supabase = createAdminClient();
  const { baseData, fullData } = splitOrderData(data);
  let orderResult = await supabase.from('orders').insert([fullData]).select('id').single();

  if (orderResult.error && isMissingColumnError(orderResult.error)) {
    orderResult = await supabase.from('orders').insert([baseData]).select('id').single();
  }

  if (orderResult.error || !orderResult.data) {
    console.error('Erro ao criar pedido:', orderResult.error);
    return { success: false, error: orderResult.error?.message || 'Erro desconhecido ao criar pedido.' };
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
      console.error('Erro ao inserir itens do pedido:', itemsError);
      return { success: false, error: itemsError.message };
    }
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
  const { data: order } = await supabase.from('orders').select('status_history').eq('id', id).single();
  const nextHistory = [
    ...(((order?.status_history as { status: string; at: string; note?: string }[] | null) || [])),
    { status, at: new Date().toISOString() },
  ];
  let updateResult = await supabase.from('orders').update({ status, status_history: nextHistory }).eq('id', id);

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
