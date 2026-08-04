import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Search, RefreshCw, AlertCircle } from "lucide-react";
import { listUsers, type AdminUserRow } from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin/admin/")({
  head: () => ({ meta: [{ title: "Users · Admin" }] }),
  component: UsersPage,
});

function UsersPage() {
  const fetchUsers = useServerFn(listUsers);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await fetchUsers({}));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load users");
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.email, u.username, u.full_name, u.college, u.phone, u.id]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [users, query]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            Users
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {loading
              ? "Loading…"
              : `${users.length} registered ${users.length === 1 ? "account" : "accounts"}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="size-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, college…"
              className="w-full sm:w-72 bg-zinc-900/50 border border-border-subtle rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-brand-primary/60 placeholder:text-zinc-600"
            />
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="px-3 py-2 rounded-lg border border-border-subtle text-sm text-zinc-300 hover:bg-zinc-900 transition-colors disabled:opacity-50 shrink-0"
            title="Refresh"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-900/60 bg-red-950/30 flex items-start gap-3">
          <AlertCircle className="size-4 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-300">
              Could not load users
            </p>
            <p className="text-sm text-red-200/70 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 grid place-items-center text-zinc-500">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 text-sm border border-border-subtle rounded-2xl bg-surface">
          {users.length === 0
            ? "No one has signed up yet."
            : `No users match “${query}”.`}
        </div>
      ) : (
        <div className="border border-border-subtle rounded-2xl bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[52rem]">
              <thead>
                <tr className="border-b border-border-subtle text-left">
                  <Th>User</Th>
                  <Th>Username</Th>
                  <Th>Phone</Th>
                  <Th>College</Th>
                  <Th>Joined</Th>
                  <Th>Analyses</Th>
                  <Th className="text-right pr-5">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-border-subtle/60 last:border-0 hover:bg-zinc-900/40 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate max-w-[14rem]">
                          {u.full_name || "—"}
                        </span>
                        {u.is_admin && (
                          <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-brand-primary/20 text-brand-accent shrink-0">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 truncate max-w-[16rem]">
                        {u.email || "—"}
                      </div>
                    </td>
                    <Td>{u.username || "—"}</Td>
                    <Td>{u.phone || "—"}</Td>
                    <Td className="max-w-[12rem] truncate">
                      {u.college || "—"}
                    </Td>
                    <Td>{new Date(u.created_at).toLocaleDateString()}</Td>
                    <Td>{u.analyses_count}</Td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to="/admin/users/$userId"
                        params={{ userId: u.id }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold transition-colors inline-block"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-5 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-5 py-3 text-zinc-300 ${className}`}>{children}</td>;
}
