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
