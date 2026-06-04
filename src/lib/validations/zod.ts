import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no minimo 2 caracteres'),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  short_description: z.string().max(100, 'Descricao curta deve ter no maximo 100 caracteres').optional(),
  price: z.number().min(0, 'Preco nao pode ser negativo'),
  cost_price: z.number().min(0).optional(),
  original_price: z.number().nullable().optional(),
  category_id: z.string().nullable().optional(),
  images: z.array(z.string().min(1)).max(12, 'Um produto pode ter no maximo 12 imagens').default([]),
  stock_quantity: z.number().min(0).optional(),
  availability: z.enum(['available', 'made_to_order', 'sold_out', 'hidden']).optional(),
  product_status: z.enum(['draft', 'published', 'archived']).optional(),
  variations: z.array(z.object({
    name: z.string().min(1),
    price_delta: z.number().optional(),
  })).optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  product_name: z.string(),
  product_price: z.number().min(0),
  cost_price: z.number().min(0).optional(),
  quantity: z.number().min(1),
});

export const orderSchema = z.object({
  customer_name: z.string().min(2, 'Nome do cliente e obrigatorio'),
  customer_phone: z.string().min(8, 'Telefone invalido'),
  customer_address: z.string().optional(),
  customer_zip_code: z.string().optional(),
  customer_street: z.string().optional(),
  customer_number: z.string().optional(),
  customer_complement: z.string().optional(),
  customer_neighborhood: z.string().optional(),
  customer_city: z.string().optional(),
  customer_state: z.string().optional(),
  delivery_date: z.string().nullable().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  reminder_notes: z.string().optional(),
  attachments: z.array(z.object({
    label: z.string(),
    url: z.string(),
  })).optional(),
  notes: z.string().optional(),
  total_price: z.number().min(0),
  total_cost: z.number().min(0),
  coupon_code: z.string().nullable().optional(),
  discount_amount: z.number().min(0).optional(),
  payment_method: z.enum(['pix', 'credit_card', 'debit_card', 'cash', 'pre_order']).or(z.string()),
  payment_status: z.string(),
  items: z.array(orderItemSchema).optional().default([]),
});
