"use server";

import { type ActionResult, requireAdminAction } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function createCoupon(data: {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  active: boolean;
}): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  const supabase = createAdminClient();
  const { error } = await supabase.from('coupons').insert([{
    ...data,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
  }]);

  if (error) {
    console.error('Erro ao criar cupom:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/cupons');
  return { success: true };
}

export async function toggleCouponActive(id: string, active: boolean): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  const supabase = createAdminClient();
  const { error } = await supabase.from('coupons').update({ active }).eq('id', id);

  if (error) {
    console.error('Erro ao atualizar cupom:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/cupons');
  return { success: true };
}

export async function deleteCoupon(id: string): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  const supabase = createAdminClient();
  const { error } = await supabase.from('coupons').delete().eq('id', id);

  if (error) {
    console.error('Erro ao excluir cupom:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/cupons');
  return { success: true };
}
