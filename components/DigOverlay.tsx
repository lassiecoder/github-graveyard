"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ogCardUrl } from "@/lib/site";
import { Digging } from "./Digging";

// Shown the moment someone hits "Dig it up", so the digging skeleton plays on
// every dig, even when the graveyard is cached and would otherwise appear
// instantly. Lives in the root layout so it survives the route change, stays
// up for at least one full dig, then fades once the new page has rendered.

export const DIG_EVENT = "gg:dig";

const MIN_MS = 1800;
const MAX_MS = 15000;
const FADE_MS = 350;

// Share cards take a second or two to render on a cold server. Request them
// as early as possible (on dig, or on hovering a featured dev) so they're
// ready, or nearly, by the time the graveyard page shows them.
// Images are kept referenced so the browser finishes (and caches) each one.
const warmed = new Map<string, HTMLImageElement>();

export function warmCards(login: string, withPortrait = true) {
  const urls = withPortrait ? [ogCardUrl(login), ogCardUrl(login, "portrait")] : [ogCardUrl(login)];
  for (const url of urls) {
    if (warmed.has(url)) continue;
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    warmed.set(url, img);
  }
}

export function startDig(login: string) {
  warmCards(login);
  window.dispatchEvent(new CustomEvent<string>(DIG_EVENT, { detail: login }));
}

type Dig = { login: string; startedAt: number; leaving: boolean };

export function DigOverlay() {
  const pathname = usePathname();
  const [dig, setDig] = useState<Dig | null>(null);

  useEffect(() => {
    const onDig = (e: Event) =>
      setDig({ login: (e as CustomEvent<string>).detail, startedAt: performance.now(), leaving: false });
    // Links marked data-og-warm="<login>" (featured devs) warm on hover/focus.
    const onHover = (e: Event) => {
      const login = (e.target as Element | null)?.closest<HTMLElement>("[data-og-warm]")?.dataset.ogWarm;
      if (login) warmCards(login, false);
    };
    window.addEventListener(DIG_EVENT, onDig);
    document.addEventListener("pointerover", onHover);
    document.addEventListener("focusin", onHover);
    return () => {
      window.removeEventListener(DIG_EVENT, onDig);
      document.removeEventListener("pointerover", onHover);
      document.removeEventListener("focusin", onHover);
    };
  }, []);

  // Leave once we've landed on the dug-up graveyard and one dig has played
  // (or after MAX_MS, in case navigation never completes).
  useEffect(() => {
    if (!dig || dig.leaving) return;
    const arrived = decodeURIComponent(pathname.split("/")[1] ?? "").toLowerCase() === dig.login.toLowerCase();
    const elapsed = performance.now() - dig.startedAt;
    const wait = arrived ? Math.max(0, MIN_MS - elapsed) : Math.max(0, MAX_MS - elapsed);
    const t = setTimeout(() => setDig((d) => (d === dig ? { ...d, leaving: true } : d)), wait);
    return () => clearTimeout(t);
  }, [dig, pathname]);

  useEffect(() => {
    if (!dig?.leaving) return;
    const t = setTimeout(() => setDig((d) => (d === dig ? null : d)), FADE_MS);
    return () => clearTimeout(t);
  }, [dig]);

  if (!dig) return null;
  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col overflow-y-auto transition-opacity ease-out"
      style={{ opacity: dig.leaving ? 0 : 1, transitionDuration: `${FADE_MS}ms` }}
    >
      <Digging login={dig.login} />
    </div>
  );
}
