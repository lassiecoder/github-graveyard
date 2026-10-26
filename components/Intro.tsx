// First-load splash: a skeleton witch rides a broom across the screen and
// sweeps a curtain away to reveal the site. Pure CSS, no client JS: an inline
// script in <head> (INTRO_SCRIPT) picks the direction, alternating left→right
// and right→left on each load, and a random line, before first paint. It lives
// in the root layout, so client-side navigations don't replay it.

const QUIPS = [
  "Summoning your abandoned repos…",
  "Dusting off half-finished side projects…",
  "Counting commits from beyond the grave…",
  "Reading their last words: “wip”…",
  "Waking the dead (and their node_modules)…",
];

export const INTRO_SCRIPT = `(function(){var d=document.documentElement;try{var k="gg:intro",n=+(localStorage.getItem(k)||0);localStorage.setItem(k,String(n+1));d.dataset.intro=n%2?"rtl":"ltr"}catch(e){d.dataset.intro="ltr"}d.dataset.quip=String(Math.floor(Math.random()*${QUIPS.length}));var s=function(){d.classList.add("intro-skip")};addEventListener("pointerdown",s,{once:true});addEventListener("keydown",s,{once:true})})()`;

const INK = "#17110e";
const BONE = "#f4ecdf";

// Outlined bone segment: a fat ink stroke under a thinner bone stroke.
function Bone({ d, w = 6 }: { d: string; w?: number }) {
  return (
    <>
      <path d={d} stroke={INK} strokeWidth={w + 5} strokeLinecap="round" fill="none" />
      <path d={d} stroke={BONE} strokeWidth={w} strokeLinecap="round" fill="none" />
    </>
  );
}

function TinySpider({ x, y, thread }: { x: number; y: number; thread: number }) {
  return (
    <g stroke={INK} strokeLinecap="round">
      <path d={`M${x} ${y}v${thread}`} strokeWidth="1.4" />
      <g strokeWidth="1.8" fill="none">
        <path d={`M${x - 3} ${y + thread + 2}l-6-4M${x - 3} ${y + thread + 4}l-7 1M${x - 3} ${y + thread + 6}l-6 5`} />
        <path d={`M${x + 3} ${y + thread + 2}l6-4M${x + 3} ${y + thread + 4}l7 1M${x + 3} ${y + thread + 6}l6 5`} />
      </g>
      <ellipse cx={x} cy={y + thread + 4} rx="4" ry="4.6" fill={INK} stroke="none" />
    </g>
  );
}

// Positioned by the outer group so the inner path's CSS twinkle (a transform)
// doesn't overwrite its placement.
function Twinkle({ x, y, s = 1, delay = 0 }: { x: number; y: number; s?: number; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        className="intro-twinkle"
        style={{ animationDelay: `${delay}ms` }}
        d="M0-9C.6-3 3-.6 9 0 3 .6.6 3 0 9-.6 3-3 .6-9 0-3-.6-.6-3 0-9Z"
        fill={INK}
      />
    </g>
  );
}

// Specks of stardust shed behind the broom, drifting off and fading.
const DUST = [
  { x: -70, y: 120, r: 2.6, d: 0 },
  { x: -64, y: 150, r: 2, d: 120 },
  { x: -74, y: 100, r: 1.6, d: 240 },
  { x: -66, y: 172, r: 2.2, d: 360 },
  { x: -72, y: 136, r: 1.4, d: 480 },
];

