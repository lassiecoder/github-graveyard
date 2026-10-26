/* eslint-disable @next/next/no-img-element -- Satori renders plain <img>, not next/image. */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Grave, Graveyard } from "./github";
import { lifespanLabel, year } from "./format";
import { Fragment, createElement, isValidElement } from "react";
import { DiggingSkeleton } from "@/components/DiggingSkeleton";
import { SITE_HOST } from "./site";

// Satori-only markup: flexbox everywhere, inline styles, no grid, no emoji.
// Visual language matches the site: peach dusk, black Didone type, white
// script, and a navy "window" holding pastel stones.

const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));
const [playfair, playfairItalic, creepster, sacramento, bricolage500, bricolage800, jbmono] = await Promise.all([
  font("playfair-900.ttf"),
  font("playfair-900i.ttf"),
  font("creepster-400.ttf"),
  font("sacramento-400.ttf"),
  font("bricolage-500.ttf"),
  font("bricolage-800.ttf"),
  font("jbmono-500.ttf"),
]);

export const ogFonts = [
  { name: "Playfair", data: playfair, weight: 900 as const, style: "normal" as const },
  { name: "Playfair", data: playfairItalic, weight: 900 as const, style: "italic" as const },
  { name: "Horror", data: creepster, weight: 400 as const, style: "normal" as const },
  { name: "Script", data: sacramento, weight: 400 as const, style: "normal" as const },
  { name: "Sans", data: bricolage500, weight: 500 as const, style: "normal" as const },
  { name: "Sans", data: bricolage800, weight: 800 as const, style: "normal" as const },
  { name: "Mono", data: jbmono, weight: 500 as const, style: "normal" as const },
];

export const OG_CACHE = {
  "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
};

const C = {
  ink: "#17110e",
  paper: "#fffaf3",
  night: "#1c2b33",
  nightDeep: "#131f26",
  swirl: "#24363f",
  mint: "#b7ef9e",
};

// Same order as components/Tombstone so a grave keeps its color everywhere.
const STONE_COLORS = ["#a4adb2", "#b7ef9e", "#f06a3a", "#f4ecdf", "#cdbdf3", "#8fa2ab"];

// Satori only accepts intrinsic elements inside <svg>, so expand the
// skeleton's little helper components (Bone, Curve…) into plain SVG first.
// They're pure functions of their props, so calling them directly is safe.
function intrinsic(node: React.ReactNode): React.ReactNode {
  if (Array.isArray(node)) return node.map(intrinsic);
  if (!isValidElement(node)) return node;
  const el = node as React.ReactElement<{ children?: React.ReactNode }>;
  if (el.type === Fragment) return intrinsic(el.props.children);
  if (typeof el.type === "function") return intrinsic((el.type as (p: unknown) => React.ReactNode)(el.props));
  const { children, ...rest } = el.props;
  return createElement(el.type, { ...rest, key: el.key }, children === undefined ? undefined : intrinsic(children));
}

// The loading screen's digging skeleton, drawn as a still (Satori renders
// inline SVG but can't animate).
export function OgSkeleton({ x, bottom, width }: { x: number; bottom: number; width: number }) {
  return (
    <div style={{ position: "absolute", left: x, bottom, display: "flex" }}>
      {intrinsic(<DiggingSkeleton headstone={false} width={width} />)}
    </div>
  );
}

// A skeleton sneaking a look over the top of a tombstone. The skull is
// drawn behind the stone (so the stone hides its jaw) and the bony fingers in
// front, gripping the stone's top edge.
const SK_INK = "#17110e";
const SK_BONE = "#fbf7ef";

export function PeekSkull({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <svg width={size} height={size * 0.9} viewBox="0 0 100 90" style={{ position: "absolute", left: x, top: y }}>
      <path
        d="M50 6C74 6 92 22 92 46 92 60 86 70 78 76V90H22V76C14 70 8 60 8 46 8 22 26 6 50 6Z"
        fill={SK_BONE}
        stroke={SK_INK}
        strokeWidth="4"
      />
      <path d="M86 30C90 40 90 54 82 64 80 52 82 40 86 30Z" fill="#e4dccd" />
      <path d="M20 30Q30 23 40 29M60 29Q70 23 80 30" stroke={SK_INK} strokeWidth="3" strokeLinecap="round" fill="none" />
      <ellipse cx="34" cy="48" rx="11" ry="12" fill={SK_INK} />
      <ellipse cx="66" cy="48" rx="11" ry="12" fill={SK_INK} />
      <circle cx="38" cy="44" r="2.6" fill="#fff" />
      <circle cx="70" cy="44" r="2.6" fill="#fff" />
      <path d="M50 60c-3 0-6 4-3 7l3 2 3-2c3-3 0-7-3-7Z" fill={SK_INK} />
    </svg>
  );
}

