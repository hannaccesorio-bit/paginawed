import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    return createSupabaseClient('https://placeholder.supabase.co', 'placeholder-key');
  }

  return createSupabaseClient(url, key);
}