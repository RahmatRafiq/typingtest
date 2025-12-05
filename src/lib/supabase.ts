import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to get or create anonymous user ID
export function getAnonymousUserId(): string {
  if (typeof window === 'undefined') return '';

  let userId = localStorage.getItem('typing_test_user_id');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('typing_test_user_id', userId);
  }
  return userId;
}
