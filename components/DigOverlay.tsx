"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Digging } from "./Digging";

// Shown the moment someone hits "Dig it up", so the digging skeleton plays on
// every dig, even when the graveyard is cached and would otherwise appear
// instantly. Lives in the root layout so it survives the route change, stays
// up for at least one full dig, then fades once the new page has rendered.

export const DIG_EVENT = "gg:dig";

const MIN_MS = 1800;
const MAX_MS = 15000;
const FADE_MS = 350;

export function startDig(login: string) {
  window.dispatchEvent(new CustomEvent<string>(DIG_EVENT, { detail: login }));
}

type Dig = { login: string; startedAt: number; leaving: boolean };

export function DigOverlay() {
  const pathname = usePathname();
  const [dig, setDig] = useState<Dig | null>(null);

  useEffect(() => {
    const onDig = (e: Event) =>
      setDig({ login: (e as CustomEvent<string>).detail, startedAt: performance.now(), leaving: false });
    window.addEventListener(DIG_EVENT, onDig);
    return () => window.removeEventListener(DIG_EVENT, onDig);
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
