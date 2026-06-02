"use server";

import { type ActionResult, requireAdminAction } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function toggleFeatured(productId: string, currentFeatured: boolean): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  const supabase = createAdminClient();
  const { data: product } = await supabase.from('products').select('slug').eq('id', productId).single();
  const { error } = await supabase.from('products').update({ featured: !currentFeatured }).eq('id', productId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/vitrine');
  revalidatePath('/');
  if (product?.slug) {
    revalidatePath(`/produto/${product.slug}`);
  }

  return { success: true };
}
