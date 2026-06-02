"use server";

import { randomUUID } from 'crypto';
import { type ActionResult, requireAdminAction } from '@/lib/admin-auth';
import { recordAuditLog } from '@/lib/audit';
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
  stock_quantity?: number;
  availability?: 'available' | 'made_to_order' | 'sold_out' | 'hidden';
  product_status?: 'draft' | 'published' | 'archived';
  variations?: { name: string; price_delta?: number }[];
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

function splitProductData(data: ProductInput | Partial<ProductInput>) {
  const baseData = {
    name: data.name,
    slug: data.slug,
    description: data.description,
    short_description: data.short_description,
    price: data.price,
    cost_price: data.cost_price,
    original_price: data.original_price,
    images: data.images,
    featured: data.featured,
    active: data.active,
    category_id: data.category_id,
  };

  const fullData = {
    ...baseData,
    stock_quantity: data.stock_quantity,
    availability: data.availability,
    product_status: data.product_status,
    variations: data.variations,
  };

  return {
    baseData: Object.fromEntries(Object.entries(baseData).filter(([, value]) => value !== undefined)),
    fullData: Object.fromEntries(Object.entries(fullData).filter(([, value]) => value !== undefined)),
  };
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

async function syncProductImages(productId: string, urls: string[]) {
  const supabase = createAdminClient();
  const { error: deleteError } = await supabase.from('product_images').delete().eq('product_id', productId);

  if (deleteError) {
    if (!deleteError.message.toLowerCase().includes('product_images')) {
      console.error('Erro ao limpar product_images:', deleteError);
    }
    return;
  }

  if (urls.length === 0) return;

  const rows = urls.map((url, index) => ({
    product_id: productId,
    storage_path: getProductImageStoragePath(url) || url,
    public_url: url,
    alt_text: '',
    sort_order: index,
    is_cover: index === 0,
  }));

  const { error } = await supabase.from('product_images').insert(rows);

  if (error && !error.message.toLowerCase().includes('product_images')) {
    console.error('Erro ao salvar product_images:', error);
  }
}

function revalidateProductPaths(slug?: string | null) {
  revalidatePath('/');
  revalidatePath('/catalogo');
  revalidatePath('/admin/produtos');
  revalidatePath('/admin/vitrine');

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
  const { baseData, fullData } = splitProductData(parsedData.data);
  let insertResult = await supabase.from('products').insert([fullData]).select('id, slug').single();

  if (insertResult.error && insertResult.error.message.toLowerCase().includes('column')) {
    insertResult = await supabase.from('products').insert([baseData]).select('id, slug').single();
  }

  if (insertResult.error || !insertResult.data) {
    console.error('Erro ao criar produto:', insertResult.error);
    await deleteProductImageUrls(parsedData.data.images || []);
    return { success: false, error: insertResult.error?.message || 'Erro ao criar produto.' };
  }

  await syncProductImages(insertResult.data.id, parsedData.data.images || []);
  await recordAuditLog({
    action: 'create',
    entityType: 'product',
    entityId: insertResult.data.id,
    metadata: { name: parsedData.data.name, imageCount: parsedData.data.images?.length || 0 },
  });

  revalidateProductPaths(insertResult.data.slug);
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
        await recordAuditLog({ action: 'upload_failed', entityType: 'product_image', metadata: { fileName: file.name, error: error.message } });
        return { success: false, error: error.message, urls: [] as string[] };
      }

      const { data: publicUrlData } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(filePath);
      uploadedUrls.push(publicUrlData.publicUrl);
    }

    await recordAuditLog({ action: 'upload', entityType: 'product_image', metadata: { count: uploadedUrls.length } });
    return { success: true, urls: uploadedUrls };
  } catch (error: unknown) {
    console.error('Erro inesperado na Server Action uploadProductImages:', error);
    await recordAuditLog({ action: 'upload_failed', entityType: 'product_image', metadata: { error: getErrorMessage(error) } });
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
  const { baseData, fullData } = splitProductData(parsedData.data);
  let updateResult = await supabase.from('products').update(fullData).eq('id', id);

  if (updateResult.error && updateResult.error.message.toLowerCase().includes('column')) {
    updateResult = await supabase.from('products').update(baseData).eq('id', id);
  }

  if (updateResult.error) {
    console.error('Erro ao atualizar produto:', updateResult.error);
    return { success: false, error: updateResult.error.message };
  }

  if (parsedData.data.images) {
    await syncProductImages(id, parsedData.data.images);
  }

  await recordAuditLog({ action: 'update', entityType: 'product', entityId: id, metadata: { name: parsedData.data.name } });
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
  const { data: imageRows } = await supabase.from('product_images').select('public_url').eq('product_id', id);
  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    console.error('Erro ao excluir produto:', error);
    return { success: false, error: error.message };
  }

  const professionalUrls = ((imageRows || []) as { public_url: string }[]).map((row) => row.public_url);
  const fallbackUrls = (product?.images as string[] | null) || [];
  await deleteProductImageUrls([...professionalUrls, ...fallbackUrls]);
  await recordAuditLog({ action: 'delete', entityType: 'product', entityId: id, metadata: { slug: product?.slug } });
  revalidateProductPaths(product?.slug);
  return { success: true };
}

export async function deleteUploadedProductImages(urls: string[]): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  await deleteProductImageUrls(urls);
  await recordAuditLog({ action: 'delete_uploads', entityType: 'product_image', metadata: { count: urls.length } });
  return { success: true };
}
