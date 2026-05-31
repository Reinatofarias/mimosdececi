"use server";

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function createProduct(data: {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  cost_price?: number;
  original_price: number | null;
  images: string[];
  featured: boolean;
  active: boolean;
}) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('products')
    .insert([data]);

  if (error) {
    console.error('Erro ao criar produto:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/admin/produtos');
  return { success: true };
}

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) return { success: false, error: 'No file provided' };

    const supabase = createAdminClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // Convert standard File object to a Buffer to ensure it works correctly in Node.js server environment
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        duplex: 'half'
      });

    if (error) {
      console.error('Erro ao fazer upload no Supabase:', error);
      return { success: false, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return { success: true, url: publicUrlData.publicUrl };
  } catch (error: any) {
    console.error('Erro inesperado na Server Action uploadImage:', error);
    return { success: false, error: error.message || 'Erro inesperado no servidor' };
  }
}

export async function updateProduct(id: string, data: Partial<{
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  cost_price?: number;
  original_price: number | null;
  images: string[];
  featured: boolean;
  active: boolean;
}>) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('products')
    .update(data)
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar produto:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/admin/produtos');
  revalidatePath('/catalogo');
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir produto:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/admin/produtos');
  revalidatePath('/catalogo');
  return { success: true };
}
