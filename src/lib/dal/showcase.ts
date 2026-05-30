import { createClient } from '../supabase/server';
import type { ShowcaseSection } from '../types/database';

export async function getShowcaseSections(): Promise<ShowcaseSection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('showcase_sections')
    .select('*')
    .eq('visible', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching showcase sections:', error);
    return [];
  }

  return data as ShowcaseSection[];
}