// Drawn facing right (flying left→right); mirrored for the other direction.
function BroomRider() {
  return (
    <svg viewBox="-110 -40 370 245" className="h-auto w-full overflow-visible">
      {/* Speed lines streaming back, stardust shed behind. */}
      <g stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none">
        <path className="intro-streak" d="M-74 104h-40" />
        <path className="intro-streak" d="M-78 134h-34" style={{ animationDelay: "-0.12s" }} />
        <path className="intro-streak" d="M-70 166h-40" style={{ animationDelay: "-0.24s" }} />
      </g>
      {DUST.map((p) => (
        <circle key={p.d} className="intro-dust" cx={p.x} cy={p.y} r={p.r} fill={INK} style={{ animationDelay: `${p.d}ms` }} />
      ))}
      <Twinkle x={-86} y={84} s={0.8} delay={-200} />
      <Twinkle x={-96} y={188} s={0.6} delay={-500} />

      {/* Broom: bristles trail behind, spiders dangle from them. */}
      <TinySpider x={-42} y={166} thread={22} />
      <TinySpider x={-18} y={160} thread={12} />
      <path d="M250 118L-6 140" stroke={INK} strokeWidth="9" strokeLinecap="round" />
      <g className="intro-bristles">
      <path
        d="M2 126C-20 118-46 110-66 114-72 132-70 158-62 174-40 170-18 160 4 152Z"
        fill="#f06a3a"
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <g stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none">
        <path d="M-10 132L-58 124M-10 140L-64 142M-10 148L-58 162" />
        <path d="M-20 120Q-30 140-24 164M-40 116Q-48 140-42 168" opacity=".6" />
      </g>
      </g>
      <path d="M0 124l6 30" stroke={INK} strokeWidth="8" strokeLinecap="round" />

      {/* Back leg, back arm (behind the body). */}
      <Bone d="M122 128L156 134" w={7} />
      <Bone d="M156 136L150 176" w={6} />
      <Bone d="M147 181L163 185" w={6} />
      <Bone d="M108 62L99 92" w={6} />
      <Bone d="M99 93L103 124" w={5} />
      <path d="M100 126l-4 8M104 127l-1 9M108 126l2 8" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />

      {/* Spine, ribs, collarbone, pelvis. */}
      <Bone d="M128 114V62" w={6} />
      <Bone d="M114 70Q128 64 142 70" w={5} />
      <Bone d="M112 80Q128 74 144 80" w={5} />
      <Bone d="M114 90Q128 84 142 90" w={5} />
      <Bone d="M117 99Q128 94 139 99" w={4} />
      <Bone d="M108 60H148" w={5} />
      <ellipse cx="128" cy="124" rx="18" ry="11" fill={BONE} stroke={INK} strokeWidth="4" />

      {/* Front leg and arm, gripping the handle. */}
      <Bone d="M134 126L172 128" w={7} />
      <Bone d="M172 130L170 172" w={6} />
      <Bone d="M167 177L185 179" w={6} />
      <Bone d="M148 62L160 90" w={6} />
      <Bone d="M160 91L176 118" w={5} />
      <path d="M174 122l2 8M178 121l3 8M182 120l4 7" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />

      {/* Skull. */}
      <path
        d="M128 18a19 19 0 0 1 19 19c0 8-4 12-7 14v8h-24v-8c-3-2-7-6-7-14a19 19 0 0 1 19-19Z"
        fill={BONE}
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <ellipse cx="121" cy="38" rx="4.6" ry="5.6" fill={INK} />
      <ellipse cx="136" cy="38" rx="4.6" ry="5.6" fill={INK} />
      <path d="M128 44l-2.4 5h4.8z" fill={INK} />
      <path d="M122 52v6M127 52v6M132 52v6" stroke={INK} strokeWidth="2" />

      {/* Witch hat, tip blown back by the wind. */}
      <path d="M108 20Q110-10 82-34Q120-22 140 4L148 16Z" fill={INK} />
      <path d="M98 23Q128 9 162 18Q130 29 98 23Z" fill={INK} />
      <path d="M111 17Q128 11 146 13" stroke="#f06a3a" strokeWidth="4" strokeLinecap="round" fill="none" />

      <Twinkle x={194} y={46} delay={-300} />
      <Twinkle x={66} y={30} s={0.8} delay={-700} />
      <Twinkle x={214} y={86} s={0.6} delay={-1000} />
    </svg>
  );
}

export function Intro() {
  return (
    <div className="intro" aria-hidden>
      <div className="intro-curtain grain">
        <div className="intro-text px-4 text-center">
          <p className="horror text-[clamp(3.4rem,13vw,8rem)] uppercase">Digging up</p>
          <p className="script -mt-[0.15em] -rotate-6 text-[clamp(3.2rem,12vw,7rem)] text-pumpkin">the dead</p>
          {QUIPS.map((q, i) => (
            <p key={q} data-i={i} className="intro-quip mt-8 text-lg font-semibold text-ink/75 sm:text-xl">
              {q}
            </p>
          ))}
        </div>
      </div>
      <div className="intro-flyer">
        <div className="intro-bob">
          <BroomRider />
        </div>
      </div>
    </div>
  );
}
