import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Demo Mode: if no real Supabase project is configured, the app falls back
// to in-memory mock data (src/lib/demoData.ts) so the UI is always browsable.
export const isDemoMode = !supabaseUrl || !supabaseAnonKey;

// IMPORTANT: only the anon key is ever used here. The service role key must
// never appear in frontend code — it belongs only to the n8n backend.
export const supabase: SupabaseClient | null = isDemoMode
  ? null
  : createClient(supabaseUrl as string, supabaseAnonKey as string);

export const STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'invoices';
