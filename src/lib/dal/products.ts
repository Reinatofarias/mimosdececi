import { createAdminClient } from '../supabase/admin';
import { createClient } from '../supabase/server';
import { isProductPublic } from '../product-rules';
import type { Product, ProductImage } from '../types/database';

async function attachProductImages(products: Product[], admin = false): Promise<Product[]> {
  if (products.length === 0) return products;

  const supabase = admin ? createAdminClient() : await createClient();
  const productIds = products.map((product) => product.id);
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .in('product_id', productIds)
    .order('sort_order', { ascending: true });

  if (error) {
    if (!error.message.toLowerCase().includes('product_images')) {
      console.error('Error fetching product images:', error);
    }
    return products;
  }

  const imageMap = new Map<string, ProductImage[]>();
  (data as ProductImage[]).forEach((image) => {
    const current = imageMap.get(image.product_id) || [];
    current.push(image);
    imageMap.set(image.product_id, current);
  });

  return products.map((product) => {
    const professionalImages = imageMap.get(product.id) || [];
    const orderedUrls = professionalImages
      .sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)
      .map((image) => image.public_url);

    return {
      ...product,
      images: orderedUrls.length > 0 ? orderedUrls : product.images,
    };
  });
}

export async function getPublicProducts(categoryId?: string): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .eq('product_status', 'published')
    .neq('availability', 'hidden');

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query.order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching public products:', error);
    return [];
  }

  return attachProductImages((data as Product[]).filter(isProductPublic));
}

export async function getAdminProducts(categoryId?: string): Promise<Product[]> {
  const supabase = createAdminClient();
  let query = supabase.from('products').select('*');

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query.order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching admin products:', error);
    return [];
  }

  return attachProductImages(data as Product[], true);
}

export async function getProducts(categoryId?: string): Promise<Product[]> {
  return getPublicProducts(categoryId);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .eq('product_status', 'published')
    .neq('availability', 'hidden')
    .eq('featured', true)
    .order('sort_order', { ascending: true })
    .limit(8);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return attachProductImages((data as Product[]).filter(isProductPublic));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .eq('product_status', 'published')
    .neq('availability', 'hidden')
    .single();

  if (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }

  const publicProduct = data as Product;
  if (!isProductPublic(publicProduct)) return null;
  const [product] = await attachProductImages([publicProduct]);
  return product;
}

export async function getAdminProductById(id: string): Promise<Product | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();

  if (error) {
    console.error('Error fetching admin product by id:', error);
    return null;
  }

  const [product] = await attachProductImages([data as Product], true);
  return product;
}

export async function getProductById(id: string): Promise<Product | null> {
  return getAdminProductById(id);
}

export async function getPublicProductSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('slug, updated_at, active, product_status, availability, stock_quantity')
    .eq('active', true)
    .eq('product_status', 'published')
    .neq('availability', 'hidden');

  if (error) {
    console.error('Error fetching product slugs:', error);
    return [];
  }

  return (data as Product[]).filter(isProductPublic).map((product) => ({ slug: product.slug, updated_at: product.updated_at }));
}
