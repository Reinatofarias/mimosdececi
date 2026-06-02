"use server";

import { randomUUID } from 'crypto';
import { type ActionResult, requireAdminAction } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { productSchema } from '@/lib/validations/zod';
import { revalidatePath } from 'next/cache';

const PRODUCT_IMAGE_BUCKET = 'product-images';
const MAX_PRODUCT_IMAGES = 12;
const MAX_PRODUCT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PRODUCT_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

type ProductInput = {
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
  category_id?: string | null;
};

type UploadProductImagesResult = ActionResult & {
  urls: string[];
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Erro inesperado no servidor';
}

function validateImageFile(file: File) {
  if (!ALLOWED_PRODUCT_IMAGE_TYPES.has(file.type)) {
    return 'Formato inválido. Use JPG, PNG, WebP ou GIF.';
  }

  if (file.size > MAX_PRODUCT_IMAGE_SIZE_BYTES) {
    return 'Imagem muito grande. O limite por arquivo é 5 MB.';
  }

  return null;
}

function getFileExtension(file: File) {
  const extensionFromName = file.name.split('.').pop()?.toLowerCase();
  if (extensionFromName && /^[a-z0-9]+$/.test(extensionFromName)) {
    return extensionFromName;
  }

  return file.type.split('/').pop() || 'jpg';
}

function getProductImageStoragePath(publicUrl: string) {
  try {
    const url = new URL(publicUrl);
    const marker = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

async function deleteProductImageUrls(urls: string[]) {
  const paths = urls
    .map(getProductImageStoragePath)
    .filter((path): path is string => Boolean(path));

  if (paths.length === 0) {
    return;
  }

  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove(paths);

  if (error) {
    console.error('Erro ao limpar imagens do produto:', error);
  }
}

function revalidateProductPaths(slug?: string | null) {
  revalidatePath('/');
  revalidatePath('/catalogo');
  revalidatePath('/admin/produtos');

  if (slug) {
    revalidatePath(`/produto/${slug}`);
  }
}

export async function createProduct(data: ProductInput): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  const parsedData = productSchema.safeParse(data);
  if (!parsedData.success) {
    console.error('Validation error:', parsedData.error);
    await deleteProductImageUrls(data.images || []);
    return { success: false, error: 'Dados inválidos. Verifique os campos do formulário.' };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('products').insert([parsedData.data]);

  if (error) {
    console.error('Erro ao criar produto:', error);
    await deleteProductImageUrls(parsedData.data.images || []);
    return { success: false, error: error.message };
  }

  revalidateProductPaths(parsedData.data.slug);
  return { success: true };
}

export async function uploadProductImages(formData: FormData): Promise<UploadProductImagesResult> {
  const authError = await requireAdminAction();
  if (authError) return { ...authError, urls: [] as string[] };

  try {
    const files = formData
      .getAll('files')
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    const singleFile = formData.get('file');
    if (files.length === 0 && singleFile instanceof File && singleFile.size > 0) {
      files.push(singleFile);
    }

    if (files.length === 0) {
      return { success: false, error: 'Nenhum arquivo enviado.', urls: [] as string[] };
    }

    if (files.length > MAX_PRODUCT_IMAGES) {
      return { success: false, error: `Envie no máximo ${MAX_PRODUCT_IMAGES} imagens por vez.`, urls: [] as string[] };
    }

    for (const file of files) {
      const validationError = validateImageFile(file);
      if (validationError) {
        return { success: false, error: `${file.name}: ${validationError}`, urls: [] as string[] };
      }
    }

    const supabase = createAdminClient();
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileExt = getFileExtension(file);
      const filePath = `products/${new Date().getFullYear()}/${randomUUID()}.${fileExt}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      });

      if (error) {
        await deleteProductImageUrls(uploadedUrls);
        console.error('Erro ao fazer upload no Supabase:', error);
        return { success: false, error: error.message, urls: [] as string[] };
      }

      const { data: publicUrlData } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(filePath);
      uploadedUrls.push(publicUrlData.publicUrl);
    }

    return { success: true, urls: uploadedUrls };
  } catch (error: unknown) {
    console.error('Erro inesperado na Server Action uploadProductImages:', error);
    return { success: false, error: getErrorMessage(error), urls: [] as string[] };
  }
}

export async function uploadImage(formData: FormData): Promise<ActionResult & { url?: string }> {
  const result = await uploadProductImages(formData);
  return { success: result.success, error: result.error, url: result.urls[0] };
}

export async function updateProduct(id: string, data: Partial<ProductInput>): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  const parsedData = productSchema.partial().safeParse(data);
  if (!parsedData.success) {
    console.error('Validation error:', parsedData.error);
    return { success: false, error: 'Dados inválidos. Verifique os campos do formulário.' };
  }

  const supabase = createAdminClient();
  const { data: existingProduct } = await supabase.from('products').select('slug').eq('id', id).single();
  const { error } = await supabase.from('products').update(parsedData.data).eq('id', id);

  if (error) {
    console.error('Erro ao atualizar produto:', error);
    return { success: false, error: error.message };
  }

  revalidateProductPaths(existingProduct?.slug);
  if (parsedData.data.slug && parsedData.data.slug !== existingProduct?.slug) {
    revalidatePath(`/produto/${parsedData.data.slug}`);
  }

  return { success: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  const supabase = createAdminClient();
  const { data: product } = await supabase.from('products').select('images, slug').eq('id', id).single();
  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    console.error('Erro ao excluir produto:', error);
    return { success: false, error: error.message };
  }

  revalidateProductPaths(product?.slug);
  await deleteProductImageUrls((product?.images as string[] | null) || []);
  return { success: true };
}

export async function deleteUploadedProductImages(urls: string[]): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  await deleteProductImageUrls(urls);
  return { success: true };
}
