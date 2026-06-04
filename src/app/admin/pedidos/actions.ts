"use server";

import { type ActionResult, requireAdminAction } from '@/lib/admin-auth';
import { recordAuditLog } from '@/lib/audit';
import { createOrderRecord, type OrderInput } from '@/lib/orders/create-order';
import { createAdminClient } from '@/lib/supabase/admin';
import { isMissingColumnError } from '@/lib/supabase/errors';
import { orderSchema } from '@/lib/validations/zod';
import { revalidatePath } from 'next/cache';

const ORDER_STATUSES = new Set(['new', 'confirmed', 'in_production', 'ready', 'delivered', 'cancelled']);
const PAYMENT_STATUSES = new Set(['pending', 'partial', 'paid', 'refunded', 'cancelled']);
const STOCK_DECREMENT_STATUSES = new Set(['confirmed', 'in_production', 'ready', 'delivered']);

type ProductionChecklistItem = {
  key: string;
  label: string;
  done: boolean;
};

const DEFAULT_PRODUCTION_CHECKLIST: ProductionChecklistItem[] = [
  { key: 'inputs', label: 'Separar insumos', done: false },
  { key: 'assembly', label: 'Montar pedido', done: false },
  { key: 'personalization', label: 'Revisar personalizacao', done: false },
  { key: 'packaging', label: 'Embalar', done: false },
  { key: 'final_review', label: 'Conferencia final', done: false },
];

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
  delivery_fee?: number;
  delivery_window?: string;
  delivery_notes?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
  reminder_notes?: string;
};

type OrderItemInput = {
  product_id: string | null;
  product_name: string;
  product_price: number;
  product_cost?: number;
  quantity: number;
};

type PaymentInfoInput = {
  payment_status: string;
  payment_method: string;
  amount_paid: number;
  payment_notes?: string;
};

type ProductionInfoInput = {
  production_assignee?: string;
  production_due_date?: string | null;
  production_checklist?: ProductionChecklistItem[];
  production_notes?: string;
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

function addQuantity(map: Map<string, number>, productId: string | null | undefined, quantity: number) {
  if (!productId) return;
  map.set(productId, (map.get(productId) || 0) + quantity);
}

function normalizeProductionChecklist(items?: ProductionChecklistItem[] | null) {
  const source = Array.isArray(items) && items.length > 0 ? items : DEFAULT_PRODUCTION_CHECKLIST;
  return source.map((item, index) => ({
    key: String(item.key || `step_${index + 1}`).slice(0, 40),
    label: String(item.label || `Etapa ${index + 1}`).trim().slice(0, 80),
    done: Boolean(item.done),
  })).filter((item) => item.label);
}

function isProductionComplete(items?: ProductionChecklistItem[] | null) {
  const checklist = normalizeProductionChecklist(items);
  return checklist.length > 0 && checklist.every((item) => item.done);
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
    .select('status, status_history, stock_decremented_at, production_checklist, production_started_at, production_completed_at, order_items(product_id, quantity)')
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
    production_checklist?: ProductionChecklistItem[] | null;
    production_started_at?: string | null;
    production_completed_at?: string | null;
    order_items?: { product_id: string | null; quantity: number }[];
  } | null;

  if (canUseStockColumns && status === 'ready' && !isProductionComplete(order?.production_checklist)) {
    return { success: false, error: 'Finalize a checklist de producao antes de mover o pedido para Prontos.' };
  }

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
  const now = new Date().toISOString();
  const updatePayload = {
    status,
    status_history: nextHistory,
    stock_decremented_at: canUseStockColumns && order && STOCK_DECREMENT_STATUSES.has(status) && !order.stock_decremented_at ? now : order?.stock_decremented_at,
    production_started_at: canUseStockColumns && status === 'in_production' && !order?.production_started_at ? now : order?.production_started_at,
    production_completed_at: canUseStockColumns && ['ready', 'delivered'].includes(status) && !order?.production_completed_at ? now : order?.production_completed_at,
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

export async function updatePaymentInfo(id: string, data: PaymentInfoInput): Promise<ActionResult & {
  payment?: {
    payment_status: string;
    payment_method: string;
    amount_paid: number;
    paid_at: string | null;
    payment_notes: string;
  };
}> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  if (!PAYMENT_STATUSES.has(data.payment_status)) {
    return { success: false, error: 'Status de pagamento invalido.' };
  }

  const amountPaid = Math.max(0, Number(data.amount_paid || 0));
  const paidAt = data.payment_status === 'paid' ? new Date().toISOString() : null;
  const payload = {
    payment_status: data.payment_status,
    payment_method: data.payment_method || 'pix',
    amount_paid: amountPaid,
    paid_at: paidAt,
    payment_notes: data.payment_notes?.trim() || '',
  };
  const supabase = createAdminClient();
  let updateResult = await supabase.from('orders').update(payload).eq('id', id);

  if (updateResult.error && isMissingColumnError(updateResult.error)) {
    updateResult = await supabase.from('orders').update({
      payment_status: payload.payment_status,
      payment_method: payload.payment_method,
    }).eq('id', id);
  }

  if (updateResult.error) {
    console.error('Erro ao atualizar informacoes de pagamento:', updateResult.error);
    return { success: false, error: updateResult.error.message };
  }

  await recordAuditLog({
    action: 'order.payment_info_update',
    entityType: 'order',
    entityId: id,
    metadata: { payment_status: payload.payment_status, amount_paid: amountPaid, payment_method: payload.payment_method },
  });
  revalidatePath('/admin');
  revalidatePath('/admin/pedidos');
  return { success: true, payment: payload };
}

export async function updateProductionInfo(id: string, data: ProductionInfoInput): Promise<ActionResult & {
  production?: {
    production_assignee: string;
    production_due_date: string | null;
    production_checklist: ProductionChecklistItem[];
    production_notes: string;
    production_started_at: string | null;
    production_completed_at: string | null;
  };
}> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  const checklist = normalizeProductionChecklist(data.production_checklist);
  const isComplete = checklist.every((item) => item.done);
  const payload = {
    production_assignee: data.production_assignee?.trim() || '',
    production_due_date: data.production_due_date || null,
    production_checklist: checklist,
    production_notes: data.production_notes?.trim() || '',
    production_started_at: checklist.some((item) => item.done) ? new Date().toISOString() : null,
    production_completed_at: isComplete ? new Date().toISOString() : null,
  };

  const supabase = createAdminClient();
  const updateResult = await supabase.from('orders').update(payload).eq('id', id);

  if (updateResult.error && isMissingColumnError(updateResult.error)) {
    return { success: false, error: 'Execute a migration de producao no Supabase antes de salvar esta etapa.' };
  }

  if (updateResult.error) {
    console.error('Erro ao atualizar producao do pedido:', updateResult.error);
    return { success: false, error: updateResult.error.message };
  }

  await recordAuditLog({
    action: 'order.production_update',
    entityType: 'order',
    entityId: id,
    metadata: { assignee: payload.production_assignee, completed: isComplete, due_date: payload.production_due_date },
  });
  revalidatePath('/admin');
  revalidatePath('/admin/pedidos');
  return { success: true, production: payload };
}

