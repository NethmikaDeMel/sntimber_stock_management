import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

/**
 * Browser-side Supabase singleton.
 *
 * - Uses the public ANON key — respects RLS on all tables.
 * - Call this inside "use client" components only.
 * - Module-level variable ensures only one GoTrue auth listener
 *   is created per page lifetime (singleton pattern).
 */
let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function getBrowserClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Copy .env.example → .env.local and fill in your project values."
    );
  }

  client = createBrowserClient<Database>(url, key);
  return client;
}
