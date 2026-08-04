import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "@/integrations/supabase/admin-middleware";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AppSettings } from "@/integrations/supabase/admin-schema";

/* ────────────────────────────────────────────────────────────────────────
 * Shapes returned to the admin UI
 * ──────────────────────────────────────────────────────────────────────── */

export type AdminUserRow = {
  id: string;
  email: string;
  phone: string;
  username: string;
  full_name: string;
  college: string;
  created_at: string;
  last_sign_in_at: string | null;
  provider: string;
  email_confirmed: boolean;
  is_admin: boolean;
  analyses_count: number;
};

export type AdminUserDetail = AdminUserRow & {
  profile: Record<string, string | null> | null;
  resumes: {
    id: string;
    file_name: string;
    file_size: number;
    created_at: string;
  }[];
  analyses: {
    id: string;
    readiness_score: number;
    resume_score: number;
    ats_score: number;
    technical_score: number;
    communication_score: number;
    github_score: number;
    linkedin_score: number;
    summary: string | null;
    created_at: string;
  }[];
};

/* ────────────────────────────────────────────────────────────────────────
 * Validation
 * ──────────────────────────────────────────────────────────────────────── */

const uuid = z.string().uuid("Not a valid user id");

/** Optional free-text field: trimmed, length-capped, empty string allowed. */
const text = (max: number) => z.string().trim().max(max).optional();

const updateUserSchema = z.object({
  userId: uuid,
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  phone: text(32),
  username: z
    .string()
    .trim()
    .max(40)
    .regex(
      /^[a-zA-Z0-9._-]*$/,
      "Username can only contain letters, numbers, dots, dashes and underscores",
    )
    .optional(),
  full_name: text(120),
  college: text(160),
  degree: text(120),
  branch: text(120),
  gpa: text(20),
  graduation_year: text(10),
  linkedin_url: text(300),
  github_url: text(300),
  portfolio_url: text(300),
  leetcode_url: text(300),
  hackerrank_url: text(300),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

const settingsSchema = z.object({
  site_name: z.string().trim().min(1, "Site name cannot be empty").max(80),
  support_email: z
    .string()
    .trim()
    .max(160)
    .refine((v) => v === "" || z.string().email().safeParse(v).success, {
      message: "Enter a valid email address, or leave it blank",
    }),
  allow_signups: z.boolean(),
  maintenance_mode: z.boolean(),
  ai_enabled: z.boolean(),
  ai_model: z.string().trim().min(1, "Model cannot be empty").max(80),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

/** Turns a ZodError into one readable line for the toast. */
function formatIssues(err: z.ZodError): string {
  return err.issues.map((i) => i.message).join("; ");
}

/* ────────────────────────────────────────────────────────────────────────
 * Is the current user an admin? Used by the route guard.
 * ──────────────────────────────────────────────────────────────────────── */

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<boolean> => {
    try {
      const { getAdminClient } =
        await import("@/integrations/supabase/admin-client.server");
      const { data } = await getAdminClient()
        .from("admins")
        .select("user_id")
        .eq("user_id", context.userId)
        .maybeSingle();
      return Boolean(data);
    } catch {
      // Missing service-role key, network failure — treat as "not an admin"
      // so the guard redirects rather than throwing a 500 at the user.
      return false;
    }
  });

/* ────────────────────────────────────────────────────────────────────────
 * Users
 * ──────────────────────────────────────────────────────────────────────── */

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }): Promise<AdminUserRow[]> => {
    const { admin } = context;

    // auth.users is not exposed over PostgREST, so identity comes from the
    // admin auth API and the app data from `profiles`.
    const { data: authData, error: authError } =
      await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (authError)
      throw new Error(`Could not list users: ${authError.message}`);

    const [{ data: profiles }, { data: admins }, { data: analyses }] =
      await Promise.all([
        admin.from("profiles").select("*"),
        admin.from("admins").select("user_id"),
        admin.from("analyses").select("user_id"),
      ]);

    const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
    const adminIds = new Set((admins ?? []).map((a) => a.user_id));
    const analysisCounts = new Map<string, number>();
    for (const row of analyses ?? []) {
      analysisCounts.set(
        row.user_id,
        (analysisCounts.get(row.user_id) ?? 0) + 1,
      );
    }

    return authData.users.map((u) => {
      const p = profileById.get(u.id);
      return {
        id: u.id,
        email: u.email ?? "",
        phone: p?.phone ?? u.phone ?? "",
        username: p?.username ?? "",
        full_name: p?.full_name ?? "",
        college: p?.college ?? "",
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        provider: u.app_metadata?.provider ?? "email",
        email_confirmed: Boolean(u.email_confirmed_at),
        is_admin: adminIds.has(u.id),
        analyses_count: analysisCounts.get(u.id) ?? 0,
      };
    });
  });

