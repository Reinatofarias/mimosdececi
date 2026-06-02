"use server";

import { type ActionResult, requireAdminAction } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { orderSchema } from '@/lib/validations/zod';
import { revalidatePath } from 'next/cache';

const ORDER_STATUSES = new Set(['new', 'confirmed', 'in_production', 'ready', 'delivered', 'cancelled']);
const PAYMENT_STATUSES = new Set(['pending', 'paid']);

export async function createOrder(data: {
  customer_name: string;
  customer_phone: string;
  notes: string;
  total_price: number;
  total_cost: number;
  payment_method: string;
  payment_status: string;
  items?: { product_id: string; product_name: string; product_price: number; quantity: number }[];
}): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  const parsedData = orderSchema.safeParse(data);
  if (!parsedData.success) {
    console.error('Validation error:', parsedData.error);
    return { success: false, error: 'Dados inválidos. Verifique os campos do formulário.' };
  }

  const supabase = createAdminClient();
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([{
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      notes: data.notes,
      total_price: data.total_price,
      total_cost: data.total_cost,
      payment_method: data.payment_method,
      payment_status: data.payment_status,
      status: 'new',
    }])
    .select('id')
    .single();

  if (orderError || !orderData) {
    console.error('Erro ao criar pedido:', orderError);
    return { success: false, error: orderError?.message || 'Erro desconhecido ao criar pedido.' };
  }

  if (data.items && data.items.length > 0) {
    const orderItemsToInsert = data.items.map((item) => ({
      order_id: orderData.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_price: item.product_price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', orderData.id);
      console.error('Erro ao inserir itens do pedido:', itemsError);
      return { success: false, error: itemsError.message };
    }
  }

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
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);

  if (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    return { success: false, error: error.message };
  }

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

  revalidatePath('/admin');
  revalidatePath('/admin/pedidos');
  return { success: true };
}
