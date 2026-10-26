"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AppIcon } from "./Decor";
import { startDig } from "./DigOverlay";
import { track } from "@/lib/analytics";
import { xHandleFor } from "@/lib/devs";

const USERNAME_RE = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export const ME_KEY = "gg:me";

// Accepts "octocat", "@octocat" or a pasted profile URL.
function parse(input: string) {
  const v = input.trim().replace(/^@/, "");
  const m = v.match(/github\.com\/([^/?#\s]+)/i);
  return (m ? m[1] : v).trim();
}

// Styled as a phone notification, after the "Are you ready for Halloween? Reply"
// card in the reference reel.
export function DigForm({
  variant = "self",
  autoFocus = false,
  className = "",
}: {
  variant?: "self" | "friend";
  autoFocus?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const login = parse(value);
    if (!USERNAME_RE.test(login)) {
      setError(login ? "That's not a GitHub username. Even ghosts have standards." : "Whose grave are we digging?");
      return;
    }
    setError("");
    // Remember who "you" are so share copy can say "my graveyard" vs "their graveyard".
    if (variant === "self") {
      try {
        localStorage.setItem(ME_KEY, login.toLowerCase());
      } catch {}
    }
    track("dig_graveyard", { login: login.toLowerCase(), form: variant, featured: !!xHandleFor(login) });
    // Count the dig (fire-and-forget; keepalive survives the navigation).
    fetch("/api/dig", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login }),
      keepalive: true,
    }).catch(() => {});
    startDig(login);
    startTransition(() => router.push(`/${login}`));
  }

  const self = variant === "self";
  const id = `gh-${variant}`;
  return (
    <form onSubmit={submit} className={`notify w-full p-4 text-left sm:p-5 ${className}`} noValidate>
      <div className="flex items-center gap-2.5">
        <AppIcon className="size-8" />
        <span className="text-sm font-bold">GitHub Graveyard</span>
        <span className="ml-auto text-xs text-ink/50">now</span>
      </div>
      <label htmlFor={id} className="mt-3 block text-lg font-semibold leading-snug sm:text-xl">
        {self ? "Are you ready to meet your dead repos?" : "Who else is hiding bodies?"}
      </label>
      <div className="mt-3 flex items-center gap-2 rounded-full bg-ink/[0.06] p-1.5 pl-4 ring-1 ring-ink/10 focus-within:ring-2 focus-within:ring-ink">
        <span className="hidden select-none font-mono text-sm text-ink/45 min-[400px]:block" aria-hidden>
          github.com/
        </span>
        <input
          id={id}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError("");
          }}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={self ? "your-username" : "a-friend"}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          className="min-w-0 flex-1 bg-transparent py-2 font-mono text-base text-ink outline-none placeholder:text-ink/30 focus-visible:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="btn-ink shrink-0 rounded-full px-5 py-2.5 text-sm font-bold disabled:opacity-70 sm:px-6"
        >
          {pending ? "Digging…" : self ? "Dig it up" : "Roast them"}
        </button>
      </div>
      <p id={`${id}-err`} role="alert" className="min-h-0 pl-4 text-sm font-medium text-pumpkin empty:hidden mt-2">
        {error}
      </p>
    </form>
  );
}
