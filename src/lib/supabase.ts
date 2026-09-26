import { createClient } from '@supabase/supabase-js';

// The single shared Supabase client. Every service imports this instance —
// never create a second client. Uses the anon key only (RLS protects data);
// the service_role key must never appear in front-end code.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — copy .env.example to .env and fill them in.'
  );
}

export const supabase = createClient(url, anonKey);
