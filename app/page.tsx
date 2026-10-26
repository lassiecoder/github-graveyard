import Link from "next/link";
import { Suspense } from "react";
import { DigForm } from "@/components/DigForm";
import { FEATURED, xHandleFor } from "@/lib/devs";
import { Tombstone } from "@/components/Tombstone";
import { TopBar } from "@/components/TopBar";
import { StarCard } from "@/components/StarCard";
import { SpiderNest } from "@/components/Crawler";
import { Cobweb, HangingSpider, NightEdge, NightGhosts, Sparkle, Swirl } from "@/components/Decor";
import { getGraveyard, type Grave } from "@/lib/github";


// Real graves from featured devs: each one's most-starred dead repo. Clicking
// opens their actual grave page (and puts their name in front of visitors).
const SHOWCASE = ["karpathy", "ThePrimeagen", "t3dotgg", "shadcn"];

// Hand-written stand-ins, shown while the real ones load or if GitHub is down.
const SPECIMENS: Grave[] = [
  {
    name: "todo-app-v3",
    description: null,
    url: "https://github.com",
    language: "TypeScript",
    stars: 2,
    born: "2022-02-01T00:00:00Z",
    died: "2023-03-14T00:00:00Z",
    lifespanDays: 406,
    archived: false,
    cause: "Replaced by its own sequel",
    epitaph: "TODO: write epitaph",
    shape: "round",
    tilt: -2,
  },
  {
    name: "uber-for-dogs",
    description: null,
    url: "https://github.com",
    language: "JavaScript",
    stars: 0,
    born: "2021-06-01T00:00:00Z",
    died: "2021-06-02T00:00:00Z",
    lifespanDays: 1,
    archived: false,
    cause: "Bought the domain. Spent the motivation.",
    epitaph: "Never deployed. Always loved.",
    shape: "gothic",
    tilt: 1,
  },
  {
    name: "rust-rewrite",
    description: null,
    url: "https://github.com",
    language: "Rust",
    stars: 14,
    born: "2023-01-10T00:00:00Z",
    died: "2023-02-01T00:00:00Z",
    lifespanDays: 22,
    archived: false,
    cause: "Fought the borrow checker. Lost.",
    epitaph: "It compiled. That was enough.",
    shape: "cross",
    tilt: 3,
  },
  {
    name: "gpt-wrapper-9000",
    description: null,
    url: "https://github.com",
    language: "Python",
    stars: 41,
    born: "2023-03-15T00:00:00Z",
    died: "2023-05-20T00:00:00Z",
    lifespanDays: 66,
    archived: false,
    cause: "Made obsolete by the next model release",
    epitaph: "Its last words: \"wip\"",
    shape: "slab",
    tilt: -1,
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="dusk grain overflow-hidden pb-28 sm:pb-36">
        <TopBar home />
        <HangingSpider className="right-[12%] top-0 hidden w-[78px] sm:block" style={{ height: "clamp(150px, 26vh, 260px)" }} />
        <SpiderNest />

        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-4 pt-14 text-center sm:pt-20">
          <p className="fade-up rounded-full bg-ink px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-peach sm:text-sm">
            A séance for side projects
          </p>

          <h1 className="fade-up relative mt-8 uppercase" style={{ animationDelay: "80ms" }}>
            <Sparkle size={30} className="twinkle absolute -left-2 top-[38%] text-white sm:-left-10" />
            <Sparkle size={18} className="twinkle absolute -left-6 top-[58%] text-white sm:-left-16" style={{ animationDelay: "-1s" }} />
            <Sparkle size={26} className="twinkle absolute -right-1 -top-4 text-white sm:-right-8" style={{ animationDelay: "-1.7s" }} />
            <span className="horror block text-[clamp(3.6rem,15vw,8.6rem)]">Every dev</span>
            <span className="script overlay-script -my-[0.2em] text-[clamp(3.4rem,13vw,7.5rem)] normal-case">has a secret</span>
            <span className="horror block text-[clamp(3.1rem,13.4vw,8.6rem)]">graveyard</span>
          </h1>

          <p className="fade-up mt-8 max-w-xl text-lg font-medium text-ink/80 sm:text-xl" style={{ animationDelay: "160ms" }}>
            Type a GitHub username. We exhume every abandoned repo, carve its headstone and rule on the cause of death.
          </p>

          <div className="fade-up mt-9 w-full max-w-[460px] -rotate-2" style={{ animationDelay: "240ms" }}>
            <DigForm autoFocus />
          </div>

          <div className="fade-up mt-7 flex max-w-2xl flex-wrap items-center justify-center gap-2" style={{ animationDelay: "320ms" }}>
            <span className="script mr-1 text-3xl text-white">or haunt</span>
            {FEATURED.map((d) => (
              <Link
                key={d.login}
                href={`/${d.login}`}
                prefetch={false}
                data-track="featured_click"
                data-track-login={d.login}
                data-track-source="haunt_chip"
                className="chip inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-sm font-semibold"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://github.com/${d.login}.png?size=48`} alt="" width={22} height={22} loading="lazy" className="size-[22px] rounded-full bg-ink/10" />
                @{d.x}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="night grain relative flex-1 pb-[260px] sm:pb-[320px]">
        <NightEdge />
        <SpiderNest night />
        <Swirl className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-night-swirl" />
        <Cobweb className="pointer-events-none absolute left-0 top-0 w-40 text-bone/15 sm:w-56" />
        <Sparkle size={12} className="twinkle absolute right-[12%] top-24 text-bone/70" />
        <Sparkle size={8} className="twinkle absolute left-[22%] top-56 text-bone/50" style={{ animationDelay: "-1.2s" }} />

        <div className="relative mx-auto w-full max-w-6xl px-4 pt-16 sm:pt-20">
          <h2 className="text-center uppercase">
            <span className="horror block text-[clamp(2.6rem,8vw,5rem)] text-bone">Famously</span>
            <span className="script -mt-[0.15em] block -rotate-6 text-[clamp(2.6rem,7vw,4.6rem)] normal-case text-mint">deceased</span>
          </h2>
          <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 min-[440px]:grid-cols-2 lg:grid-cols-4">
            <Suspense fallback={<Specimens />}>
              <FamousGraves />
            </Suspense>
          </div>
          <p className="mx-auto mt-16 max-w-md text-center text-sm text-haze">
            A grave is any repo you own (not a fork) that&apos;s archived or hasn&apos;t seen a push in 6+ months.
            Public data only. No login. We keep a count of digs, nothing about you.
          </p>
          <StarCard className="relative z-10 mt-16 -rotate-1" />
        </div>
        <NightGhosts />
      </section>
    </main>
  );
}

function Specimens() {
  return SPECIMENS.map((g, i) => <Tombstone key={g.name} grave={g} login="" index={i} actions={false} linked={false} />);
}

async function FamousGraves() {
  const results = await Promise.all(SHOWCASE.map(getGraveyard));
  const picks = results.flatMap((r) => (r.ok && r.data.graves[0] ? [{ login: r.data.login, grave: r.data.graves[0] }] : []));
  if (picks.length < SHOWCASE.length) return <Specimens />;
  return picks.map(({ login, grave }, i) => (
    <Tombstone key={login} grave={grave} login={login} index={i} actions={false} credit={xHandleFor(login) ?? login} />
  ));
}
