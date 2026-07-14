import { createClient } from '@supabase/supabase-js';

// Project URL and anon key are not secret — Supabase's anon key is designed
// to be embedded in client bundles, protected by RLS rather than secrecy.
// Only the service_role key is sensitive and must stay server-side.
const SUPABASE_URL = 'https://ieavtfjmjimeguhpegki.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllYXZ0ZmptamltZWd1aHBlZ2tpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5MjgzNTAsImV4cCI6MjA5OTUwNDM1MH0.HnU_yB2rw9CXDcTBA4nXZ6yMItz_YeBkEl2ccxV_9Cs';

// Lazily constructed so a missing env var throws inside a request handler's
// try/catch (surfacing a real error message), not at module-import time
// (which would crash the whole function before any of our code runs).
let _supabaseAdmin: ReturnType<typeof createClient> | null = null;

// service_role: bypasses RLS, used only for admin.createUser/deleteUser.
export function getSupabaseAdmin() {
  if (_supabaseAdmin) return _supabaseAdmin;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Set SUPABASE_SERVICE_ROLE_KEY as an environment variable (Supabase -> Settings -> API -> service_role).');
  _supabaseAdmin = createClient(SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _supabaseAdmin;
}

// anon: used to verify a login attempt exactly as a real client would.
export const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