export function PeekFingers({ x, y, size }: { x: number; y: number; size: number }) {
  const hand = (cx: number) =>
    [-9, -3, 3, 9].map((dx) => (
      <g key={cx + dx}>
        <path d={`M${cx + dx} 4V22`} stroke={SK_INK} strokeWidth="8.5" strokeLinecap="round" />
        <path d={`M${cx + dx} 4V22`} stroke={SK_BONE} strokeWidth="4.5" strokeLinecap="round" />
      </g>
    ));
  return (
    <svg width={size} height={size * 0.3} viewBox="0 0 100 30" style={{ position: "absolute", left: x, top: y }}>
      {hand(22)}
      {hand(78)}
    </svg>
  );
}

export const trunc = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export function avatarSrc(url: string, size = 200) {
  return `${url}${url.includes("?") ? "&" : "?"}s=${size}`;
}

export function Dusk({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: "#ffb07f",
        backgroundImage: "linear-gradient(160deg, #ffd0a4 0%, #ffb482 45%, #ff9a76 100%)",
        color: C.ink,
        fontFamily: "Sans",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

export function Sparkle({ size, x, y, color = "#fff" }: { size: number; x: number; y: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: "absolute", left: x, top: y }}>
      <path d="M12 0C12.9 7.6 16.4 11.1 24 12 16.4 12.9 12.9 16.4 12 24 11.1 16.4 7.6 12.9 0 12 7.6 11.1 11.1 7.6 12 0Z" fill={color} />
    </svg>
  );
}

const LEGS = ["M54 46Q34 20 14 30", "M52 52Q26 40 6 56", "M52 58Q28 62 10 82", "M55 64Q38 82 28 99"];

export function Spider({ x, width, thread }: { x: number; width: number; thread: number }) {
  const h = (width / 120) * 100;
  return (
    <div style={{ position: "absolute", left: x, top: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: 2, height: thread, background: C.ink, display: "flex" }} />
      <svg width={width} height={h} viewBox="0 0 120 100" style={{ marginTop: -h * 0.36 }}>
        {LEGS.map((d) => (
          <path key={d} d={d} stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" fill="none" />
        ))}
        {LEGS.map((d) => (
          <path key={`r${d}`} d={d} stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" fill="none" transform="translate(120 0) scale(-1 1)" />
        ))}
        <ellipse cx="60" cy="64" rx="15" ry="19" fill={C.ink} />
        <circle cx="60" cy="42" r="9" fill={C.ink} />
      </svg>
    </div>
  );
}

const GHOST_PATH = "M50 4C22 4 6 28 6 58v70c8-8 14 8 24 0s16 10 24 0 16 8 24 0 14 4 16 0V58C94 28 78 4 50 4Z";

export function OgGhost({ color, width, style }: { color: string; width: number; style?: React.CSSProperties }) {
  return (
    <svg width={width} height={width * 1.4} viewBox="0 0 100 140" style={{ position: "absolute", ...style }}>
      <path d={GHOST_PATH} fill={color} />
      <ellipse cx="37" cy="52" rx="6.5" ry="13" fill="#121a1f" transform="rotate(10 37 52)" />
      <ellipse cx="61" cy="52" rx="6.5" ry="13" fill="#121a1f" transform="rotate(-6 61 52)" />
    </svg>
  );
}

// The navy window the stones stand in.
export function NightPanel({ children, style }: { children: React.ReactNode; style: React.CSSProperties }) {
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        overflow: "hidden",
        background: C.night,
        borderRadius: 36,
        boxShadow: "0 30px 60px rgba(110,40,0,0.35)",
        ...style,
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 400 600" preserveAspectRatio="none" style={{ position: "absolute", left: 0, top: 0 }}>
        <path d="M300 -20C360 120 100 160 150 280S360 400 260 520 120 600 180 640" fill="none" stroke={C.swirl} strokeWidth="56" strokeLinecap="round" />
      </svg>
      <div
        style={{
          position: "absolute",
          left: -40,
          right: -40,
          bottom: -30,
          height: 80,
          borderRadius: "50%",
          background: C.nightDeep,
          display: "flex",
        }}
      />
      {children}
    </div>
  );
}

