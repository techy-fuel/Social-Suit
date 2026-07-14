import { createClient } from '@supabase/supabase-js';

// Public by design — the anon key is meant to be embedded in client bundles
// and is protected by RLS, not secrecy. Only used here for the password
// recovery handoff (Supabase emails a link that lands on /reset-password
// with a recovery session this client can pick up).
const SUPABASE_URL = 'https://ieavtfjmjimeguhpegki.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllYXZ0ZmptamltZWd1aHBlZ2tpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5MjgzNTAsImV4cCI6MjA5OTUwNDM1MH0.HnU_yB2rw9CXDcTBA4nXZ6yMItz_YeBkEl2ccxV_9Cs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
