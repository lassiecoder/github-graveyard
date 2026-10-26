import Link from "next/link";
import type { Grave } from "@/lib/github";
import { year } from "@/lib/format";
import { graveTweet, graveUrl, xIntent } from "@/lib/share";
import { Ghost } from "./Decor";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Dart: "#00B4AB",
  Ruby: "#701516",
  PHP: "#4F5D95",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Vue: "#41b883",
  Svelte: "#ff3e00",
};

// Pastel stone colors from the ghost reference, cycled by position so a
// 4-wide grid never stacks two of the same; each ghost peeks out in a
// contrasting one.
export const STONE_COLORS = ["#a4adb2", "#b7ef9e", "#f06a3a", "#f4ecdf", "#cdbdf3", "#8fa2ab"];
const GHOST_FOR = ["#b7ef9e", "#f4ecdf", "#f4ecdf", "#b7ef9e", "#f4ecdf", "#f06a3a"];


function compact(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k` : String(n);
}

export function Tombstone({
  grave,
  login,
  index = 0,
  position = index,
  size = "md",
  actions = true,
  linked = true,
  credit,
}: {
  grave: Grave;
  login: string;
  index?: number;
  position?: number;
  size?: "md" | "lg";
  actions?: boolean;
  /** False for made-up specimens: there's no real grave page to open. */
  linked?: boolean;
  /** X handle shown under the stone, linking to that dev's whole graveyard. */
  credit?: string;
}) {
  const lg = size === "lg";
  const href = `/${login}/${encodeURIComponent(grave.name)}`;
  const ci = position % STONE_COLORS.length;
  return (
    <article
      className="plot group"
      style={{ "--i": index } as React.CSSProperties}
      aria-label={`${grave.name}, ${year(grave.born)} to ${year(grave.died)}. Cause of death: ${grave.cause}`}
    >
      <div className="stone-wrap" style={{ "--tilt": grave.tilt } as React.CSSProperties}>
        <Ghost color={GHOST_FOR[ci]} className="peeker" />
        <div
          className={`stone shape-${grave.shape} ${lg ? "min-h-[480px]! px-8! pt-16!" : ""}`}
          style={{ "--c": STONE_COLORS[ci] } as React.CSSProperties}
        >
          {grave.shape === "cross" ? (
            <svg width="20" height="28" viewBox="0 0 22 30" className="mb-1" aria-hidden>
              <path d="M8 0h6v8h8v6h-8v16H8V14H0V8h8z" fill="currentColor" />
            </svg>
          ) : (
            <div className={`display tracking-[0.3em]! ${lg ? "text-xl" : "text-xs"}`}>R.I.P.</div>
          )}

          {(() => {
            const cls = `display mt-3 break-words leading-[0.95]! tracking-[-0.02em]! [overflow-wrap:anywhere] ${
              lg ? "text-5xl sm:text-6xl" : grave.name.length > 18 ? "text-lg" : "text-[1.7rem]"
            }`;
            return linked ? (
              <Link href={href} prefetch={false} className={`${cls} decoration-2 underline-offset-4 hover:underline`}>
                {grave.name}
              </Link>
            ) : (
              <span className={cls}>{grave.name}</span>
            );
          })()}

          <div className={`mt-2 font-mono font-medium tracking-wider ${lg ? "text-lg" : "text-xs"}`}>
            {year(grave.born)} — {year(grave.died)}
          </div>

          <div className={`mt-4 font-sans font-bold uppercase tracking-[0.2em] opacity-60 ${lg ? "text-xs" : "text-[9px]"}`}>
            Cause of death
          </div>
          <p className={`mt-1 font-display font-bold italic leading-snug ${lg ? "max-w-md text-3xl" : "text-[16px]"}`}>
            {grave.cause}
          </p>

          <div className="flex-1" />

          <p className={`mt-3 font-display font-bold italic leading-snug text-ink/85 ${lg ? "text-xl" : "text-[13px]"}`}>“{grave.epitaph}”</p>

          <div className={`mt-3 flex items-center gap-2.5 rounded-full bg-paper/70 px-3 py-1 font-sans font-semibold text-ink ${lg ? "text-sm" : "text-[11px]"}`}>
            {grave.language && (
              <span className="inline-flex items-center gap-1">
                <span
                  className="inline-block size-2 rounded-full ring-1 ring-black/30"
                  style={{ background: LANG_COLORS[grave.language] ?? "#2a2830" }}
                />
                {grave.language}
              </span>
            )}
            <span title="Stargazers, now mourners">
              ★ {compact(grave.stars)} {grave.stars === 1 ? "mourner" : "mourners"}
            </span>
          </div>
        </div>
      </div>
      <div className="mound" />

      {credit && (
        <Link href={`/${login}`} prefetch={false} data-track="featured_click" data-track-login={login} data-track-source="famous_grave" className="chip mt-4 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full py-1 pl-1 pr-3 text-sm font-semibold">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://github.com/${login}.png?size=48`} alt="" width={22} height={22} loading="lazy" className="size-[22px] rounded-full" />
          @{credit}&apos;s graveyard →
        </Link>
      )}

      {actions && (
        <div className="mt-4 flex gap-2 text-[12px] font-semibold opacity-80 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <a
            href={xIntent(graveTweet(login, grave), graveUrl(login, grave.name))}
            data-track="share"
            data-track-method="x"
            data-track-content_type="grave"
            data-track-item_id={`${login}/${grave.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="chip rounded-full px-3 py-1"
          >
            Post RIP on 𝕏
          </a>
          <a
            href={grave.url}
            data-track="resurrect_click"
            data-track-item_id={`${login}/${grave.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="chip rounded-full px-3 py-1"
            title="Attempt resurrection"
          >
            Resurrect ↗
          </a>
        </div>
      )}
    </article>
  );
}
