"use server";

import { type ActionResult, requireAdminAction } from '@/lib/admin-auth';
import { recordAuditLog } from '@/lib/audit';
import { createAdminClient } from '@/lib/supabase/admin';
import { isMissingColumnError } from '@/lib/supabase/errors';
import { revalidatePath } from 'next/cache';

type CouponInput = {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value?: number | null;
  max_discount_value?: number | null;
  max_uses?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  usage_type?: 'single' | 'multiple';
  applies_to?: {
    product_ids?: string[];
    category_ids?: string[];
  } | null;
  notes?: string | null;
  active: boolean;
};

function getBaseCouponData(data: CouponInput) {
  return {
    code: data.code,
    description: data.description,
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    active: data.active,
  };
}

export async function createCoupon(data: CouponInput): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  const supabase = createAdminClient();
  const fullData = {
    ...getBaseCouponData(data),
    min_order_value: data.min_order_value ?? 0,
    max_discount_value: data.max_discount_value ?? null,
    max_uses: data.max_uses ?? 1000,
    current_uses: 0,
    start_date: data.start_date || new Date().toISOString(),
    end_date: data.end_date || new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
    usage_type: data.usage_type ?? 'multiple',
    applies_to: data.applies_to ?? { product_ids: [], category_ids: [] },
    notes: data.notes ?? null,
  };

  let insertedId: string | undefined;
  const { data: inserted, error } = await supabase.from('coupons').insert([fullData]).select('id').single();

  if (inserted?.id) {
    insertedId = inserted.id;
  }

  if (error) {
    if (!isMissingColumnError(error)) {
      console.error('Erro ao criar cupom:', error);
      return { success: false, error: error.message };
    }

    const { data: fallbackInserted, error: fallbackError } = await supabase
      .from('coupons')
      .insert([{
        ...getBaseCouponData(data),
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
      }])
      .select('id')
      .single();

    if (fallbackError) {
      console.error('Erro ao criar cupom:', fallbackError);
      return { success: false, error: fallbackError.message };
    }
    insertedId = fallbackInserted?.id;
  }

  await recordAuditLog({
    action: 'coupon.create',
    entityType: 'coupon',
    entityId: insertedId,
    metadata: { code: data.code, discount_type: data.discount_type },
  });

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

  await recordAuditLog({
    action: 'coupon.toggle',
    entityType: 'coupon',
    entityId: id,
    metadata: { active },
  });

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

  await recordAuditLog({
    action: 'coupon.delete',
    entityType: 'coupon',
    entityId: id,
  });

  revalidatePath('/admin/cupons');
  return { success: true };
}
