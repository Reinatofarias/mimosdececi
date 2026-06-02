import { createClient } from '../supabase/server';

export type GlobalBannerSetting = {
  text?: string;
  active?: boolean;
  backgroundColor?: string;
  textColor?: string;
};

export type SettingsMap = {
  whatsapp_number?: string;
  store_name?: string;
  store_tagline?: string;
  global_banner?: GlobalBannerSetting;
  [key: string]: unknown;
};

export async function getSettings(): Promise<SettingsMap> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('settings').select('*');

  if (error) {
    console.error('Error fetching settings:', error);
    return {};
  }

  const settingsMap: SettingsMap = {};
  data.forEach((item) => {
    settingsMap[item.key] = item.value;
  });

  return settingsMap;
}

export async function getSettingByKey(key: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('settings').select('value').eq('key', key).single();
  if (error) return null;
  return data.value;
}