export function OgStone({
  grave,
  width,
  height,
  colorIndex,
  scale = 1,
}: {
  grave: Grave;
  width: number;
  height: number;
  colorIndex: number;
  scale?: number;
}) {
  const s = (n: number) => Math.round(n * scale);
  const nameSize = grave.name.length > 16 ? s(22) : grave.name.length > 11 ? s(28) : s(34);
  const round = grave.shape === "round" || grave.shape === "gothic";
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: `${round ? s(52) : s(34)}px ${s(16)}px ${s(16)}px`,
        borderRadius: round ? `${width / 2}px ${width / 2}px 10px 10px` : "24px 24px 8px 8px",
        backgroundColor: STONE_COLORS[colorIndex % STONE_COLORS.length],
        backgroundImage:
          "radial-gradient(circle at 25% 5%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 55%), linear-gradient(180deg, rgba(0,0,0,0) 70%, rgba(0,0,0,0.08) 100%)",
        color: C.ink,
        transform: `rotate(${grave.tilt * 0.6}deg)`,
        textAlign: "center",
        position: "relative",
      }}
    >
      {grave.shape === "cross" ? (
        <div style={{ display: "flex", position: "relative", width: s(16), height: s(22) }}>
          <div style={{ position: "absolute", left: s(6), top: 0, width: s(4), height: s(22), background: C.ink, display: "flex" }} />
          <div style={{ position: "absolute", left: 0, top: s(5), width: s(16), height: s(4), background: C.ink, display: "flex" }} />
        </div>
      ) : (
        <div style={{ fontFamily: "Playfair", fontSize: s(13), letterSpacing: s(4), display: "flex" }}>R.I.P.</div>
      )}
      <div
        style={{
          fontFamily: "Playfair",
          fontSize: nameSize,
          lineHeight: 1,
          letterSpacing: -0.5,
          marginTop: s(8),
          display: "flex",
          textAlign: "center",
          justifyContent: "center",
        }}
      >
        {trunc(grave.name, 24)}
      </div>
      <div style={{ fontFamily: "Mono", fontSize: s(14), marginTop: s(8), display: "flex" }}>
        {`${year(grave.born)} – ${year(grave.died)}`}
      </div>
      <div style={{ fontSize: s(10), fontWeight: 800, letterSpacing: s(2.5), opacity: 0.6, marginTop: s(14), display: "flex" }}>
        CAUSE OF DEATH
      </div>
      <div
        style={{
          fontFamily: "Playfair",
          fontStyle: "italic",
          fontSize: s(18),
          lineHeight: 1.15,
          marginTop: s(5),
          display: "flex",
          textAlign: "center",
          justifyContent: "center",
        }}
      >
        {trunc(grave.cause, 60)}
      </div>
      {grave.epitaph && height >= 260 && (
        <div
          style={{
            display: "flex",
            marginTop: "auto",
            paddingBottom: s(8),
            fontFamily: "Playfair",
            fontStyle: "italic",
            fontSize: s(14),
            lineHeight: 1.2,
            opacity: 0.85,
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          {`“${trunc(grave.epitaph, 40)}”`}
        </div>
      )}
    </div>
  );
}

function Sticker({ value, label, size = 40, tilt = 0 }: { value: string; label: string; size?: number; tilt?: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: C.paper,
        borderRadius: 20,
        padding: `${size * 0.32}px ${size * 0.5}px`,
        transform: `rotate(${tilt}deg)`,
        boxShadow: "0 12px 24px rgba(110,40,0,0.22)",
      }}
    >
      <div style={{ fontFamily: "Playfair", fontSize: size, lineHeight: 1, letterSpacing: -1, display: "flex" }}>{value}</div>
      <div style={{ fontSize: size * 0.3, fontWeight: 800, letterSpacing: 2, opacity: 0.55, marginTop: size * 0.18, display: "flex" }}>
        {label.toUpperCase()}
      </div>
    </div>
  );
}

