"use client";

import { useState, useSyncExternalStore } from "react";
import { ME_KEY } from "./DigForm";

const noop = () => () => {};

function readMe() {
  try {
    return localStorage.getItem(ME_KEY);
  } catch {
    return null;
  }
}

// Only worth offering on phones, where the share sheet can hand the PNG to the X app.
function canShareFiles() {
  try {
    const probe = new File([""], "x.png", { type: "image/png" });
    return !!navigator.canShare?.({ files: [probe] }) && matchMedia("(pointer: coarse)").matches;
  } catch {
    return false;
  }
}

export function ShareBar({
  login,
  url,
  cardUrl,
  mineIntent,
  theirsIntent,
}: {
  login: string;
  url: string;
  cardUrl: string;
  mineIntent: string;
  theirsIntent: string;
}) {
  const storedMine = useSyncExternalStore(noop, () => readMe() === login.toLowerCase(), () => false);
  const canShareFile = useSyncExternalStore(noop, canShareFiles, () => false);
  const [override, setOverride] = useState<boolean | null>(null);
  const mine = override ?? storedMine;
  const [copied, setCopied] = useState(false);
  const [imageState, setImageState] = useState<"idle" | "copying" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  // Pasting the PNG straight into X's composer gets the full-size card in the
  // feed instead of a link preview.
  async function copyImage() {
    setImageState("copying");
    try {
      // Passing a promise keeps Safari's user-gesture requirement satisfied.
      const blob = fetch(cardUrl).then((r) => r.blob());
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setImageState("copied");
    } catch {
      setImageState("failed");
    }
    setTimeout(() => setImageState("idle"), 2200);
  }

  async function shareImage() {
    try {
      const blob = await fetch(cardUrl).then((r) => r.blob());
      const file = new File([blob], `${login}-graveyard.png`, { type: "image/png" });
      await navigator.share({ files: [file], text: `My GitHub graveyard 🪦 ${url}` });
    } catch {}
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={mine ? mineIntent : theirsIntent}
          data-track="share"
          data-track-method="x"
          data-track-content_type="graveyard"
          data-track-item_id={login}
          data-track-mine={String(mine)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ink inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-base font-bold"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          {mine ? "Post my graveyard" : "Roast them on X"}
        </a>
        {canShareFile ? (
          <button onClick={shareImage} data-track="share" data-track-method="native_share" data-track-content_type="graveyard_image" data-track-item_id={login} className="btn-paper rounded-full px-5 py-3.5 text-sm font-semibold">
            Share image
          </button>
        ) : (
          <>
            <button onClick={copyImage} data-track="share" data-track-method="copy_image" data-track-content_type="graveyard_image" data-track-item_id={login} className="btn-paper rounded-full px-5 py-3.5 text-sm font-semibold" aria-live="polite">
              {{ idle: "Copy image", copying: "Carving…", copied: "Copied. Paste in X ✓", failed: "Couldn't copy" }[imageState]}
            </button>
            <a href={cardUrl} download={`${login}-graveyard.png`} data-track="share" data-track-method="download_image" data-track-content_type="graveyard_image" data-track-item_id={login} className="btn-paper rounded-full px-5 py-3.5 text-sm font-semibold">
              Download
            </a>
          </>
        )}
        <button onClick={copy} data-track="share" data-track-method="copy_link" data-track-content_type="graveyard" data-track-item_id={login} className="btn-paper rounded-full px-5 py-3.5 text-sm font-semibold" aria-live="polite">
          {copied ? "Copied ✓" : "Copy link"}
        </button>
      </div>
      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-ink/70 select-none">
        <input
          type="checkbox"
          checked={mine}
          onChange={(e) => {
            setOverride(e.target.checked);
            try {
              if (e.target.checked) localStorage.setItem(ME_KEY, login.toLowerCase());
              else if (localStorage.getItem(ME_KEY) === login.toLowerCase()) localStorage.removeItem(ME_KEY);
            } catch {}
          }}
          className="size-4 accent-[var(--ink)]"
        />
        This is my graveyard
      </label>
    </div>
  );
}
