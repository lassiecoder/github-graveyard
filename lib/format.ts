// Kept apart from github.ts so client components can use these without
// pulling server-only caching code into the browser bundle.

export function year(iso: string) {
  return new Date(iso).getUTCFullYear();
}

export function monthYear(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function lifespanLabel(days: number) {
  if (days < 1) return "<1 day";
  if (days === 1) return "1 day";
  if (days < 60) return `${days} days`;
  if (days < 730) return `${Math.round(days / 30)} months`;
  return `${(days / 365).toFixed(1).replace(/\.0$/, "")} years`;
}
