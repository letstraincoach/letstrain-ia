import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * Cria um cliente Supabase com service role key.
 * Use APENAS em API routes server-side (nunca no browser).
 * Bypassa RLS — só usar para operações privilegiadas (ex: webhook de pagamento).
 */
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
