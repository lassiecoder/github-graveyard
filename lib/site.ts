export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  // Vercel exposes this to the client bundle too, so share links hydrate identically.
  (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");

export const SITE_NAME = "GitHub Graveyard";

// This project's own repo ("owner/name"), for the star card.
export const SOURCE_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO ?? "lassiecoder/github-graveyard";

// Bump when the share-card design changes: browsers and X cache card images
// by URL (X for days), so a new version string makes them fetch the new look.
export const OG_VERSION = "6";

// Share-card URLs, lowercased so a card warmed from what someone typed is the
// exact URL (and CDN cache entry) the page uses afterwards.
export function ogCardUrl(login: string, format: "landscape" | "portrait" = "landscape") {
  return `/api/og/${login.toLowerCase()}?${format === "portrait" ? "format=portrait&" : ""}v=${OG_VERSION}`;
}

export function ogGraveUrl(login: string, repo: string) {
  return `/api/og/${login.toLowerCase()}/${encodeURIComponent(repo)}?v=${OG_VERSION}`;
}

// Ask for a page's share cards right after it renders, so they're already in
// the CDN cache when someone shares the link. A never-generated card takes a
// few seconds (GitHub data + render), long enough for X's crawler to give up
// and show a text-only preview. Best-effort: failures are ignored.
export async function warmShareCards(paths: string[]) {
  await Promise.allSettled(
    paths.map((p) => fetch(`${SITE_URL}${p}`, { headers: { "User-Agent": "github-graveyard-warmup" } })),
  );
}
