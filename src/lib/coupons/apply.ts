import { createAdminClient } from '@/lib/supabase/admin';

export type CouponCartItem = {
  product_id: string;
  product_price: number;
  quantity: number;
};

export type CouponApplyOptions = {
  customer_phone?: string;
};

export type CouponApplication = {
  valid: boolean;
  code?: string;
  discountAmount: number;
  message?: string;
};

type CouponRow = {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number | null;
  max_discount_value: number | null;
  max_uses: number | null;
  current_uses: number | null;
  start_date: string | null;
  end_date: string | null;
  usage_type: 'single' | 'multiple' | null;
  active: boolean;
  applies_to?: {
    product_ids?: string[];
    category_ids?: string[];
  } | null;
};

function normalizePhone(value?: string) {
  return value?.replace(/\D/g, '') || '';
}

export async function applyCouponToCart(code: string | undefined, items: CouponCartItem[], options: CouponApplyOptions = {}): Promise<CouponApplication> {
  const normalizedCode = code?.trim().toUpperCase();
  if (!normalizedCode) return { valid: true, discountAmount: 0 };

  const supabase = createAdminClient();
  const subtotal = items.reduce((sum, item) => sum + item.product_price * item.quantity, 0);
  const { data, error } = await supabase
    .from('coupons')
    .select('id, code, discount_type, discount_value, min_order_value, max_discount_value, max_uses, current_uses, start_date, end_date, usage_type, active, applies_to')
    .eq('code', normalizedCode)
    .limit(1)
    .single();

  if (error || !data) {
    return { valid: false, discountAmount: 0, message: 'Cupom nao encontrado.' };
  }

  const coupon = data as CouponRow;
  const now = Date.now();
  if (!coupon.active) return { valid: false, discountAmount: 0, message: 'Cupom inativo.' };
  if (coupon.start_date && now < new Date(coupon.start_date).getTime()) return { valid: false, discountAmount: 0, message: 'Cupom ainda nao esta vigente.' };
  if (coupon.end_date && now > new Date(coupon.end_date).getTime()) return { valid: false, discountAmount: 0, message: 'Cupom expirado.' };
  if (coupon.max_uses && (coupon.current_uses || 0) >= coupon.max_uses) return { valid: false, discountAmount: 0, message: 'Limite de uso do cupom atingido.' };
  if (coupon.min_order_value && subtotal < coupon.min_order_value) return { valid: false, discountAmount: 0, message: 'Pedido abaixo do valor minimo do cupom.' };
  const customerPhone = normalizePhone(options.customer_phone);
  if (coupon.usage_type === 'single' && customerPhone) {
    const { data: redemption } = await supabase
      .from('coupon_redemptions')
      .select('id')
      .eq('coupon_id', coupon.id)
      .eq('customer_phone', customerPhone)
      .limit(1)
      .maybeSingle();
    if (redemption?.id) return { valid: false, discountAmount: 0, message: 'Este cliente ja utilizou este cupom.' };
  }

  const [{ data: couponProducts }, { data: couponCategories }] = await Promise.all([
    supabase.from('coupon_products').select('product_id').eq('coupon_id', coupon.id),
    supabase.from('coupon_categories').select('category_id').eq('coupon_id', coupon.id),
  ]);

  const productRules = [
    ...(coupon.applies_to?.product_ids?.filter(Boolean) || []),
    ...((couponProducts || []).map((item) => item.product_id as string).filter(Boolean)),
  ];
  const categoryRules = [
    ...(coupon.applies_to?.category_ids?.filter(Boolean) || []),
    ...((couponCategories || []).map((item) => item.category_id as string).filter(Boolean)),
  ];
  let eligibleSubtotal = subtotal;

  if (productRules.length > 0 || categoryRules.length > 0) {
    const productIds = items.map((item) => item.product_id);
    const { data: products } = await supabase
      .from('products')
      .select('id, category_id')
      .in('id', productIds);
    const eligibleIds = new Set((products || [])
      .filter((product) => productRules.includes(product.id as string) || categoryRules.includes((product.category_id as string | null) || ''))
      .map((product) => product.id as string));

    eligibleSubtotal = items
      .filter((item) => eligibleIds.has(item.product_id))
      .reduce((sum, item) => sum + item.product_price * item.quantity, 0);

    if (eligibleSubtotal <= 0) {
      return { valid: false, discountAmount: 0, message: 'Cupom nao se aplica aos produtos da sacola.' };
    }
  }

  const rawDiscount = coupon.discount_type === 'percentage'
    ? Math.round(eligibleSubtotal * (coupon.discount_value / 100))
    : coupon.discount_value;
  const cappedDiscount = coupon.max_discount_value ? Math.min(rawDiscount, coupon.max_discount_value) : rawDiscount;

  return {
    valid: true,
    code: coupon.code,
    discountAmount: Math.min(cappedDiscount, subtotal),
  };
}

export async function registerCouponUse(code?: string, options: { orderId?: string; customerPhone?: string; discountAmount?: number } = {}) {
  const normalizedCode = code?.trim().toUpperCase();
  if (!normalizedCode) return;

  const supabase = createAdminClient();
  const { data } = await supabase.from('coupons').select('id, current_uses').eq('code', normalizedCode).limit(1).single();
  if (!data?.id) return;
  if (options.orderId) {
    await supabase.from('coupon_redemptions').upsert({
      coupon_id: data.id,
      order_id: options.orderId,
      code: normalizedCode,
      customer_phone: normalizePhone(options.customerPhone),
      discount_amount: Math.max(0, Number(options.discountAmount || 0)),
    }, { onConflict: 'coupon_id,order_id' });
  }
  await supabase.from('coupons').update({ current_uses: ((data.current_uses as number | null) || 0) + 1 }).eq('id', data.id);
}
