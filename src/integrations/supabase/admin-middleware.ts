import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "./auth-middleware";

/** Thrown when a valid, signed-in user is simply not an admin. */
export const NOT_ADMIN = "Forbidden: this account is not an admin";

/**
 * Verifies the caller's JWT (via requireSupabaseAuth), then confirms they are
 * listed in the `admins` table before handing the service-role client to the
 * handler.
 *
 * The membership check runs server-side against a table that `authenticated`
 * has no grants on, so a user cannot read or forge their own admin status.
 */
export const requireAdmin = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    // Imported lazily so the service-role key never lands in a client bundle.
    const { getAdminClient } = await import("./admin-client.server");
    const admin = getAdminClient();

    const { data, error } = await admin
      .from("admins")
      .select("user_id")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Could not verify admin status: ${error.message}`);
    }
    if (!data) {
      throw new Error(NOT_ADMIN);
    }

    return next({ context: { admin, adminUserId: context.userId } });
  });
