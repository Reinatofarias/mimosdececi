import { createClient } from '@supabase/supabase-js'

// Cria um client com a service_role key que bypassa as políticas de RLS
// ATENÇÃO: NUNCA USE ESTE CLIENT NO LADO DO CLIENTE (BROWSER)
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
