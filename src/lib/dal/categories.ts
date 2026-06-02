import { createAdminClient } from '../supabase/admin';
import { createClient } from '../supabase/server';
import type { Category } from '../types/database';

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data as Category[];
}

export async function getAdminCategories(): Promise<Category[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching admin categories:', error);
    return [];
  }

  return data as Category[];
}
