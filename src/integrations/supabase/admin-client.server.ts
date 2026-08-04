// Server-only. The `.server.ts` suffix keeps this out of the client bundle —
// it holds the service role key, which bypasses row-level security.
import { createClient } from "@supabase/supabase-js";
import type { AdminDatabase } from "./admin-schema";

export class AdminConfigError extends Error {}

function createAdminClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ["SUPABASE_URL"] : []),
      ...(!SUPABASE_SERVICE_ROLE_KEY ? ["SUPABASE_SERVICE_ROLE_KEY"] : []),
    ];
    throw new AdminConfigError(
      `The admin panel needs ${missing.join(" and ")}. Add it to .env locally, or to Settings → Environment Variables on Vercel, then restart. Find the key in Supabase under Project Settings → API → service_role.`,
    );
  }

  return createClient<AdminDatabase>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

let cached: ReturnType<typeof createAdminClient> | undefined;

/**
 * Service-role Supabase client. Reads and writes every user's data, so it must
 * only ever be reached through `requireAdmin`.
 */
export function getAdminClient() {
  if (!cached) cached = createAdminClient();
  return cached;
}
