"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { HangingSpider, Sparkle } from "./Decor";
import { DiggingSkeleton } from "./DiggingSkeleton";
import { TopBar } from "./TopBar";

const STEPS = [
  "Locating the cemetery…",
  "Reading the last commit messages…",
  "Checking for a pulse (git push)…",
  "Interviewing the mourners (stargazers)…",
  "Determining cause of death…",
  "Carving the headstones…",
];

const noop = () => () => {};

// `login` is passed by DigOverlay (shown before the URL changes); as a route
// fallback it's read from the URL instead.
export function Digging({ login: target }: { login?: string } = {}) {
  // Read from the URL on the client: params aren't available in the static shell.
  const fromUrl = useSyncExternalStore(
    noop,
    () => decodeURIComponent(location.pathname.split("/")[1] ?? "") || undefined,
    () => undefined,
  );
  const login = target ?? fromUrl;
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 900);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="dusk grain flex flex-1 flex-col overflow-hidden">
      <TopBar />
      <HangingSpider className="right-[10%] top-0 w-[56px]" style={{ height: "30vh" }} />
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-24 text-center" role="status" aria-live="polite">
        <div className="relative">
          <Sparkle size={22} className="twinkle absolute -left-8 top-2 text-white" />
          <Sparkle size={14} className="twinkle absolute -right-6 top-10 text-white" style={{ animationDelay: "-1s" }} />
          <DiggingSkeleton className="w-52 sm:w-64" />
        </div>
        <p className="mt-6 uppercase">
          <span className="display block text-[clamp(2.6rem,9vw,4.6rem)]">Digging up</span>
          <span className="script overlay-script -mt-1 block break-all text-[clamp(2.6rem,9vw,4.4rem)] normal-case">
            {login ? `@${login}` : "the past"}
          </span>
        </p>
        <p key={step} className="fade-up mt-6 text-lg font-semibold text-ink/75">
          {STEPS[step]}
        </p>
      </div>
    </section>
  );
}
