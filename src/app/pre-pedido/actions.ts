"use server";

import { recordAuditLog } from '@/lib/audit';
import { applyCouponToCart, registerCouponUse } from '@/lib/coupons/apply';
import { createOrderRecord } from '@/lib/orders/create-order';
import { getOrderProtocol } from '@/lib/orders/protocol';
import { orderSchema } from '@/lib/validations/zod';
import { revalidatePath } from 'next/cache';

export type PreOrderInput = {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_zip_code?: string;
  customer_street?: string;
  customer_number?: string;
  customer_complement?: string;
  customer_neighborhood?: string;
  customer_city?: string;
  customer_state?: string;
  notes?: string;
  total_price: number;
  coupon_code?: string;
  items: {
    product_id: string;
    product_name: string;
    product_price: number;
    quantity: number;
  }[];
};

export async function previewPreOrderCoupon(code: string, items: PreOrderInput['items']) {
  if (items.length === 0) return { success: false, error: 'Adicione produtos antes de aplicar cupom.' };
  const coupon = await applyCouponToCart(code, items);
  if (!coupon.valid) return { success: false, error: coupon.message || 'Cupom invalido.' };
  return { success: true, code: coupon.code, discountAmount: coupon.discountAmount };
}

export async function createPreOrder(data: PreOrderInput) {
  if (data.items.length === 0) {
    return { success: false, error: 'Adicione ao menos um produto na sacola.' };
  }

  const coupon = await applyCouponToCart(data.coupon_code, data.items);
  if (!coupon.valid) {
    return { success: false, error: coupon.message || 'Cupom invalido.' };
  }
  const totalAfterDiscount = Math.max(0, data.total_price - coupon.discountAmount);

  const parsedData = orderSchema.safeParse({
    ...data,
    total_price: totalAfterDiscount,
    total_cost: 0,
    coupon_code: coupon.code || null,
    discount_amount: coupon.discountAmount,
    payment_method: 'pre_order',
    payment_status: 'pending',
    priority: 'normal',
  });

  if (!parsedData.success) {
    return { success: false, error: 'Preencha nome, WhatsApp, endereco de entrega e ao menos um produto.' };
  }

  const orderResult = await createOrderRecord({
    ...parsedData.data,
    source: 'storefront',
    reminder_notes: 'Pre-pedido recebido pela sacola do site. Confirmar disponibilidade, entrega e pagamento pelo WhatsApp.',
  });

  if (orderResult.error || !orderResult.data) {
    console.error('Erro ao criar pre-pedido:', orderResult.error);
    return { success: false, error: orderResult.error?.message || 'Nao foi possivel registrar o pre-pedido.' };
  }

  if (coupon.code && coupon.discountAmount > 0) {
    await registerCouponUse(coupon.code);
  }

  await recordAuditLog({
    action: 'order.preorder',
    entityType: 'order',
    entityId: orderResult.data.id,
    metadata: {
      customer: parsedData.data.customer_name,
      itemCount: parsedData.data.items.length,
      total_price: parsedData.data.total_price,
      coupon_code: coupon.code || null,
      discount_amount: coupon.discountAmount,
    },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/pedidos');
  return {
    success: true,
    orderId: orderResult.data.id,
    protocol: orderResult.data.protocol || getOrderProtocol(orderResult.data.id),
    discountAmount: coupon.discountAmount,
    totalPrice: totalAfterDiscount,
  };
}
