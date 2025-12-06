import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabase is optional - app works without it (data stored in localStorage only)
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseEnabled = (): boolean => supabase !== null;

export function getAnonymousUserId(): string {
  if (typeof window === "undefined") return "";

  let userId = localStorage.getItem("typing_test_user_id");
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("typing_test_user_id", userId);
  }
  return userId;
}
