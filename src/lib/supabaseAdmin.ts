import { createClient } from '@supabase/supabase-js';

// Server-only Supabase client using the service role key
// This must NEVER be imported by client-side code
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
