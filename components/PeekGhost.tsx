"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// After a download: a witch-hatted ghost (ink outlines, cream sheet, pumpkin
// bucket, bats) sneaks in from the left or right edge, says the card is saved,
// then slips back out. Portaled to <body> so transformed ancestors can't trap
// its position: fixed.

export type Peek = { id: number; side: "left" | "right" };

const INK = "#17110e";
const SHEET = "#f8f3ea";

const BODY =
  "M100 74C128 74 144 100 144 136L150 226C140 220 134 232 124 226 116 234 108 226 100 232 92 226 84 234 76 226 66 232 60 220 50 226L56 136C56 100 72 74 100 74Z";

// Two wings hinged at the body so they actually flap; the whole bat drifts
// on a little loop (see .peek-bat in globals.css).
function Bat({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="-34 -16 68 30" className={`peek-bat overflow-visible ${className ?? ""}`} style={style} aria-hidden>
      <path className="peek-wing peek-wing-l" d="M-3 0C-10-8-20-10-32-6-26-3-24 1-26 6-20 2-15 3-12 8-9 3-6 2-3 3Z" fill={INK} />
      <path className="peek-wing peek-wing-r" d="M3 0C10-8 20-10 32-6 26-3 24 1 26 6 20 2 15 3 12 8 9 3 6 2 3 3Z" fill={INK} />
      <ellipse cx="0" cy="1" rx="4" ry="6" fill={INK} />
      <path d="M-3-4l-1.5-4 3 2.5zM3-4l1.5-4-3 2.5z" fill={INK} />
    </svg>
  );
}

function WitchGhost() {
  return (
    <svg viewBox="0 0 200 240" className="h-auto w-full overflow-visible" aria-hidden>
      {/* Sheet, folds, eyes. */}
      <path d={BODY} fill={SHEET} stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M84 170l-4 48M102 168l1 56M120 170l5 48" stroke={INK} strokeWidth="3" strokeLinecap="round" fill="none" />
      <ellipse cx="88" cy="132" rx="7" ry="11" fill={INK} />
      <ellipse cx="113" cy="132" rx="7" ry="11" fill={INK} />
      {/* Nubby arm holding a jack-o'-lantern bucket. */}
      <path d="M140 152c16 6 18 26 4 32" fill={SHEET} stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M134 194q16-18 32 0" stroke={INK} strokeWidth="3" fill="none" />
      <ellipse cx="150" cy="208" rx="18" ry="15" fill="#f2895c" stroke={INK} strokeWidth="3.5" />
      <path d="M142 202l3-5 3 5zM154 202l3-5 3 5z" fill={INK} />
      <path d="M140 212q10 8 20 0l-3 1-2 3-3-3-2 3-3-3-2 3z" fill={INK} />
      {/* Droopy witch hat. */}
      <path
        d="M74 90C76 54 96 26 122 18 142 12 152 26 144 36 156 32 164 44 152 52 142 50 138 60 138 74L136 90Z"
        fill="#2a2422"
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M58 94C84 76 124 74 146 90 124 100 84 102 58 94Z" fill="#2a2422" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M80 86c16-6 34-6 50-2" stroke="#f2895c" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function PeekGhost({ peek, onDone }: { peek: Peek | null; onDone: () => void }) {
  const [leavingId, setLeavingId] = useState<number | null>(null);
  const leaving = peek !== null && leavingId === peek.id;

  useEffect(() => {
    if (!peek) return;
    const out = setTimeout(() => setLeavingId(peek.id), 3200);
    const done = setTimeout(onDone, 3800);
    return () => {
      clearTimeout(out);
      clearTimeout(done);
    };
  }, [peek, onDone]);

  // Peeks only exist after a click, so this never runs during SSR.
  if (!peek) return null;
  const left = peek.side === "left";
  return createPortal(
    <div
      key={peek.id}
      className={`peek-ghost pointer-events-none fixed bottom-[14vh] z-[85] ${left ? "left-0 peek-left" : "right-0 peek-right"} ${leaving ? "leaving" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative w-[150px] sm:w-[180px]">
        <Bat className={`absolute -top-12 w-11 ${left ? "left-[62%]" : "right-[62%]"}`} />
        <Bat className={`absolute -top-1 w-7 ${left ? "left-[92%]" : "right-[92%]"}`} style={{ animationDelay: "-0.9s" }} />
        <div className={`ghost-bob ${left ? "" : "-scale-x-100"}`}>
          <WitchGhost />
        </div>
        {/* Speech bubble toward the middle of the screen. */}
        <div
          className={`peek-bubble absolute top-[8%] w-[13.5rem] rounded-[1.4rem] border-[3px] border-ink bg-paper px-4 py-3 text-ink ${
            left ? "left-[88%]" : "right-[88%]"
          }`}
        >
          <span
            className={`absolute top-6 size-4 rotate-45 border-ink bg-paper ${
              left ? "-left-[10px] border-b-[3px] border-l-[3px]" : "-right-[10px] border-r-[3px] border-t-[3px]"
            }`}
            aria-hidden
          />
          <p className="horror text-[1.35rem] leading-none tracking-wide">Downloaded!</p>
          <p className="horror mt-1.5 text-[15px] leading-tight tracking-wider text-ink/70">
            Safe in your downloads. Trick or tweet?
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
