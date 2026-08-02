import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Unconfigured Supabase would throw out of the client constructor here;
    // send the user to /auth instead, which explains what's missing.
    if (!isSupabaseConfigured()) {
      throw redirect({ to: "/auth" });
    }
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth" });
    }
    return { user: data.user };
  },
  component: () => <Outlet />,
});
