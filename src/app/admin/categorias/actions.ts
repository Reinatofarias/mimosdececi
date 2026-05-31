"use server";

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

function generateSlug(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
}

export async function fetchCategories() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) return [];
  return data;
}

export async function createCategory(name: string) {
  if (!name.trim()) return { success: false, error: 'Nome não pode ser vazio' };
  
  const supabase = createAdminClient();
  const slug = generateSlug(name);
  
  const { error } = await supabase.from('categories').insert([{ name, slug }]);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/categorias');
  revalidatePath('/catalogo');
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/categorias');
  revalidatePath('/catalogo');
  return { success: true };
}

export async function toggleCategoryStatus(id: string, currentStatus: boolean) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('categories').update({ active: !currentStatus }).eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/categorias');
  revalidatePath('/catalogo');
  return { success: true };
}
