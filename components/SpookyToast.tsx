"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Ghost, SpiderBody } from "./Decor";

export type Toast = {
  id: number;
  title: string;
  body: string;
  tone?: "ok" | "fail";
};

// A small haunted confirmation that drops from the top on a spider's thread,
// sways while it lingers, then gets reeled back up. Pass a new `id` to show
// (or restart) it. Portaled to
// <body> because animated (transformed) ancestors would otherwise pin a
// position: fixed element to themselves instead of the viewport.
export function SpookyToast({
  toast,
  onDone,
}: {
  toast: Toast | null;
  onDone: () => void;
}) {
  // Which toast is on its way out; a new toast (new id) starts fresh.
  const [leavingId, setLeavingId] = useState<number | null>(null);
  const leaving = toast !== null && leavingId === toast.id;

  useEffect(() => {
    if (!toast) return;
    const out = setTimeout(() => setLeavingId(toast.id), 2600);
    const done = setTimeout(onDone, 3100);
    return () => {
      clearTimeout(out);
      clearTimeout(done);
    };
  }, [toast, onDone]);

  // Toasts only exist after a click, so this never runs during SSR.
  if (!toast) return null;
  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[85] flex justify-center px-4 pt-16"
      role="status"
      aria-live="polite"
    >
      <div
        key={toast.id}
        className={`spooky-toast relative max-w-full ${leaving ? "leaving" : ""}`}
      >
        {/* Silk thread up to the top edge, and the spider holding the card. */}
        <span
          className="toast-thread absolute bottom-full left-1/2 h-[100vh] w-px -translate-x-1/2"
          aria-hidden
        />
        <svg
          viewBox="0 0 120 100"
          className="toast-spider absolute -top-[18px] left-1/2 z-10 w-8 -translate-x-1/2 text-ink"
          aria-hidden
        >
          <SpiderBody />
        </svg>
        <div className="night flex items-center gap-3.5 rounded-2xl py-3.5 pl-4 pr-6 ring-1 ring-mint/35 shadow-[0_24px_50px_-16px_rgba(0,0,0,.7),0_0_28px_-6px_rgba(183,239,158,.45)]">
          <Ghost
            color={toast.tone === "fail" ? "#a4adb2" : "#b7ef9e"}
            className="w-9 shrink-0"
          />
          <div className="min-w-0 text-left">
            <p
              className={`horror text-[1.4rem] leading-none tracking-wide ${toast.tone === "fail" ? "text-mist" : "text-mint"}`}
            >
              {toast.title}
            </p>
            <p className="horror mt-1.5 text-[17px] leading-tight tracking-wider text-bone/75">{toast.body}</p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
