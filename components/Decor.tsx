// Illustrated bits shared across pages. All decorative, so all aria-hidden.

type SvgProps = { className?: string; style?: React.CSSProperties };

// One copy of the shared filters/gradients; every inline SVG on the page can
// reference them by id.
export function SvgDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        <filter id="gg-speckle" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" stitchTiles="stitch" result="n" />
          <feColorMatrix in="n" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 9 -4.6" result="dots" />
          <feComposite in="dots" in2="SourceGraphic" operator="in" />
        </filter>
        <linearGradient id="gg-hi" x1="0.2" y1="0" x2="0.6" y2="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity=".5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gg-lo" x1="0" y1="0.55" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".22" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Sparkle({ className, style, size = 24 }: SvgProps & { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} aria-hidden>
      <path d="M12 0C12.9 7.6 16.4 11.1 24 12 16.4 12.9 12.9 16.4 12 24 11.1 16.4 7.6 12.9 0 12 7.6 11.1 11.1 7.6 12 0Z" fill="currentColor" />
    </svg>
  );
}

// Jointed legs (hip → knee → foot) for the left side, front to back; the
// right side is the same set mirrored.
const JOINTED_LEGS: { hip: [number, number]; d: string }[] = [
  { hip: [54, 44], d: "M54 44L40 18 26 4" },
  { hip: [52, 50], d: "M52 50L30 32 8 38" },
  { hip: [52, 57], d: "M52 57L28 64 10 84" },
  { hip: [55, 63], d: "M55 63L40 84 32 100" },
];

// Real spiders walk with an alternating tetrapod gait: L1 R2 L3 R4 step
// together, then the other four. Phase "a"/"b" picks which half-cycle.
const phase = (side: "l" | "r", i: number) => ((i % 2 === 0) === (side === "l") ? "a" : "b");

function LegSet({ side }: { side: "l" | "r" }) {
  return (
    <g stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
      {JOINTED_LEGS.map(({ hip, d }, i) => (
        <path
          key={d}
          d={d}
          className={`leg leg-${phase(side, i)}`}
          style={{ transformOrigin: `${hip[0]}px ${hip[1]}px` }}
        />
      ))}
    </g>
  );
}

export function SpiderBody() {
  return (
    <>
      <LegSet side="l" />
      {/* Mirror on an outer group: a CSS animation on the legs would replace a
          transform attribute on the same element and fling them off the body. */}
      <g transform="translate(120 0) scale(-1 1)">
        <LegSet side="r" />
      </g>
      <ellipse cx="60" cy="66" rx="15" ry="19" fill="currentColor" />
      <ellipse cx="60" cy="44" rx="9" ry="10" fill="currentColor" />
      <ellipse cx="55" cy="60" rx="4" ry="6" fill="#fff" opacity=".18" />
    </>
  );
}

// Dangles from the top edge on a thread and bobs.
export function HangingSpider({ className, style }: SvgProps) {
  return (
    <div className={`spider-hang pointer-events-none absolute ${className ?? ""}`} style={style} aria-hidden>
      <svg viewBox="0 -400 120 500" className="h-auto w-full overflow-visible text-ink">
        <line x1="60" y1="-400" x2="60" y2="34" stroke="currentColor" strokeWidth="1.2" />
        <SpiderBody />
      </svg>
    </div>
  );
}

export const GHOST_PATH =
  "M50 4C22 4 6 28 6 58v70c8-8 14 8 24 0s16 10 24 0 16 8 24 0 14 4 16 0V58C94 28 78 4 50 4Z";

export function Ghost({ color = "#b7ef9e", className, style, eyes = "#121a1f" }: SvgProps & { color?: string; eyes?: string }) {
  return (
    <svg viewBox="0 0 100 140" className={className} style={style} aria-hidden>
      <path d={GHOST_PATH} fill={color} />
      <path d={GHOST_PATH} fill="url(#gg-hi)" />
      <path d={GHOST_PATH} fill="url(#gg-lo)" />
      <path d={GHOST_PATH} fill="#fff" filter="url(#gg-speckle)" opacity=".28" />
      <ellipse cx="37" cy="52" rx="6.5" ry="13" fill={eyes} transform="rotate(10 37 52)" />
      <ellipse cx="61" cy="52" rx="6.5" ry="13" fill={eyes} transform="rotate(-6 61 52)" />
    </svg>
  );
}

export function Cobweb({ className, style }: SvgProps) {
  const spokes = [0, 15, 32, 50, 68, 84];
  const rings = [40, 80, 125, 170];
  const pt = (r: number, deg: number) => {
    const a = (deg * Math.PI) / 180;
    return `${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
  };
  return (
    <svg viewBox="0 0 200 200" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
      {spokes.map((d) => (
        <path key={d} d={`M0 0L${pt(210, d)}`} />
      ))}
      {rings.map((r) => (
        <path
          key={r}
          d={spokes
            .slice(1)
            .map((d, i) => `${i ? "" : `M${pt(r, spokes[0])}`}Q${pt(r * 0.82, (d + spokes[i]) / 2)} ${pt(r, d)}`)
            .join("")}
        />
      ))}
    </svg>
  );
}

// The winding path from the second reference: a fat, low-contrast ribbon.
export function Swirl({ className, style }: SvgProps) {
  return (
    <svg viewBox="0 0 400 1000" preserveAspectRatio="xMidYMid slice" className={`swirl ${className ?? ""}`} style={style} aria-hidden>
      <path
        d="M330 -20C380 120 120 140 160 260S380 380 300 500 40 560 120 680 360 760 260 880 120 980 200 1040"
        fill="none"
        stroke="currentColor"
        strokeWidth="46"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Scalloped edge where the peach dusk gives way to the graveyard night.
export function NightEdge() {
  return <div className="night-edge" aria-hidden />;
}

export function NightGhosts() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[240px] overflow-hidden sm:h-[300px]" aria-hidden>
      <Ghost color="#b7ef9e" className="ghost-bob absolute bottom-8 -left-4 w-[110px] -rotate-12 sm:left-[4%] sm:w-[170px]" />
      <Ghost color="#f06a3a" className="ghost-bob absolute bottom-16 left-[40%] w-[64px] rotate-[14deg] sm:w-[96px]" style={{ animationDelay: "-1.4s" }} />
      <Ghost color="#a4adb2" className="ghost-bob absolute bottom-6 -right-4 w-[120px] rotate-6 sm:right-[3%] sm:w-[180px]" style={{ animationDelay: "-2.6s" }} />
    </div>
  );
}

export function AppIcon({ className }: { className?: string }) {
  return (
    <span className={`inline-grid place-items-center rounded-[10px] bg-ink text-peach ${className ?? "size-9"}`} aria-hidden>
      <svg viewBox="0 0 24 24" className="size-[62%]" fill="currentColor">
        <path d="M5 21V10a7 7 0 0 1 14 0v11H5Zm6-14v3H8.5v2H11v5h2v-5h2.5v-2H13V7h-2Z" />
      </svg>
    </span>
  );
}
