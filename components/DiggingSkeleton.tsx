// A cartoon skeleton digging up a grave, shown while a graveyard loads:
// big round skull, knobbly bones, clean ink outlines, a shovel that pushes
// into the dirt and flings it out.

const INK = "#17110e";
const BONE = "#fbf7ef";
const SHADE = "#e4dccd";
const WOOD = "#8a5a3c";
const DIRT = "#3b2c24";

type P = [number, number];

// A long bone with knobbly ends, outline first, then fill, so each bone keeps
// its own outline where it overlaps the next.
function Bone({ a, b, w = 7 }: { a: P; b: P; w?: number }) {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const len = Math.hypot(dx, dy) || 1;
  const [px, py] = [(-dy / len) * w * 0.38, (dx / len) * w * 0.38];
  const knobs: P[] = [
    [a[0] + px, a[1] + py],
    [a[0] - px, a[1] - py],
    [b[0] + px, b[1] + py],
    [b[0] - px, b[1] - py],
  ];
  const r = w * 0.55;
  const d = `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`;
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={w + 5} strokeLinecap="round" />
      {knobs.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={r + 2.5} fill={INK} />
      ))}
      <path d={d} stroke={BONE} strokeWidth={w} strokeLinecap="round" />
      {knobs.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={BONE} />
      ))}
    </g>
  );
}

// Curved bone (ribs, collarbones): outline stroke under a fill stroke.
function Curve({ d, w = 6 }: { d: string; w?: number }) {
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={INK} strokeWidth={w + 5} />
      <path d={d} stroke={BONE} strokeWidth={w} />
    </g>
  );
}

function Joint({ x, y, r = 6 }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={BONE} stroke={INK} strokeWidth="2.5" />;
}

