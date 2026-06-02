import type { MetadataRoute } from 'next';
import { getCategories } from '@/lib/dal/categories';
import { getPublicProductSlugs } from '@/lib/dal/products';
import { absoluteUrl } from '@/lib/site-url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getPublicProductSlugs(),
    getCategories(),
  ]);

  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/catalogo'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/sobre'), lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: absoluteUrl(`/catalogo?categoria=${category.id}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/produto/${product.slug}`),
    lastModified: product.updated_at ? new Date(product.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
