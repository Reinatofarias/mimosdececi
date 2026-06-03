"use server";

import { recordAuditLog } from '@/lib/audit';
import { createOrderRecord } from '@/lib/orders/create-order';
import { orderSchema } from '@/lib/validations/zod';
import { revalidatePath } from 'next/cache';

export type PreOrderInput = {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  notes?: string;
  total_price: number;
  items: {
    product_id: string;
    product_name: string;
    product_price: number;
    quantity: number;
  }[];
};

export async function createPreOrder(data: PreOrderInput) {
  const parsedData = orderSchema.safeParse({
    ...data,
    total_cost: 0,
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
    reminder_notes: 'Pre-pedido recebido pela sacola do site. Confirmar disponibilidade e pagamento pelo WhatsApp.',
  });

  if (orderResult.error || !orderResult.data) {
    console.error('Erro ao criar pre-pedido:', orderResult.error);
    return { success: false, error: orderResult.error?.message || 'Nao foi possivel registrar o pre-pedido.' };
  }

  await recordAuditLog({
    action: 'order.preorder',
    entityType: 'order',
    entityId: orderResult.data.id,
    metadata: {
      customer: parsedData.data.customer_name,
      itemCount: parsedData.data.items.length,
      total_price: parsedData.data.total_price,
    },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/pedidos');
  return { success: true, orderId: orderResult.data.id };
}