export async function confirmOrder(id: string): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  const supabase = createAdminClient();
  const { data: order, error } = await supabase
    .from('orders')
    .select('customer_name, customer_phone, customer_address, delivery_date, total_price, delivery_fee, payment_status, amount_paid, order_items(id)')
    .eq('id', id)
    .single();

  if (error || !order) {
    return { success: false, error: error?.message || 'Pedido nao encontrado.' };
  }

  const missing: string[] = [];
  if (!String(order.customer_name || '').trim()) missing.push('cliente');
  if (!String(order.customer_phone || '').trim()) missing.push('WhatsApp');
  if (!String(order.customer_address || '').trim()) missing.push('endereco');
  if (!order.delivery_date) missing.push('data de entrega');
  if (!order.order_items || order.order_items.length === 0) missing.push('itens');
  if (Number(order.total_price || 0) <= 0) missing.push('valor total');
  if (!['partial', 'paid'].includes(String(order.payment_status))) missing.push('pagamento parcial ou pago');
  if (Number(order.amount_paid || 0) <= 0) missing.push('valor pago');
  if (String(order.payment_status) === 'paid' && Number(order.amount_paid || 0) < Number(order.total_price || 0) + Number(order.delivery_fee || 0)) {
    missing.push('valor pago igual ao total com entrega');
  }

  if (missing.length > 0) {
    return { success: false, error: `Antes de confirmar, preencha: ${missing.join(', ')}.` };
  }

  const statusResult = await updateOrderStatus(id, 'confirmed');
  if (!statusResult.success) return statusResult;

  await recordAuditLog({ action: 'order.confirm', entityType: 'order', entityId: id });
  revalidatePath('/admin');
  revalidatePath('/admin/pedidos');
  revalidatePath('/admin/produtos');
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
    delivery_fee: Math.max(0, Number(data.delivery_fee || 0)),
    delivery_window: data.delivery_window?.trim() || '',
    delivery_notes: data.delivery_notes?.trim() || '',
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
    metadata: { customer: payload.customer_name, delivery_date: payload.delivery_date, delivery_window: payload.delivery_window, priority: payload.priority },
  });
  revalidatePath('/admin');
  revalidatePath('/admin/pedidos');
  return { success: true };
}

