/**
 * Fetches real, public GitHub activity for a student.
 *
 * Before this existed the model was asked for a "github_score" while never
 * having seen the account — it inferred a number from a URL string on the
 * resume. These are facts the model can actually reason about.
 *
 * Uses the unauthenticated public API (60 requests/hour per IP). Set
 * GITHUB_TOKEN to raise that to 5,000/hour; no scopes are needed since only
 * public data is read.
 */

export type GitHubFacts = {
  username: string;
  public_repos: number;
  followers: number;
  account_age_years: number;
  /** Repos the student created, not forks. */
  original_repos: number;
  total_stars: number;
  most_starred: { name: string; stars: number; language: string | null } | null;
  languages: string[];
  pushed_last_90_days: number;
  has_recent_activity: boolean;
};

export type GitHubLookup =
  | { status: "ok"; facts: GitHubFacts }
  | { status: "none"; reason: string };

/** Pulls the username out of any common GitHub URL or a bare handle. */
export function parseGitHubUsername(
  input: string | null | undefined,
): string | null {
  if (!input) return null;
  const raw = input.trim();
  if (!raw) return null;

  const fromUrl = raw.match(
    /^(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9-]{1,39})\/?/i,
  );
  const handle = fromUrl ? fromUrl[1] : raw.replace(/^@/, "");

  // GitHub usernames: alphanumeric or single hyphens, max 39 chars.
  return /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/.test(handle)
    ? handle
    : null;
}

type RepoRow = {
  name: string;
  fork: boolean;
  stargazers_count: number;
  language: string | null;
  pushed_at: string;
};

async function ghFetch(url: string): Promise<Response> {
  const token = process.env.GITHUB_TOKEN;
  return fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "placify-ai",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function fetchGitHubFacts(
  githubUrl: string | null | undefined,
): Promise<GitHubLookup> {
  const username = parseGitHubUsername(githubUrl);
  if (!username) {
    return { status: "none", reason: "no GitHub profile was provided" };
  }

  try {
    const userRes = await ghFetch(`https://api.github.com/users/${username}`);
    if (userRes.status === 404) {
      return {
        status: "none",
        reason: `github.com/${username} does not exist`,
      };
    }
    if (userRes.status === 403) {
      return {
        status: "none",
        reason: "the GitHub API rate limit was reached",
      };
    }
    if (!userRes.ok) {
      return { status: "none", reason: `GitHub returned ${userRes.status}` };
    }

    const user = (await userRes.json()) as {
      public_repos?: number;
      followers?: number;
      created_at?: string;
    };

    const reposRes = await ghFetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
    );
    const repos: RepoRow[] = reposRes.ok ? await reposRes.json() : [];

    const original = repos.filter((r) => !r.fork);
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const recent = repos.filter(
      (r) => new Date(r.pushed_at).getTime() > ninetyDaysAgo,
    );

    const starred = [...original].sort(
      (a, b) => b.stargazers_count - a.stargazers_count,
    );
    const top = starred[0];

    const createdAt = user.created_at ? new Date(user.created_at) : null;
    const ageYears = createdAt
      ? (Date.now() - createdAt.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      : 0;

    return {
      status: "ok",
      facts: {
        username,
        public_repos: user.public_repos ?? repos.length,
        followers: user.followers ?? 0,
        account_age_years: Math.round(ageYears * 10) / 10,
        original_repos: original.length,
        total_stars: original.reduce((n, r) => n + r.stargazers_count, 0),
        most_starred: top
          ? {
              name: top.name,
              stars: top.stargazers_count,
              language: top.language,
            }
          : null,
        languages: [
          ...new Set(
            original.map((r) => r.language).filter((l): l is string => !!l),
          ),
        ].slice(0, 12),
        pushed_last_90_days: recent.length,
        has_recent_activity: recent.length > 0,
      },
    };
  } catch {
    return { status: "none", reason: "GitHub could not be reached" };
  }
}
