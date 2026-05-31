"use server";

import { createClient } from '../supabase/server';
import type { Product } from '../types/database';

export async function searchProducts(query: string): Promise<Product[]> {
  if (!query || query.trim() === '') return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .ilike('name', `%${query}%`)
    .limit(10);

  if (error) {
    console.error('Error searching products:', error);
    return [];
  }

  return data as Product[];
}
