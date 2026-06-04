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
    code: data.code.trim().toUpperCase().replace(/\s+/g, ''),
    description: data.description.trim(),
    discount_type: data.discount_type,
    discount_value: Math.max(0, Number(data.discount_value || 0)),
    active: data.active,
  };
}

function normalizeScope(data: CouponInput) {
  return {
    product_ids: [...new Set(data.applies_to?.product_ids?.filter(Boolean) || [])],
    category_ids: [...new Set(data.applies_to?.category_ids?.filter(Boolean) || [])],
  };
}

export async function createCoupon(data: CouponInput): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  if (!data.code.trim()) return { success: false, error: 'Codigo do cupom e obrigatorio.' };
  if (Number(data.discount_value || 0) <= 0) return { success: false, error: 'Valor do desconto deve ser maior que zero.' };
  if (data.discount_type === 'percentage' && Number(data.discount_value) > 100) return { success: false, error: 'Desconto percentual nao pode passar de 100%.' };
  if (data.start_date && data.end_date && new Date(data.end_date).getTime() <= new Date(data.start_date).getTime()) {
    return { success: false, error: 'Fim da validade deve ser posterior ao inicio.' };
  }

  const supabase = createAdminClient();
  const scope = normalizeScope(data);
  const fullData = {
    ...getBaseCouponData(data),
    min_order_value: Math.max(0, Number(data.min_order_value ?? 0)),
    max_discount_value: data.max_discount_value ? Math.max(0, Number(data.max_discount_value)) : null,
    max_uses: data.max_uses ? Math.max(1, Number(data.max_uses)) : 1000,
    current_uses: 0,
    start_date: data.start_date || new Date().toISOString(),
    end_date: data.end_date || new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
    usage_type: data.usage_type ?? 'multiple',
    applies_to: scope,
    notes: data.notes?.trim() || null,
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

  if (insertedId && !error) {
    const productRows = scope.product_ids.map((productId) => ({ coupon_id: insertedId, product_id: productId }));
    const categoryRows = scope.category_ids.map((categoryId) => ({ coupon_id: insertedId, category_id: categoryId }));
    if (productRows.length > 0) {
      const { error: productScopeError } = await supabase.from('coupon_products').insert(productRows);
      if (productScopeError && !isMissingColumnError(productScopeError)) console.error('Erro ao salvar escopo de produtos do cupom:', productScopeError);
    }
    if (categoryRows.length > 0) {
      const { error: categoryScopeError } = await supabase.from('coupon_categories').insert(categoryRows);
      if (categoryScopeError && !isMissingColumnError(categoryScopeError)) console.error('Erro ao salvar escopo de categorias do cupom:', categoryScopeError);
    }
  }

  await recordAuditLog({
    action: 'coupon.create',
    entityType: 'coupon',
    entityId: insertedId,
    metadata: { code: fullData.code, discount_type: data.discount_type, productScope: scope.product_ids.length, categoryScope: scope.category_ids.length },
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
