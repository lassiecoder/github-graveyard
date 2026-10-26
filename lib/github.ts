import { cacheLife } from "next/cache";
import { diagnose, graveyardTitle, type Diagnosis } from "./epitaphs";

const API = "https://api.github.com";
const DEAD_AFTER_DAYS = 180;
const MAX_PAGES = 3;
const DAY = 86_400_000;

export type Grave = Diagnosis & {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  born: string;
  died: string;
  lifespanDays: number;
  archived: boolean;
};

export type Graveyard = {
  login: string;
  name: string | null;
  avatar: string;
  profileUrl: string;
  graves: Grave[];
  alive: number;
  totalMourners: number;
  avgLifespanDays: number;
  title: { rank: string; blurb: string };
  oldestGrave: Grave | null;
};

export type GraveyardResult =
  | { ok: true; data: Graveyard }
  | { ok: false; reason: "not-found" | "rate-limited" | "error" };

type ApiRepo = {
  name: string;
  description: string | null;
  html_url: string;
  fork: boolean;
  archived: boolean;
  created_at: string;
  pushed_at: string;
  stargazers_count: number;
  language: string | null;
  size: number;
  open_issues_count: number;
  topics?: string[];
};

// Comma-separated GITHUB_TOKENS lets a launch-day spike spread across several
// tokens' 5k/hr budgets. Unauthenticated works too, but only 60 req/hr per IP.
function pickToken(): string | undefined {
  const tokens = (process.env.GITHUB_TOKENS ?? process.env.GITHUB_TOKEN ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (!tokens.length) return undefined;
  return tokens[Math.floor(Math.random() * tokens.length)];
}

async function gh(path: string) {
  const token = pickToken();
  return fetch(`${API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "github-graveyard",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

const RATE_LIMITED = "GITHUB_RATE_LIMITED";

function isRateLimited(res: Response) {
  return (
    (res.status === 403 || res.status === 429) &&
    (res.headers.get("x-ratelimit-remaining") === "0" ||
      res.status === 429 ||
      res.headers.has("retry-after"))
  );
}

export const USERNAME_RE = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

// Errors are thrown (not returned) so transient failures never get cached.
// The marker is a message, not a subclass, since it may cross a cache boundary.
async function fetchGraveyard(login: string): Promise<Graveyard | null> {
  "use cache";
  cacheLife("hours");

  const userRes = await gh(`/users/${encodeURIComponent(login)}`);
  if (userRes.status === 404) return null;
  if (isRateLimited(userRes)) throw new Error(RATE_LIMITED);
  if (!userRes.ok) throw new Error(`GitHub ${userRes.status}`);
  const user = await userRes.json();

  // Least-recently-pushed first: for prolific users the dead are what we want,
  // and the page cap then cuts off the living rather than the graves.
  const repos: ApiRepo[] = [];
  let complete = false;
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await gh(
      `/users/${encodeURIComponent(user.login)}/repos?per_page=100&page=${page}&type=owner&sort=pushed&direction=asc`,
    );
    if (isRateLimited(res)) throw new Error(RATE_LIMITED);
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    const batch: (Omit<ApiRepo, "pushed_at"> & { pushed_at: string | null })[] = await res.json();
    // Never-pushed (empty) repos report pushed_at: null; treat creation as last push.
    repos.push(...batch.map((r) => ({ ...r, pushed_at: r.pushed_at ?? r.created_at })));
    if (batch.length < 100) {
      complete = true;
      break;
    }
  }

  const now = Date.now();
  const own = repos.filter(
    (r) => !r.fork && r.name.toLowerCase() !== user.login.toLowerCase(),
  );
  const dead = own.filter(
    (r) => r.archived || now - Date.parse(r.pushed_at) > DEAD_AFTER_DAYS * DAY,
  );

  // Sort before diagnosing so the most-starred graves, which headline the share
  // card, get first pick of the causes.
  dead.sort(
    (a, b) => b.stargazers_count - a.stargazers_count || Date.parse(b.pushed_at) - Date.parse(a.pushed_at),
  );
  const used = new Set<string>();
  const graves: Grave[] = dead.map((r) => {
    const lifespanDays = Math.max(
      0,
      Math.round((Date.parse(r.pushed_at) - Date.parse(r.created_at)) / DAY),
    );
    return {
      name: r.name,
      description: r.description,
      url: r.html_url,
      language: r.language,
      stars: r.stargazers_count,
      born: r.created_at,
      died: r.pushed_at,
      lifespanDays,
      archived: r.archived,
      ...diagnose(
        {
          name: r.name,
          description: r.description,
          language: r.language,
          stars: r.stargazers_count,
          size: r.size,
          openIssues: r.open_issues_count,
          archived: r.archived,
          topics: r.topics ?? [],
          lifespanDays,
          bornMonth: new Date(r.created_at).getUTCMonth(),
        },
        used,
      ),
    };
  });

  const totalMourners = graves.reduce((s, g) => s + g.stars, 0);
  const avgLifespanDays = graves.length
    ? Math.round(graves.reduce((s, g) => s + g.lifespanDays, 0) / graves.length)
    : 0;
  const oldestGrave =
    graves.reduce<Grave | null>(
      (o, g) => (!o || Date.parse(g.died) < Date.parse(o.died) ? g : o),
      null,
    ) ?? null;

  return {
    login: user.login,
    name: user.name,
    avatar: user.avatar_url,
    profileUrl: user.html_url,
    graves,
    // public_repos counts forks too, so beyond the page cap this is an estimate.
    alive: complete
      ? own.length - dead.length
      : Math.max(0, user.public_repos - (repos.length - own.length) - dead.length),
    totalMourners,
    avgLifespanDays,
    title: graveyardTitle(graves.length, own.length, avgLifespanDays),
    oldestGrave,
  };
}

export async function getGraveyard(login: string): Promise<GraveyardResult> {
  if (!USERNAME_RE.test(login)) return { ok: false, reason: "not-found" };
  try {
    const data = await fetchGraveyard(login.toLowerCase());
    return data ? { ok: true, data } : { ok: false, reason: "not-found" };
  } catch (e) {
    return { ok: false, reason: String(e).includes(RATE_LIMITED) ? "rate-limited" : "error" };
  }
}

// Live star count for the "keep this repo alive" card. Null if the repo is
// missing or GitHub is unreachable; the card then just hides the count.
export async function getRepoStars(repo: string): Promise<number | null> {
  "use cache";
  cacheLife("hours");
  try {
    const res = await gh(`/repos/${repo}`);
    if (!res.ok) return null;
    const data: { stargazers_count: number } = await res.json();
    return data.stargazers_count;
  } catch {
    return null;
  }
}