export function Footer({ size = 20 }: { size?: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignSelf: "flex-start",
        background: C.ink,
        color: C.paper,
        borderRadius: 999,
        padding: `${size * 0.55}px ${size * 1.1}px`,
        fontSize: size,
        fontWeight: 800,
      }}
    >
      {`dig up yours → ${SITE_HOST}`}
    </div>
  );
}

const handleSize = (login: string, base: number) =>
  login.length <= 8 ? base : login.length <= 12 ? base * 0.8 : login.length <= 16 ? base * 0.64 : base * 0.5;

function Eyebrow({ avatar, size }: { avatar: string; size: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.6 }}>
      <img src={avatarSrc(avatar)} width={size * 3} height={size * 3} style={{ borderRadius: 999, border: `4px solid ${C.paper}` }} alt="" />
      <div style={{ display: "flex", fontSize: size, fontWeight: 800, letterSpacing: 3, opacity: 0.7 }}>THE GITHUB GRAVEYARD OF</div>
    </div>
  );
}

function Title({ g, base, rankSize }: { g: Graveyard; base: number; rankSize: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", fontFamily: "Horror", fontSize: handleSize(g.login, base), lineHeight: 1, letterSpacing: 1 }}>
        {trunc(g.login, 22)}
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: "Script",
          fontSize: rankSize,
          lineHeight: 1,
          color: "#fff",
          marginTop: -rankSize * 0.3,
          marginLeft: rankSize * 0.3,
          transform: "rotate(-6deg)",
        }}
      >
        {g.title.rank}
      </div>
    </div>
  );
}

function Empty({ size }: { size: number }) {
  return (
    <div style={{ display: "flex", fontFamily: "Playfair", fontSize: size, color: "#f4ecdf", textAlign: "center", margin: "auto", padding: 40 }}>
      No graves. Suspiciously clean.
    </div>
  );
}

export function LandscapeCard({ g }: { g: Graveyard }) {
  const top = g.graves.slice(0, 3);
  // Tallest stone in the middle reads like a little skyline.
  const order = top.length === 3 ? [1, 0, 2] : top.map((_, i) => i);
  const heights = top.length === 3 ? [300, 360, 280] : [340, 300];
  // Where the tallest stone's top edge sits inside the panel, for the
  // skeleton peeking over it (panel is 566 tall, stones stand 34 from its
  // bottom, 150 wide, centred with 12px gaps).
  const tallest = Math.max(...heights.slice(0, top.length));
  const peekCentre = top.length === 3 ? 245 : top.length === 2 ? 245 - 81 : 245;
  const stoneTop = 566 - 34 - tallest;
  return (
    <Dusk>
      <Sparkle size={30} x={600} y={120} />
      <Sparkle size={18} x={630} y={170} />
      <div style={{ display: "flex", flexDirection: "column", padding: "52px 0 0 60px", width: 640 }}>
        <Eyebrow avatar={g.avatar} size={18} />
        <div style={{ display: "flex", marginTop: 28 }}>
          <Title g={g} base={110} rankSize={70} />
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 30 }}>
          <Sticker value={String(g.graves.length)} label="buried" tilt={-2} />
          <Sticker value={g.graves.length ? lifespanLabel(g.avgLifespanDays) : "—"} label="avg lifespan" tilt={1.5} />
        </div>
      </div>
      {/* Lifted clear of the title label X overlays on the bottom-left. */}
      <div style={{ position: "absolute", left: 60, bottom: 110, display: "flex" }}>
        <Footer />
      </div>
      <OgSkeleton x={452} bottom={102} width={196} />
      <NightPanel style={{ right: 32, top: 32, bottom: 32, width: 490 }}>
        <OgGhost color={C.mint} width={80} style={{ right: 26, top: 60, transform: "rotate(12deg)" }} />
        {top.length > 0 && <PeekSkull x={peekCentre - 34} y={stoneTop - 46} size={68} />}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 12 }}>
          {top.length ? (
            order.map((idx, i) => (
              <OgStone key={top[idx].name} grave={top[idx]} colorIndex={idx} width={150} height={heights[i]} scale={0.72} />
            ))
          ) : (
            <Empty size={40} />
          )}
        </div>
        {top.length > 0 && <PeekFingers x={peekCentre - 50} y={stoneTop - 12} size={100} />}
      </NightPanel>
    </Dusk>
  );
}

