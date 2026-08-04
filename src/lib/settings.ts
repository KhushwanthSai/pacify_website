import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import {
  DEFAULT_SETTINGS,
  type AppSettings,
} from "@/integrations/supabase/admin-schema";

export type PublicSettings = Omit<AppSettings, "id" | "updated_at">;

/**
 * Reads the single app_settings row with the ordinary anon key — the table has
 * a SELECT policy for everyone, so no admin privileges are involved.
 *
 * Falls back to defaults rather than throwing: a settings outage should never
 * take the public site down.
 */
export async function fetchPublicSettings(): Promise<PublicSettings> {
  if (!isSupabaseConfigured()) return DEFAULT_SETTINGS;

  try {
    const { data, error } = await supabase
      .from("app_settings" as never)
      .select("*")
      .eq("id" as never, true as never)
      .maybeSingle();

    if (error || !data) return DEFAULT_SETTINGS;

    const row = data as unknown as AppSettings;
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
