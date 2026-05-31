import { createClient } from '../supabase/server';
import type { Product } from '../types/database';

export async function getProducts(categoryId?: string): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase
    .from('products')
    .select('*')
    .eq('active', true);
    
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  const { data, error } = await query.order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data as Product[];
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .eq('featured', true)
    .order('sort_order', { ascending: true })
    .limit(8);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return data as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }

  return data as Product;
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product by id:', error);
    return null;
  }

  return data as Product;
}
