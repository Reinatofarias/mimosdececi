"use server";

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function toggleFeatured(productId: string, currentFeatured: boolean) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('products').update({ featured: !currentFeatured }).eq('id', productId);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/vitrine');
  revalidatePath('/');
  return { success: true };
}
