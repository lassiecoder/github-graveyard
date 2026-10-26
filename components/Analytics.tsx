"use client";

import { useEffect } from "react";
import { initAnalytics, track, type EventParams } from "@/lib/analytics";

// Starts Firebase Analytics and tracks clicks declaratively, so server
// components can opt in without becoming client components:
//   <a data-track="share" data-track-method="x" data-track-item_id="…">
// sends `share` with { method: "x", item_id: "…" }.
export function Analytics() {
  useEffect(() => {
    initAnalytics();
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-track]");
      if (!el?.dataset.track) return;
      const params: EventParams = {};
      for (const [key, value] of Object.entries(el.dataset)) {
        if (key === "track" || !key.startsWith("track") || value === undefined) continue;
        // data-track-item_id → dataset.trackItem_id → item_id
        const name = key.slice(5, 6).toLowerCase() + key.slice(6);
        params[name] = value === "true" ? true : value === "false" ? false : value;
      }
      track(el.dataset.track, params);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
