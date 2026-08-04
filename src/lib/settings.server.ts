import process from "node:process";
import {
  DEFAULT_SETTINGS,
  type AppSettings,
} from "@/integrations/supabase/admin-schema";
import type { PublicSettings } from "./settings";

/**
 * Server-side read of the single app_settings row.
 *
 * Uses the anon key over PostgREST rather than the generated Supabase client:
 * the table is world-readable by policy, so no elevated privileges are needed,
 * and this keeps the admin-only tables out of the app's normal type surface.
 *
 * Never throws — settings failing to load must not break analysis.
 */
export async function getServerSettings(): Promise<PublicSettings> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return DEFAULT_SETTINGS;

  try {
    const res = await fetch(
      `${url}/rest/v1/app_settings?select=*&id=eq.true&limit=1`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      },
    );
    if (!res.ok) return DEFAULT_SETTINGS;

    const rows = (await res.json()) as AppSettings[];
    const row = rows?.[0];
    if (!row) return DEFAULT_SETTINGS;

    return {
      site_name: row.site_name ?? DEFAULT_SETTINGS.site_name,
      support_email: row.support_email ?? DEFAULT_SETTINGS.support_email,
      allow_signups: row.allow_signups ?? DEFAULT_SETTINGS.allow_signups,
      maintenance_mode:
        row.maintenance_mode ?? DEFAULT_SETTINGS.maintenance_mode,
      ai_enabled: row.ai_enabled ?? DEFAULT_SETTINGS.ai_enabled,
      ai_model: row.ai_model ?? DEFAULT_SETTINGS.ai_model,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
