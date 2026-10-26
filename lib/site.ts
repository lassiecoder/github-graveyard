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
