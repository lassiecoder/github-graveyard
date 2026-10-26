"use client";

import { useState } from "react";

// The share-card preview. A fresh card takes a moment to render server-side,
// so until it arrives the frame shows a shimmering sketch of the card instead
// of an empty white box, then the real image fades in.
export function OgPreview({ src, alt }: { src: string; alt: string }) {
  const [state, setState] = useState<"loading" | "loaded" | "failed">("loading");

  return (
    <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-[18px] bg-peach">
      {state !== "loaded" && (
        <div className="og-sketch absolute inset-0 flex" aria-hidden>
          <div className="flex flex-1 flex-col gap-[6%] p-[5%]">
            <div className="flex items-center gap-[3%]">
              <span className="aspect-square w-[9%] rounded-full bg-paper/70" />
              <span className="h-[0.6em] w-1/2 rounded-full bg-ink/15" />
            </div>
            <span className="h-[18%] w-4/5 rounded-xl bg-ink/20" />
            <span className="h-[9%] w-3/5 rounded-full bg-paper/60" />
            <div className="mt-auto flex gap-[4%]">
              <span className="h-[1.6em] w-1/4 rounded-lg bg-paper/70" />
              <span className="h-[1.6em] w-1/3 rounded-lg bg-paper/70" />
            </div>
          </div>
          <div className="m-[2.6%] flex w-[40%] items-end justify-center gap-[5%] rounded-[1.4rem] bg-night p-[5%]">
            <span className="h-[60%] w-[28%] rounded-t-full bg-mint/40" />
            <span className="h-[75%] w-[28%] rounded-t-full bg-mist/40" />
            <span className="h-[55%] w-[28%] rounded-t-xl bg-pumpkin/40" />
          </div>
          <p className="script absolute inset-x-0 bottom-[6%] text-center text-2xl text-white">
            {state === "failed" ? "the spirits dropped your card" : "carving your card…"}
          </p>
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        // A cached card can finish before hydration, so check on attach too.
        ref={(img) => {
          if (img?.complete && img.naturalWidth > 0) setState("loaded");
        }}
        src={src}
        alt={alt}
        width={1200}
        height={630}
        fetchPriority="high"
        onLoad={() => setState("loaded")}
        onError={() => setState("failed")}
        className="relative block h-auto w-full transition-opacity duration-500"
        style={{ opacity: state === "loaded" ? 1 : 0 }}
      />
    </div>
  );
}
