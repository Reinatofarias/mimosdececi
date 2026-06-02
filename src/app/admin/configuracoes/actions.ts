"use server";

import { type ActionResult, requireAdminAction } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export type GlobalBannerSettings = {
  active: boolean;
  text: string;
  backgroundColor: string;
  textColor: string;
};

export type StoreSettingsFormData = {
  whatsapp_number: string;
  global_banner: GlobalBannerSettings;
};

export async function saveSettings(data: StoreSettingsFormData): Promise<ActionResult> {
  const authError = await requireAdminAction();
  if (authError) return authError;

  const supabase = createAdminClient();
  const updatedAt = new Date().toISOString();

  const { error: whatsappError } = await supabase
    .from('settings')
    .upsert({ key: 'whatsapp_number', value: data.whatsapp_number, updated_at: updatedAt });

  if (whatsappError) return { success: false, error: whatsappError.message };

  const { error: bannerError } = await supabase
    .from('settings')
    .upsert({ key: 'global_banner', value: data.global_banner, updated_at: updatedAt });

  if (bannerError) return { success: false, error: bannerError.message };

  revalidatePath('/', 'layout');
  revalidatePath('/admin/configuracoes');

  return { success: true };
}
