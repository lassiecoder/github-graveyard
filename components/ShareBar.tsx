"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { ME_KEY } from "./DigForm";
import { PeekGhost, type Peek } from "./PeekGhost";
import { SpookyToast, type Toast } from "./SpookyToast";
import { StableLabel } from "./StableLabel";


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
  const [toast, setToast] = useState<Toast | null>(null);
  const clearToast = useCallback(() => setToast(null), []);
  const notify = (t: Omit<Toast, "id">) => setToast({ ...t, id: Date.now() });

  // Fetch the portrait card once the page is idle, so "Download" (and
  // "Share image" on phones) is instant instead of waiting on a cold render.
  useEffect(() => {
    const warm = () => {
      const img = new Image();
      img.src = cardUrl;
    };
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(warm, { timeout: 2500 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(warm, 1200);
    return () => clearTimeout(t);
  }, [cardUrl]);
  const [downloading, setDownloading] = useState(false);
  const [peek, setPeek] = useState<Peek | null>(null);
  const clearPeek = useCallback(() => setPeek(null), []);

  async function copy() {
    try {
      // The full ready-to-post caption, ending with the link, so it works
      // pasted anywhere (X, Slack, group chats), not just a bare URL.
      await navigator.clipboard.writeText(caption());
      notify({ title: "Link exhumed!", body: "Paste it anywhere to haunt your friends." });
    } catch {
      notify({ tone: "fail", title: "The spirits refused", body: "Couldn't copy the link. Grab it from the address bar." });
    }
  }

  // Pasting the PNG straight into X's composer gets the full-size card in the
  // feed instead of a link preview.
  // The ready-to-post caption: same text and link as the X button.
  function caption() {
    const params = new URL(mine ? mineIntent : theirsIntent).searchParams;
    return `${params.get("text") ?? ""}\n${params.get("url") ?? url}`;
  }

  // Fetch the card first so the button can say "Downloading…" while it
  // renders, then save it and send the ghost to confirm. The link's href
  // stays as the no-JS fallback.
  async function download(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(cardUrl);
      if (!res.ok) throw new Error(String(res.status));
      const href = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = href;
      a.download = `${login}-graveyard.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 10_000);
      setPeek({ id: Date.now(), side: Math.random() < 0.5 ? "left" : "right" });
    } catch {
      notify({ tone: "fail", title: "The spirits refused", body: "Couldn't download the card. Try again in a moment." });
    }
    setDownloading(false);
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
          <StableLabel labels={["Roast them on X", "Post my graveyard"]} active={mine ? 1 : 0} />
        </a>
        {canShareFile ? (
          <button onClick={shareImage} data-track="share" data-track-method="native_share" data-track-content_type="graveyard_image" data-track-item_id={login} className="btn-paper rounded-full px-5 py-3.5 text-sm font-semibold">
            Share image
          </button>
        ) : (
          <>
            <a href={cardUrl} download={`${login}-graveyard.png`} onClick={download} aria-busy={downloading} data-track="share" data-track-method="download_image" data-track-content_type="graveyard_image" data-track-item_id={login} className="btn-paper rounded-full px-5 py-3.5 text-sm font-semibold">
              <StableLabel labels={["Download", "Downloading…"]} active={downloading ? 1 : 0} />
            </a>
          </>
        )}
        <button onClick={copy} data-track="share" data-track-method="copy_link" data-track-content_type="graveyard" data-track-item_id={login} className="btn-paper rounded-full px-5 py-3.5 text-sm font-semibold" aria-live="polite">
          Copy link
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
      <SpookyToast toast={toast} onDone={clearToast} />
      <PeekGhost peek={peek} onDone={clearPeek} />
    </div>
  );
}