export async function updateOrderItems(id: string, items: OrderItemInput[]): Promise<ActionResult & {
  order?: {
    total_price: number;
    total_cost: number;
    discount_amount: number;
    order_items: {
      id: string;
      product_id: string | null;
      product_name: string;
      product_price: number;
      product_cost: number;
      quantity: number;
    }[];
  };
}> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  const normalizedItems = items
    .map((item) => ({
      product_id: item.product_id || null,
      product_name: item.product_name.trim(),
      product_price: Number(item.product_price || 0),
      product_cost: Number(item.product_cost || 0),
      quantity: Math.max(1, Number(item.quantity || 1)),
    }))
    .filter((item) => item.product_name && item.product_price >= 0);

  if (normalizedItems.length === 0) {
    return { success: false, error: 'Inclua ao menos um item no pedido.' };
  }

  const supabase = createAdminClient();
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('discount_amount, stock_decremented_at, order_items(product_id, quantity)')
    .eq('id', id)
    .single();

  if (orderError) {
    console.error('Erro ao buscar pedido para editar itens:', orderError);
    return { success: false, error: orderError.message };
  }

  const productIds = normalizedItems
    .map((item) => item.product_id)
    .filter((productId): productId is string => Boolean(productId));
  const productsById = new Map<string, { id: string; name: string; price: number; cost_price: number }>();

  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price, cost_price')
      .in('id', productIds);

    (products || []).forEach((product) => {
      productsById.set(product.id as string, {
        id: product.id as string,
        name: product.name as string,
        price: product.price as number,
        cost_price: (product.cost_price as number | null) || 0,
      });
    });
  }

  const resolvedItems = normalizedItems.map((item) => {
    const product = item.product_id ? productsById.get(item.product_id) : null;
    return {
      product_id: product ? product.id : item.product_id,
      product_name: product ? product.name : item.product_name,
      product_price: product ? product.price : item.product_price,
      product_cost: product ? product.cost_price : item.product_cost,
      quantity: item.quantity,
    };
  });
  const subtotal = resolvedItems.reduce((sum, item) => sum + item.product_price * item.quantity, 0);
  const totalCost = resolvedItems.reduce((sum, item) => sum + item.product_cost * item.quantity, 0);
  const discountAmount = Math.min(Number(order?.discount_amount || 0), subtotal);
  const totalPrice = Math.max(0, subtotal - discountAmount);

  const deleteResult = await supabase.from('order_items').delete().eq('order_id', id);
  if (deleteResult.error) {
    console.error('Erro ao limpar itens do pedido:', deleteResult.error);
    return { success: false, error: deleteResult.error.message };
  }

  const rowsToInsert = resolvedItems.map((item) => ({
    order_id: id,
    product_id: item.product_id,
    product_name: item.product_name,
    product_price: item.product_price,
    product_cost: item.product_cost,
    quantity: item.quantity,
  }));
  let insertResult = await supabase.from('order_items').insert(rowsToInsert).select('id, product_id, product_name, product_price, product_cost, quantity');

  if (insertResult.error && isMissingColumnError(insertResult.error)) {
    const legacyRows = rowsToInsert.map((item) => ({
      order_id: item.order_id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_price: item.product_price,
      quantity: item.quantity,
    }));
    insertResult = await supabase.from('order_items').insert(legacyRows).select('id, product_id, product_name, product_price, quantity');
  }

  if (insertResult.error || !insertResult.data) {
    console.error('Erro ao inserir itens do pedido:', insertResult.error);
    return { success: false, error: insertResult.error?.message || 'Nao foi possivel salvar os itens.' };
  }

  const updateResult = await supabase
    .from('orders')
    .update({ total_price: totalPrice, total_cost: totalCost, discount_amount: discountAmount })
    .eq('id', id);

  if (updateResult.error) {
    console.error('Erro ao atualizar totais do pedido:', updateResult.error);
    return { success: false, error: updateResult.error.message };
  }

  if (order?.stock_decremented_at) {
    const previousQuantities = new Map<string, number>();
    const nextQuantities = new Map<string, number>();
    ((order.order_items || []) as { product_id: string | null; quantity: number }[]).forEach((item) => addQuantity(previousQuantities, item.product_id, Number(item.quantity || 0)));
    resolvedItems.forEach((item) => addQuantity(nextQuantities, item.product_id, item.quantity));
    const affectedProducts = new Set([...previousQuantities.keys(), ...nextQuantities.keys()]);

    for (const productId of affectedProducts) {
      const delta = (nextQuantities.get(productId) || 0) - (previousQuantities.get(productId) || 0);
      if (delta === 0) continue;
      const { data: product } = await supabase.from('products').select('stock_quantity').eq('id', productId).single();
      await supabase
        .from('products')
        .update({ stock_quantity: Math.max(0, Number(product?.stock_quantity || 0) - delta) })
        .eq('id', productId);
    }
  }

  const returnedItems = (insertResult.data as {
    id: string;
    product_id: string | null;
    product_name: string;
    product_price: number;
    product_cost?: number;
    quantity: number;
  }[]).map((item, index) => ({
    id: item.id,
    product_id: item.product_id,
    product_name: item.product_name,
    product_price: item.product_price,
    product_cost: item.product_cost ?? resolvedItems[index]?.product_cost ?? 0,
    quantity: item.quantity,
  }));

  await recordAuditLog({
    action: 'order.items_update',
    entityType: 'order',
    entityId: id,
    metadata: { itemCount: returnedItems.length, total_price: totalPrice, total_cost: totalCost },
  });
  revalidatePath('/admin');
  revalidatePath('/admin/pedidos');
  revalidatePath('/admin/produtos');
  return {
    success: true,
    order: {
      total_price: totalPrice,
      total_cost: totalCost,
      discount_amount: discountAmount,
      order_items: returnedItems,
    },
  };
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
