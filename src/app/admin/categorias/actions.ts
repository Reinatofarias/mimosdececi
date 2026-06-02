"use server";

import { type ActionResult, requireAdminAction } from '@/lib/admin-auth';
import { recordAuditLog } from '@/lib/audit';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function fetchCategories() {
  const authError = await requireAdminAction();
  if (authError) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) return [];
  return data;
}

export async function createCategory(name: string): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  if (!name.trim()) return { success: false, error: 'Nome não pode ser vazio' };

  const supabase = createAdminClient();
  const slug = generateSlug(name);
  const { data, error } = await supabase.from('categories').insert([{ name, slug }]).select('id').single();

  if (error) return { success: false, error: error.message };

  await recordAuditLog({
    action: 'category.create',
    entityType: 'category',
    entityId: data?.id,
    metadata: { name, slug },
  });

  revalidatePath('/admin/categorias');
  revalidatePath('/catalogo');
  return { success: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  const supabase = createAdminClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  await recordAuditLog({
    action: 'category.delete',
    entityType: 'category',
    entityId: id,
  });

  revalidatePath('/admin/categorias');
  revalidatePath('/catalogo');
  return { success: true };
}

export async function toggleCategoryStatus(id: string, currentStatus: boolean): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  const supabase = createAdminClient();
  const { error } = await supabase.from('categories').update({ active: !currentStatus }).eq('id', id);
  if (error) return { success: false, error: error.message };

  await recordAuditLog({
    action: 'category.toggle',
    entityType: 'category',
    entityId: id,
    metadata: { active: !currentStatus },
  });

  revalidatePath('/admin/categorias');
  revalidatePath('/catalogo');
  return { success: true };
}
