import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const checks = [
  {
    name: 'migration creates product_images',
    path: 'supabase/migrations/20260602120000_professional_platform.sql',
    includes: ['CREATE TABLE IF NOT EXISTS product_images', 'CREATE TABLE IF NOT EXISTS audit_logs'],
  },
  {
    name: 'product form supports multiple images',
    path: 'src/app/admin/produtos/ProductForm.tsx',
    includes: ['onDragStart', 'uploadImage', 'product_status', 'stock_quantity'],
  },
  {
    name: 'catalog seo files exist',
    path: 'src/app/sitemap.ts',
    includes: ['MetadataRoute.Sitemap', 'getPublicProductSlugs'],
  },
  {
    name: 'robots blocks admin',
    path: 'src/app/robots.ts',
    includes: ['disallow', '/admin/'],
  },
  {
    name: 'auth verifies pbkdf2 hashes',
    path: 'src/lib/auth.ts',
    includes: ['verifyPassword', 'pbkdf2$', 'maxAge: 8 * 60 * 60'],
  },
  {
    name: 'product publication rules are centralized',
    path: 'src/lib/product-rules.ts',
    includes: ['isProductPublic', 'PRODUCT_STATUS_LABELS', 'PRODUCT_AVAILABILITY_LABELS'],
  },
  {
    name: 'storefront pre-order creates CRM order',
    path: 'src/app/pre-pedido/actions.ts',
    includes: ['createPreOrder', 'createOrderRecord', 'getOrderProtocol', "action: 'order.preorder'"],
  },
  {
    name: 'orders snapshot item costs',
    path: 'supabase/migrations/20260603120000_order_item_cost_snapshots.sql',
    includes: ['ADD COLUMN IF NOT EXISTS product_cost', 'UPDATE orders', 'SUM(COALESCE(product_cost, 0) * quantity)'],
  },
  {
    name: 'professional order operations migration exists',
    path: 'supabase/migrations/20260604120000_professional_order_operations.sql',
    includes: ['order_code', 'customer_zip_code', 'stock_decremented_at', 'idx_orders_payment_status'],
  },
  {
    name: 'cart applies coupons and structured address',
    path: 'src/components/ui/Cart/CartProvider.tsx',
    includes: ['previewPreOrderCoupon', 'couponDiscount', 'customer_zip_code', 'Aplicar'],
  },
  {
    name: 'CRM exposes order detail and whatsapp summary',
    path: 'src/app/admin/pedidos/KanbanBoard.tsx',
    includes: ['selectedOrder', 'buildOrderWhatsappUrl', 'Itens do pedido', 'Historico de status'],
  },
  {
    name: 'CRM edits order operation details',
    path: 'src/app/admin/pedidos/KanbanBoard.tsx',
    includes: ['detailDraft', 'handleSaveDetails', 'Salvar detalhes do pedido'],
  },
  {
    name: 'CRM edits order items and totals',
    path: 'src/app/admin/pedidos/KanbanBoard.tsx',
    includes: ['itemDraft', 'handleSaveItems', 'Editar itens', 'Salvar itens'],
  },
  {
    name: 'order item updates recalculate finance',
    path: 'src/app/admin/pedidos/actions.ts',
    includes: ['updateOrderItems', 'totalCost', 'discountAmount', 'order.items_update'],
  },
  {
    name: 'order payment confirmation migration exists',
    path: 'supabase/migrations/20260604130000_order_payment_confirmation.sql',
    includes: ['amount_paid', 'paid_at', 'payment_notes'],
  },
  {
    name: 'CRM confirms orders and edits payment',
    path: 'src/app/admin/pedidos/KanbanBoard.tsx',
    includes: ['paymentDraft', 'handleSavePayment', 'handleConfirmSelectedOrder', 'Confirmar pedido'],
  },
  {
    name: 'order actions validate confirmation',
    path: 'src/app/admin/pedidos/actions.ts',
    includes: ['confirmOrder', 'updatePaymentInfo', 'pagamento parcial ou pago', 'order.confirm'],
  },
  {
    name: 'delivery operations migration exists',
    path: 'supabase/migrations/20260604140000_delivery_operations.sql',
    includes: ['delivery_fee', 'delivery_window', 'delivery_notes'],
  },
  {
    name: 'CRM filters and edits delivery operations',
    path: 'src/app/admin/pedidos/KanbanBoard.tsx',
    includes: ['deliveryFilter', 'Atrasado', 'Taxa entrega', 'Janela de entrega'],
  },
  {
    name: 'order details persist delivery operations',
    path: 'src/app/admin/pedidos/actions.ts',
    includes: ['delivery_fee', 'delivery_window', 'delivery_notes', 'valor pago igual ao total com entrega'],
  },
  {
    name: 'production operations migration exists',
    path: 'supabase/migrations/20260604150000_production_operations.sql',
    includes: ['production_assignee', 'production_due_date', 'production_checklist', 'production_completed_at'],
  },
  {
    name: 'CRM saves production checklist',
    path: 'src/app/admin/pedidos/KanbanBoard.tsx',
    includes: ['productionDraft', 'handleSaveProduction', 'Salvar producao', 'Producao atrasada'],
  },
  {
    name: 'order actions validate production before ready',
    path: 'src/app/admin/pedidos/actions.ts',
    includes: ['updateProductionInfo', 'Finalize a checklist de producao', 'order.production_update'],
  },
  {
    name: 'product form uses structured variations',
    path: 'src/app/admin/produtos/ProductForm.tsx',
    includes: ['variationEntries', 'Nome da variação', 'Acréscimo R$'],
  },
  {
    name: 'admin can export order CSV',
    path: 'src/app/admin/relatorios/pedidos.csv/route.ts',
    includes: ['isAdminSession', 'text/csv', 'pedidos-mimos-de-ceci.csv'],
  },
  {
    name: 'auth rate limits credential failures',
    path: 'src/lib/auth.ts',
    includes: ['MAX_LOGIN_ATTEMPTS', 'registerLoginFailure', 'isLoginLocked'],
  },
];

for (const check of checks) {
  const filePath = join(root, check.path);
  if (!existsSync(filePath)) {
    throw new Error(`${check.name}: arquivo ausente ${check.path}`);
  }

  const content = readFileSync(filePath, 'utf8');
  for (const expected of check.includes) {
    if (!content.includes(expected)) {
      throw new Error(`${check.name}: nao encontrou "${expected}" em ${check.path}`);
    }
  }
}

console.log(`OK: ${checks.length} checks estruturais passaram.`);
