import { getAdminCategories } from '@/lib/dal/categories';
import { getAdminProducts } from '@/lib/dal/products';
import { CouponForm } from './CouponForm';

export const revalidate = 0;

export default async function NovoCupomPage() {
  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ]);

  return (
    <div style={{ maxWidth: '920px' }}>
      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2xl)' }}>Novo Cupom</h1>
      <CouponForm
        products={products.map((product) => ({ id: product.id, name: product.name, price: product.price, category_id: product.category_id }))}
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
      />
    </div>
  );
}
