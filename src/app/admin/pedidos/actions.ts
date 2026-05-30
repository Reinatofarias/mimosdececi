"use server";

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function createOrder(data: {
  customer_name: string;
  customer_phone: string;
  notes: string;
  total_price: number;
  payment_method: string;
  payment_status: string;
}) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('orders')
    .insert([{
      ...data,
      status: 'new'
    }]);

  if (error) {
    console.error('Erro ao criar pedido:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/pedidos');
  return { success: true };
}

export async function updateOrderStatus(id: string, status: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/pedidos');
  return { success: true };
}

export async function updatePaymentStatus(id: string, payment_status: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('orders')
    .update({ payment_status })
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar pagamento:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/pedidos');
  return { success: true };
}

export async function deleteOrder(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir pedido:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/pedidos');
  return { success: true };
}
