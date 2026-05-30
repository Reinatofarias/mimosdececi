import { createClient } from '../supabase/server';
import type { Product } from '../types/database';

export async function getProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data as Product[];
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = createClient();
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