export function PortraitCard({ g }: { g: Graveyard }) {
  const top = g.graves.slice(0, 6);
  return (
    <Dusk>
      <Sparkle size={36} x={940} y={150} />
      <Sparkle size={20} x={985} y={215} />
      <Spider x={640} width={56} thread={70} />
      <div style={{ display: "flex", flexDirection: "column", width: "100%", padding: "64px 64px 0" }}>
        <Eyebrow avatar={g.avatar} size={22} />
        <div style={{ display: "flex", marginTop: 34 }}>
          <Title g={g} base={130} rankSize={86} />
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 34 }}>
          <Sticker value={String(g.graves.length)} label="buried" size={46} tilt={-2} />
          <Sticker value={g.graves.length ? lifespanLabel(g.avgLifespanDays) : "—"} label="avg lifespan" size={46} tilt={1.5} />
          <Sticker value={g.totalMourners.toLocaleString("en-US")} label="mourners" size={46} tilt={-1} />
        </div>
      </div>
      <NightPanel style={{ left: 32, right: 32, bottom: 32, height: 790 }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 44,
            bottom: 120,
            display: "flex",
            flexWrap: "wrap",
            gap: 26,
            rowGap: 34,
            justifyContent: "center",
            alignContent: "flex-end",
          }}
        >
          {top.length ? (
            top.map((grave, i) => (
              <OgStone key={grave.name} grave={grave} colorIndex={i} width={290} height={i % 2 ? 260 : 280} scale={0.92} />
            ))
          ) : (
            <Empty size={48} />
          )}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 38, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", background: C.mint, color: C.ink, borderRadius: 999, padding: "14px 28px", fontSize: 26, fontWeight: 800 }}>
            {`dig up yours → ${SITE_HOST}`}
          </div>
        </div>
      </NightPanel>
      {/* Stands on the panel's top edge, digging into it. */}
      {/* Feet on the panel's top edge (y = 1350 − 32 − 790 = 528); the art's
          ground line sits at 251/262 of its height. */}
      <OgSkeleton x={770} bottom={1350 - 528 - 18} width={270} />
    </Dusk>
  );
}

export function GraveCard({ grave, colorIndex }: { grave: Grave; colorIndex: number }) {
  return (
    <Dusk>
      <Sparkle size={28} x={640} y={90} />
      <Sparkle size={16} x={600} y={140} />
      <div style={{ display: "flex", flexDirection: "column", position: "absolute", left: 60, top: 50, width: 640 }}>
        <div style={{ display: "flex", fontFamily: "Script", fontSize: 64, color: "#fff", lineHeight: 1 }}>here lies</div>
        <div style={{ display: "flex", fontFamily: "Horror", fontSize: grave.name.length > 16 ? 64 : 84, lineHeight: 1, letterSpacing: 1, marginTop: 4 }}>
          {trunc(grave.name, 28)}
        </div>
        <div style={{ display: "flex", fontFamily: "Mono", fontSize: 24, opacity: 0.7, marginTop: 16 }}>
          {`${year(grave.born)} – ${year(grave.died)} · lived ${lifespanLabel(grave.lifespanDays)}`}
        </div>
        <div style={{ display: "flex", fontSize: 18, fontWeight: 800, letterSpacing: 4, opacity: 0.6, marginTop: 36 }}>CAUSE OF DEATH</div>
        <div style={{ display: "flex", fontFamily: "Playfair", fontStyle: "italic", fontSize: 46, lineHeight: 1.1, marginTop: 8 }}>
          {trunc(grave.cause, 70)}
        </div>
      </div>
      <div style={{ position: "absolute", left: 60, bottom: 110, display: "flex" }}>
        <Footer />
      </div>
      <NightPanel style={{ right: 32, top: 32, bottom: 32, width: 420 }}>
        <OgGhost color={colorIndex % STONE_COLORS.length === 1 ? "#f4ecdf" : C.mint} width={90} style={{ right: 36, top: 70, transform: "rotate(14deg)" }} />
        {/* Panel is 566 tall and 420 wide; the stone is centred, 420 tall, 34 up. */}
        <PeekSkull x={210 - 40} y={566 - 34 - 420 - 54} size={80} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center" }}>
          <OgStone grave={grave} colorIndex={colorIndex} width={290} height={420} scale={1.1} />
        </div>
        <PeekFingers x={210 - 60} y={566 - 34 - 420 - 14} size={120} />
      </NightPanel>
    </Dusk>
  );
}
