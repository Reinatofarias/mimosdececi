import { createClient } from '../supabase/server';

export async function getSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('settings').select('*');

  if (error) {
    console.error('Error fetching settings:', error);
    return {};
  }

  const settingsMap: Record<string, any> = {};
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
