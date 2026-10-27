import { Suspense } from "react";
import { getRepoStars } from "@/lib/github";
import { SOURCE_REPO } from "@/lib/site";
import { AppIcon, Cobweb, Ghost, HangingSpider } from "./Decor";

// Ectoplasm oozing over the card's top edge, drips of uneven length.
function Slime() {
  return (
    <svg viewBox="0 0 300 26" preserveAspectRatio="none" className="slime pointer-events-none absolute inset-x-7 top-0 h-[22px] w-[calc(100%-3.5rem)]" aria-hidden>
      <path
        d="M0 0H300V5C292 5 290 9 288 14 286 19 280 19 279 13 278 7 270 5 258 6 246 7 240 8 238 16 236 25 228 25 227 16 226 8 214 6 196 6 180 6 172 7 170 11 168 15 162 15 161 10 160 6 140 5 118 5 98 5 90 6 88 13 86 22 78 23 76 14 75 6 58 5 40 6 26 6 20 8 19 12 18 16 12 16 11 11 10 6 4 5 0 5Z"
        fill="#b7ef9e"
      />
      <path d="M0 0H300V2H0Z" fill="#fff" opacity=".35" />
    </svg>
  );
}

// A one-click star from this page would need every visitor to grant OAuth
// write access to all their public repos (GitHub has no star-only scope), so
// the button opens the repo, where starring is a single click.
export function StarCard({ className = "" }: { className?: string }) {
  const url = `https://github.com/${SOURCE_REPO}`;
  return (
    <div className={`star-card group relative mx-auto w-full max-w-md ${className}`}>
      {/* Waits behind the card; rises when you hover it. */}
      <Ghost color="#b7ef9e" className="star-ghost pointer-events-none absolute -top-2 right-8 z-0 w-16" />
      <HangingSpider className="left-10 top-full z-0 w-[30px] [&_svg]:text-bone/70" />

      <aside className="notify relative z-10 overflow-hidden p-5 pt-6 text-left">
        <Slime />
        <Cobweb className="pointer-events-none absolute -bottom-2 -right-2 w-24 rotate-180 text-ink/10" />
        <div className="flex items-center gap-2.5">
          <AppIcon className="size-8" />
          <span className="text-sm font-bold">GitHub Graveyard</span>
          <span className="script ml-auto text-2xl leading-none text-pumpkin">rest in stars</span>
        </div>
        <p className="mt-3 text-xl font-semibold leading-snug">Don&apos;t let this repo end up in a graveyard.</p>
        <p className="mt-1.5 text-sm text-ink/65">
          One star keeps it alive, and tells me to build more spooky stuff.
        </p>
        <a
          href={url}
          data-track="star_click"
          target="_blank"
          rel="noopener noreferrer"
          className="star-btn btn-ink relative mt-4 inline-flex w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-full py-3 pl-5 pr-2 font-bold"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" className="star-icon" aria-hidden>
            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
          </svg>
          Star on GitHub
          <Suspense>
            <StarCount />
          </Suspense>
          <span className="ml-auto hidden min-w-0 truncate pr-3 font-mono text-xs font-medium text-paper/60 sm:inline">{SOURCE_REPO}</span>
        </a>
      </aside>
    </div>
  );
}

async function StarCount() {
  const stars = await getRepoStars(SOURCE_REPO);
  if (stars === null) return null;
  return (
    <span className="rounded-full bg-paper/15 px-2 py-0.5 font-mono text-xs font-medium">
      {stars.toLocaleString("en-US")}
    </span>
  );
}