// Bony hand wrapped round the shovel handle.
function Hand({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="7" fill={BONE} stroke={INK} strokeWidth="2.5" />
      <path d={`M${x - 5} ${y - 3}h10M${x - 5.5} ${y + 1}h11M${x - 5} ${y + 5}h10`} stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

// Clods flung from the hole as the shovel lifts (see .skel-dirt timing).
const CLODS = [
  { cx: 58, r: 4.6, dx: "-34px" },
  { cx: 66, r: 3.4, dx: "-14px" },
  { cx: 52, r: 2.8, dx: "-50px" },
  { cx: 62, r: 2.4, dx: "-24px" },
  { cx: 70, r: 2, dx: "-4px" },
];

const RIBS = [122, 133, 144, 155];

// `headstone={false}` drops the RIP stone, for places that already show
// graves (the share card). `width` is for the share-card renderer, which
// draws this as a still and needs an explicit size.
export function DiggingSkeleton({
  className,
  headstone = true,
  width,
}: {
  className?: string;
  headstone?: boolean;
  width?: number;
}) {
  return (
    <svg
      viewBox="0 0 250 262"
      className={className}
      width={width}
      height={width ? Math.round((width * 262) / 250) : undefined}
      aria-hidden
    >
      {/* Headstone of the grave being dug, ground shadow, hole, dirt heap. */}
      {headstone && (
        <>
          <path d="M200 250V194c0-12 9-20 20-20s20 8 20 20v56Z" fill="#a4adb2" stroke={INK} strokeWidth="3" />
          <path d="M205 196c1-9 7-15 15-15" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity=".5" />
          <text x="220" y="212" textAnchor="middle" fontFamily="var(--font-playfair), serif" fontWeight="900" fontSize="12" fill={INK}>
            RIP
          </text>
        </>
      )}
      <ellipse cx="146" cy="251" rx="58" ry="5" fill={INK} opacity=".18" />
      <ellipse cx="60" cy="248" rx="34" ry="7.5" fill={INK} />
      <path d="M2 252C8 230 30 224 44 252Z" fill={DIRT} />
      <path d="M12 238c4-5 10-7 15-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".2" />
      {CLODS.map((c, i) => (
        <circle
          key={i}
          className="dirt skel-dirt"
          cx={c.cx}
          cy="240"
          r={c.r}
          fill={DIRT}
          style={{ "--dx": c.dx, animationDelay: `${0.28 + i * 0.04}s` } as React.CSSProperties}
        />
      ))}

      <g className="skel-body">
        {/* Legs and feet, slightly bent. */}
        <Bone a={[128, 196]} b={[122, 222]} w={8} />
        <Bone a={[122, 224]} b={[124, 242]} w={7} />
        <Bone a={[154, 196]} b={[160, 222]} w={8} />
        <Bone a={[160, 224]} b={[158, 242]} w={7} />
        <Joint x={122} y={223} r={6} />
        <Joint x={160} y={223} r={6} />
        <path d="M128 240c-10-2-20 0-24 4-3 4 0 7 6 7h18c4 0 5-9 0-11Z" fill={BONE} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M154 240c10-2 20 0 24 4 3 4 0 7-6 7h-18c-4 0-5-9 0-11Z" fill={BONE} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />

        {/* Spine, pelvis. */}
        <Curve d="M141 112V182" w={7} />
        <path d="M137 168h8M137 176h8" stroke={INK} strokeWidth="1.6" />
        <path
          d="M141 178C151 171 169 172 173 183 177 195 161 202 151 197L141 192 131 197C121 202 105 195 109 183 113 172 131 171 141 178Z"
          fill={BONE}
          stroke={INK}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <ellipse cx="126" cy="186" rx="6" ry="3.5" fill={INK} transform="rotate(-12 126 186)" />
        <ellipse cx="156" cy="186" rx="6" ry="3.5" fill={INK} transform="rotate(12 156 186)" />

        {/* Ribcage. */}
        {RIBS.map((y, i) => {
          const s = 1 - i * 0.12;
          return (
            <g key={y}>
              <Curve d={`M139 ${y}Q${139 - 24 * s} ${y - 4} ${139 - 27 * s} ${y + 7}`} w={6} />
              <Curve d={`M143 ${y}Q${143 + 24 * s} ${y - 4} ${143 + 27 * s} ${y + 7}`} w={6} />
            </g>
          );
        })}
        <Curve d="M141 118V160" w={5} />
        <Curve d="M114 116Q141 108 168 116" w={6} />

        {/* Skull. */}
        <g className="skel-head">
          <path
            d="M141 16C167 16 186 34 186 58 186 73 179 83 171 89V97C171 103 165 107 159 107H123C117 107 111 103 111 97V89C103 83 96 73 96 58 96 34 115 16 141 16Z"
            fill={BONE}
            stroke={INK}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M176 44C182 56 182 72 172 84 168 70 172 56 176 44Z" fill={SHADE} />
          <path d="M110 40Q120 33 131 39M151 39Q162 33 172 40" stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <ellipse cx="124" cy="60" rx="12" ry="13" fill={INK} />
          <ellipse cx="158" cy="60" rx="12" ry="13" fill={INK} />
          <circle cx="128" cy="55" r="2.6" fill="#fff" />
          <circle cx="162" cy="55" r="2.6" fill="#fff" />
          <path d="M141 74c-4 0-7 5-4 8l4 3 4-3c3-3 0-8-4-8Z" fill={INK} />
          <path d="M120 92Q141 98 162 92V100Q141 104 120 100Z" fill={BONE} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M126 93.5v8M133 94.8v8M141 95.2v8M149 94.8v8M156 93.5v8M121 96Q141 101 161 96" stroke={INK} strokeWidth="1.6" fill="none" />
        </g>

        {/* Arms and shovel move together (pivot near the chest). */}
        <g className="skel-dig">
          <path d="M200 86L74 206" stroke={INK} strokeWidth="8" strokeLinecap="round" />
          <path d="M200 86L74 206" stroke={WOOD} strokeWidth="4" strokeLinecap="round" />
          <path d="M190 76L210 96" stroke={INK} strokeWidth="7" strokeLinecap="round" />
          <path
            d="M82 196L60 214C51 222 50 238 62 240 75 242 90 233 94 222L88 206Z"
            fill="#c3cacd"
            stroke={INK}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M64 226C64 220 68 215 74 212" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity=".8" />
          <Bone a={[166, 118]} b={[190, 138]} w={7} />
          <Bone a={[190, 138]} b={[182, 112]} w={6} />
          <Joint x={190} y={138} r={5.5} />
          <Hand x={180} y={106} />
          <Bone a={[116, 118]} b={[112, 148]} w={7} />
          <Bone a={[112, 148]} b={[133, 150]} w={6} />
          <Joint x={112} y={148} r={5.5} />
          <Hand x={136} y={148} />
          <Joint x={116} y={118} r={8} />
          <Joint x={166} y={118} r={8} />
        </g>
      </g>
    </svg>
  );
}
