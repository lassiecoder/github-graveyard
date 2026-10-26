"use client";

import { useEffect, useRef } from "react";

// Replaces the arrow with a little ghost on mouse/trackpad devices. The top of
// its head is the click point, so it tracks the pointer exactly (no easing);
// only the lean and the hover swell are animated. Text fields keep the normal
// I-beam. Touch devices and reduced-motion users keep the system cursor.
const HOT_X = 13;
const HOT_Y = 2;
const INTERACTIVE = "a, button, label, summary, select, [role='button']";
const TEXT = "input, textarea, [contenteditable]";

export function GhostCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!matchMedia("(pointer: fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    root.classList.add("ghost-cursor");

    let x = -100;
    let y = -100;
    let lean = 0;
    let lastX = x;
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as Element | null;
      el.dataset.state = t?.closest(TEXT) ? "text" : t?.closest(INTERACTIVE) ? "hover" : "";
    };
    const onLeave = () => (el.dataset.state = "away");
    const onDown = () => el.classList.add("pressed");
    const onUp = () => el.classList.remove("pressed");

    const tick = () => {
      lean += (Math.max(-18, Math.min(18, (x - lastX) * 1.5)) - lean) * 0.2;
      lastX = x;
      el.style.transform = `translate(${x - HOT_X}px, ${y - HOT_Y}px) rotate(${lean.toFixed(2)}deg)`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    root.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove("ghost-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden data-state="away" className="ghost-pointer pointer-events-none fixed left-0 top-0 z-[100] will-change-transform">
      <svg width="26" height="32" viewBox="0 0 26 32" className="drop-shadow-[0_3px_6px_rgba(23,17,14,0.35)]">
        <path
          d="M13 1C6.4 1 2 6 2 12.5V30l3.7-3 3.6 3 3.7-3 3.7 3 3.6-3L24 30V12.5C24 6 19.6 1 13 1z"
          fill="#fffaf3"
          stroke="#17110e"
          strokeOpacity=".25"
        />
        <circle cx="9.5" cy="12.5" r="1.8" fill="#14111f" />
        <circle cx="16.5" cy="12.5" r="1.8" fill="#14111f" />
        <ellipse className="ghost-mouth" cx="13" cy="18.5" rx="2" ry="2.6" fill="#14111f" />
      </svg>
    </div>
  );
}
