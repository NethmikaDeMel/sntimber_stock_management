import { createServerClient as _createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

/**
 * Server-side Supabase client.
 *
 * - Must be called inside a Server Component, Server Action, or Route Handler
 *   (any context where `next/headers` `cookies()` is available).
 * - Uses the ANON key by default so RLS is enforced from the authenticated
 *   user's JWT cookie that Supabase SSR injects automatically.
 * - If you need to bypass RLS for a specific admin action, pass
 *   `useServiceRole: true` — but do this sparingly and only on the server.
 */
export async function createServerClient(opts?: { useServiceRole?: boolean }) {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "[Supabase] Missing environment variables. See .env.example."
    );
  }

  const key =
    opts?.useServiceRole && serviceKey ? serviceKey : anonKey;

  return _createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll is called from Server Components where cookies are read-only.
          // Safe to ignore — the middleware handles session refresh.
        }
      },
    },
  });
}
