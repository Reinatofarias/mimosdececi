import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  slug: z.string().min(2),
  description: z.string().optional(),
  short_description: z.string().max(100, "Descrição curta deve ter no máximo 100 caracteres").optional(),
  price: z.number().min(0, "Preço não pode ser negativo"),
  cost_price: z.number().min(0).optional(),
  original_price: z.number().nullable().optional(),
  category_id: z.string().nullable().optional(),
  images: z.array(z.string().min(1)).max(12, "Um produto pode ter no máximo 12 imagens").default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  product_name: z.string(),
  product_price: z.number().min(0),
  quantity: z.number().min(1),
});

export const orderSchema = z.object({
  customer_name: z.string().min(2, "Nome do cliente é obrigatório"),
  customer_phone: z.string().min(8, "Telefone inválido"),
  notes: z.string().optional(),
  total_price: z.number().min(0),
  total_cost: z.number().min(0),
  payment_method: z.string(),
  payment_status: z.string(),
  items: z.array(orderItemSchema).min(1, "O pedido deve ter pelo menos um item"),
});
