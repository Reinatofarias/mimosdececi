"use server";

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function saveSettings(data: {
  whatsapp_number: string;
  global_banner: {
    active: boolean;
    text: string;
    backgroundColor: string;
    textColor: string;
  };
}) {
  const supabase = createAdminClient();

  // Update WhatsApp
  const { error: err1 } = await supabase
    .from('settings')
    .upsert({ key: 'whatsapp_number', value: data.whatsapp_number, updated_at: new Date().toISOString() });
    
  if (err1) return { success: false, error: err1.message };

  // Update Global Banner
  const { error: err2 } = await supabase
    .from('settings')
    .upsert({ key: 'global_banner', value: data.global_banner, updated_at: new Date().toISOString() });
    
  if (err2) return { success: false, error: err2.message };

  revalidatePath('/', 'layout');
  revalidatePath('/admin/configuracoes');
  
  return { success: true };
}
