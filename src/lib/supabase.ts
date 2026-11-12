import { createClient } from '@supabase/supabase-js';

// These are public browser credentials. Row Level Security protects user data;
// never place a service-role key in the frontend.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mvhrfvucvkfqidxqbxpk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_dA6KhrwNi5Ko7i10O6nGUg_uF8I0FKn';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
