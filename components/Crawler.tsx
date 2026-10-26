"use client";

import { useEffect, useRef } from "react";
import { SpiderBody } from "./Decor";

const rand = (min: number, max: number) => min + Math.random() * (max - min);

// Paths are written in a 1000×1000 box spanning the parent (x: 0 = left edge,
// 1000 = right edge), so routes cover the whole width on any screen. Values
// past 0/1000 start and end off-screen. Only absolute M/C/S/L/Q/T pairs.
// Height is capped so a very tall section doesn't stretch a route into a
// long vertical slog.
function fitPath(d: string, w: number, h: number) {
  const sx = w / 1000;
  const sy = Math.min(h, 1000) / 1000;
  let i = 0;
  return d.replace(/-?\d*\.?\d+/g, (n) => {
    const v = parseFloat(n) * (i++ % 2 === 0 ? sx : sy);
    return v.toFixed(1);
  });
}

// Scuttles across its positioned parent like the spider in the reference reel:
// short darts, a pause to "think", another dart. Legs only move while walking.
export function CrawlingSpider({
  path,
  size = 64,
  speed = 1,
  delay = 0,
  className = "text-ink",
}: {
  path: string;
  size?: number;
  speed?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Little spiders take quicker, shorter steps.
  const scale = Math.sqrt(size / 64);
  const step = (0.13 * scale) / speed;

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let end = 0;
    const layout = () => {
      const fitted = fitPath(path, parent.clientWidth, parent.clientHeight);
      el.style.offsetPath = `path("${fitted}")`;
      probe.setAttribute("d", fitted);
      end = probe.getTotalLength();
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(parent);

    const topSpeed = 260 * scale * speed;
    const dart = () => rand(160, 460) * scale;

    let dist = 0;
    let goal = 0;
    let v = 0;
    let pauseUntil = performance.now() + 800 + delay;
    let last = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (now < pauseUntil) {
        el.classList.remove("walking");
      } else if (dist >= end) {
        // Off the far edge: wait a while, then come round again.
        dist = 0;
        goal = 0;
        el.style.offsetDistance = "0px";
        pauseUntil = now + rand(2500, 6000);
      } else if (dist >= goal && goal > 0) {
        pauseUntil = now + rand(200, 1000);
        goal = Math.min(end, dist + dart());
        v = 0;
      } else {
        if (goal === 0) goal = Math.min(end, dart());
        el.classList.add("walking");
        v = Math.min(v + 900 * scale * dt, topSpeed);
        dist = Math.min(goal, dist + v * dt);
        el.style.offsetDistance = `${dist}px`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [path, scale, speed, delay]);

  return (
    <div
      ref={ref}
      className={`spider-crawl pointer-events-none absolute left-0 top-0 ${className}`}
      style={{ width: size, height: size * 0.85, "--step": `${step.toFixed(3)}s` } as React.CSSProperties}
      aria-hidden
    >
      <svg viewBox="0 0 120 100" className="h-full w-full overflow-visible">
        <SpiderBody />
      </svg>
    </div>
  );
}

// A nest of spiders in assorted sizes, spread across the whole section:
// some cross left→right, some right→left, some climb or drop.
export function SpiderNest({ night = false }: { night?: boolean }) {
  if (night) {
    // Night sections can't clip (their wavy edge pokes out above), so clip here.
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <CrawlingSpider path="M1080 120C840 40 700 260 520 180S240 60 -80 200" size={30} speed={1.2} delay={2000} className="text-bone/70" />
        <CrawlingSpider path="M-80 600C200 680 340 500 560 560S860 700 1080 580" size={44} delay={5000} className="text-bone/60" />
        <CrawlingSpider path="M880 1080C800 800 980 640 860 420S700 160 780 -80" size={26} speed={1.3} delay={8000} className="text-bone/50 hidden sm:block" />
      </div>
    );
  }
  return (
    <>
      <CrawlingSpider path="M-80 260C150 80 300 480 480 340S760 60 900 260 1000 420 1080 300" size={64} />
      <CrawlingSpider path="M1080 90C820 170 700 30 520 110S200 40 -80 140" size={30} speed={1.25} delay={1500} />
      <CrawlingSpider path="M1080 460C900 380 820 600 700 520S620 300 760 220 980 160 1080 40" size={40} delay={3500} />
      <CrawlingSpider path="M120 -80C200 240 60 440 220 640S560 820 700 1080" size={44} delay={6000} className="text-ink hidden sm:block" />
      <CrawlingSpider path="M-80 780C220 700 420 840 640 740S920 640 1080 780" size={92} speed={0.8} delay={8000} className="text-ink hidden md:block" />
      <CrawlingSpider path="M960 1080C860 760 700 860 640 580S760 140 860 -80" size={22} speed={1.4} delay={2500} className="text-ink hidden sm:block" />
    </>
  );
}
