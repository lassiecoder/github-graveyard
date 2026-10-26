"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Ghost } from "@/components/Decor";
import { TopBar } from "@/components/TopBar";
import { track } from "@/lib/analytics";

// A new deploy can replace the JS chunks a still-open page expects. Reloading
// once picks up the new build; the session flag stops a reload loop.
function isStaleBuild(error: unknown) {
  const text = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  return /ChunkLoadError|Loading chunk|Failed to load chunk|Failed to fetch dynamically imported module/i.test(text);
}

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    const description =
      error instanceof Error
        ? `${error.name}: ${error.message}${"digest" in error && error.digest ? ` (${error.digest})` : ""}`
        : String(error);
    // Recorded in Firebase Analytics so crashes are visible after Vercel's
    // short Hobby log window has passed.
    track("exception", { description: description.slice(0, 150), page: location.pathname, fatal: true });

    if (isStaleBuild(error)) {
      try {
        if (!sessionStorage.getItem("gg:reloaded")) {
          sessionStorage.setItem("gg:reloaded", "1");
          location.reload();
        }
      } catch {}
    }
  }, [error]);

  return (
    <section className="dusk grain flex flex-1 flex-col overflow-hidden">
      <TopBar />
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <Ghost color="#a4adb2" className="float w-24" />
        <h1 className="horror mt-6 text-[clamp(3rem,11vw,5rem)] uppercase">The grave caved in</h1>
        <p className="mt-4 text-lg font-medium text-ink/80">
          Something went wrong digging this one up. Give it another go.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button onClick={() => retry()} className="btn-ink rounded-full px-6 py-3.5 font-bold">
            Dig again
          </button>
          <Link href="/" className="btn-paper rounded-full px-5 py-3.5 font-semibold">
            Back to the gates
          </Link>
        </div>
      </div>
    </section>
  );
}