export const getUserDetail = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .validator((data: { userId: string }) => {
    const parsed = z.object({ userId: uuid }).safeParse(data);
    if (!parsed.success) throw new Error(formatIssues(parsed.error));
    return parsed.data;
  })
  .handler(async ({ context, data }): Promise<AdminUserDetail> => {
    const { admin } = context;

    const { data: authUser, error: authError } =
      await admin.auth.admin.getUserById(data.userId);
    if (authError || !authUser?.user) {
      throw new Error("That user no longer exists");
    }
    const u = authUser.user;

    const [
      { data: profile },
      { data: resumes },
      { data: analyses },
      { data: adminRow },
    ] = await Promise.all([
      admin.from("profiles").select("*").eq("id", data.userId).maybeSingle(),
      admin
        .from("resumes")
        .select("id, file_name, file_size, created_at")
        .eq("user_id", data.userId)
        .order("created_at", { ascending: false }),
      admin
        .from("analyses")
        .select(
          "id, readiness_score, resume_score, ats_score, technical_score, communication_score, github_score, linkedin_score, summary, created_at",
        )
        .eq("user_id", data.userId)
        .order("created_at", { ascending: false }),
      admin
        .from("admins")
        .select("user_id")
        .eq("user_id", data.userId)
        .maybeSingle(),
    ]);

    return {
      id: u.id,
      email: u.email ?? "",
      phone: profile?.phone ?? u.phone ?? "",
      username: profile?.username ?? "",
      full_name: profile?.full_name ?? "",
      college: profile?.college ?? "",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      provider: u.app_metadata?.provider ?? "email",
      email_confirmed: Boolean(u.email_confirmed_at),
      is_admin: Boolean(adminRow),
      analyses_count: analyses?.length ?? 0,
      profile: profile ?? null,
      resumes: resumes ?? [],
      analyses: analyses ?? [],
    };
  });

export const updateUser = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((data: UpdateUserInput) => {
    const parsed = updateUserSchema.safeParse(data);
    if (!parsed.success) throw new Error(formatIssues(parsed.error));
    return parsed.data;
  })
  .handler(async ({ context, data }) => {
    const { admin } = context;
    const { userId, email, ...profileFields } = data;

    // Email lives on auth.users, not profiles, so it updates separately.
    if (email) {
      const { error } = await admin.auth.admin.updateUserById(userId, {
        email,
        email_confirm: true,
      });
      if (error) {
        throw new Error(
          error.message.includes("already been registered")
            ? "That email is already used by another account"
            : `Could not update email: ${error.message}`,
        );
      }
    }

    const { error } = await admin.from("profiles").upsert(
      {
        id: userId,
        ...profileFields,
        ...(email ? { email } : {}),
      },
      { onConflict: "id" },
    );

    if (error) {
      throw new Error(
        error.code === "23505"
          ? "That username is already taken"
          : `Could not save profile: ${error.message}`,
      );
    }

    return { ok: true as const };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((data: { userId: string }) => {
    const parsed = z.object({ userId: uuid }).safeParse(data);
    if (!parsed.success) throw new Error(formatIssues(parsed.error));
    return parsed.data;
  })
  .handler(async ({ context, data }) => {
    // Guard against an admin locking everyone out by deleting themselves.
    if (data.userId === context.adminUserId) {
      throw new Error("You cannot delete the account you are signed in with");
    }

    // profiles / analyses / resumes all cascade from auth.users.
    const { error } = await context.admin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(`Could not delete user: ${error.message}`);

    return { ok: true as const };
  });

/* ────────────────────────────────────────────────────────────────────────
 * Settings
 * ──────────────────────────────────────────────────────────────────────── */

export const getSettings = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }): Promise<AppSettings> => {
    const { data, error } = await context.admin
      .from("app_settings")
      .select("*")
      .eq("id", true)
      .maybeSingle();

    if (error) throw new Error(`Could not load settings: ${error.message}`);
    if (!data) {
      throw new Error(
        "The app_settings row is missing. Re-run supabase/admin-setup.sql.",
      );
    }
    return data;
  });

export const updateSettings = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((data: SettingsInput) => {
    const parsed = settingsSchema.safeParse(data);
    if (!parsed.success) throw new Error(formatIssues(parsed.error));
    return parsed.data;
  })
  .handler(async ({ context, data }): Promise<AppSettings> => {
    const { data: saved, error } = await context.admin
      .from("app_settings")
      .update(data)
      .eq("id", true)
      .select()
      .single();

    if (error) throw new Error(`Could not save settings: ${error.message}`);
    return saved;
  });
