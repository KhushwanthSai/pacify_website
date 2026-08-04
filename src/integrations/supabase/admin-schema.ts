import type { Database } from "./types";

/**
 * `types.ts` is generated from the base schema and does not know about the
 * two tables the admin panel adds (see supabase/admin-setup.sql). Rather than
 * casting queries to `any`, we widen the generated Database type here so the
 * admin client stays fully typed.
 */

export type AdminRow = {
  user_id: string;
  created_at: string;
};

export type AppSettings = {
  id: boolean;
  site_name: string;
  support_email: string;
  allow_signups: boolean;
  maintenance_mode: boolean;
  ai_enabled: boolean;
  ai_model: string;
  updated_at: string;
};

/** The fields an admin is allowed to change. `id` and `updated_at` are not. */
export type AppSettingsUpdate = Partial<Omit<AppSettings, "id" | "updated_at">>;

type PublicSchema = Database["public"];
type ProfilesTable = PublicSchema["Tables"]["profiles"];

/**
 * admin-setup.sql adds `profiles.username`, which predates the generated
 * types, so it is layered on here too.
 */
type ProfilesWithUsername = Omit<ProfilesTable, "Row" | "Insert" | "Update"> & {
  Row: ProfilesTable["Row"] & { username: string | null };
  Insert: ProfilesTable["Insert"] & { username?: string | null };
  Update: ProfilesTable["Update"] & { username?: string | null };
};

export type AdminDatabase = Omit<Database, "public"> & {
  public: Omit<PublicSchema, "Tables"> & {
    Tables: Omit<PublicSchema["Tables"], "profiles"> & {
      profiles: ProfilesWithUsername;
      admins: {
        Row: AdminRow;
        Insert: { user_id: string; created_at?: string };
        Update: { user_id?: string; created_at?: string };
        Relationships: [];
      };
      app_settings: {
        Row: AppSettings;
        Insert: Partial<AppSettings>;
        Update: Partial<AppSettings>;
        Relationships: [];
      };
    };
  };
};

export const DEFAULT_SETTINGS: Omit<AppSettings, "id" | "updated_at"> = {
  site_name: "Placify AI",
  support_email: "",
  allow_signups: true,
  maintenance_mode: false,
  ai_enabled: true,
  ai_model: "gemini-flash-latest",
};
