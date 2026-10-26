"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";

type Floater = { id: number; x: number; y: number };

// Press F to pay respects. Pure easter egg, nothing is stored.
export function PayRespects() {
  const [count, setCount] = useState(0);
  const [floaters, setFloaters] = useState<Floater[]>([]);

  useEffect(() => {
    let id = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "f" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, [contenteditable]")) return;
      const f = { id: id++, x: 10 + Math.random() * 80, y: 55 + Math.random() * 30 };
      setCount((c) => c + 1);
      track("pay_respects");
      setFloaters((fs) => [...fs.slice(-20), f]);
      setTimeout(() => setFloaters((fs) => fs.filter((x) => x.id !== f.id)), 1700);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {floaters.map((f) => (
        <span key={f.id} className="respect text-5xl" style={{ left: `${f.x}vw`, top: `${f.y}vh` }} aria-hidden>
          F
        </span>
      ))}
      <p className="hidden text-sm font-semibold text-haze sm:block" aria-live="polite">
        {count ? `Respects paid: ${count}` : "Press F to pay respects"}
      </p>
    </>
  );
}
