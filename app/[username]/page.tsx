import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DigForm } from "@/components/DigForm";
import { Digging } from "@/components/Digging";
import { GraveGrid } from "@/components/GraveGrid";
import { PayRespects } from "@/components/PayRespects";
import { ShareBar } from "@/components/ShareBar";
import { TopBar } from "@/components/TopBar";
import { StarCard } from "@/components/StarCard";
import { CrawlingSpider } from "@/components/Crawler";
import { Cobweb, Ghost, NightEdge, NightGhosts, Sparkle, Swirl } from "@/components/Decor";
import { getGraveyard } from "@/lib/github";
import { lifespanLabel, monthYear } from "@/lib/format";
import { graveyardTweet, graveyardUrl, xIntent } from "@/lib/share";
import { ogCardUrl, SITE_NAME } from "@/lib/site";
import { OgPreview } from "@/components/OgPreview";

export async function generateMetadata({ params }: PageProps<"/[username]">): Promise<Metadata> {
  const { username } = await params;
  const res = await getGraveyard(username);
  const login = res.ok ? res.data.login : username;
  const title = `${login}'s GitHub Graveyard`;
  const description = res.ok
    ? `${res.data.graves.length} abandoned side projects. Average lifespan: ${lifespanLabel(res.data.avgLifespanDays)}. Rank: ${res.data.title.rank}.`
    : "Dig up the dead side projects of any GitHub user.";
  const image = { url: ogCardUrl(login), width: 1200, height: 630, alt: title };
  return {
    title,
    description,
    alternates: { canonical: `/${login}` },
    openGraph: { siteName: SITE_NAME, type: "website", title, description, url: `/${login}`, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function Page({ params }: PageProps<"/[username]">) {
  return (
    <main className="flex flex-1 flex-col">
      <Suspense fallback={<Digging />}>
        <GraveyardView params={params} />
      </Suspense>
    </main>
  );
}

function Stat({ value, label, tilt }: { value: string; label: string; tilt: number }) {
  // "22 months" → big "22", small "months", so durations fit a narrow card.
  const [, num = value, unit] = value.match(/^(<?[\d.,]+) (.+)$/) ?? [];
  return (
    <div className="sticker min-w-0 px-4 py-3.5" style={{ rotate: `${tilt}deg` }}>
      <div className="display whitespace-nowrap text-2xl leading-none! tracking-[-0.02em]! sm:text-[1.7rem]">
        {num}
        {unit && <span className="ml-1 font-sans text-sm font-bold tracking-normal">{unit}</span>}
      </div>
      <div className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink/55">{label}</div>
    </div>
  );
}

async function GraveyardView({ params }: { params: PageProps<"/[username]">["params"] }) {
  const { username } = await params;
  const res = await getGraveyard(username);

  if (!res.ok) return <Unearthly reason={res.reason} login={username} />;

  const g = res.data;
  const url = graveyardUrl(g.login);
  const n = g.graves.length;

  return (
    <>
      <section className="dusk grain overflow-hidden pb-24 sm:pb-32">
        <TopBar />
        <CrawlingSpider path="M1080 160C800 40 620 340 420 220S120 400 -80 300" size={40} delay={1500} />
        <CrawlingSpider path="M-80 700C240 620 520 780 760 680S980 560 1080 700" size={26} speed={1.3} delay={4500} className="text-ink hidden sm:block" />
        <Sparkle size={26} className="twinkle absolute right-[8%] top-28 text-white" />
        <Sparkle size={14} className="twinkle absolute left-[46%] top-16 text-white" style={{ animationDelay: "-1.3s" }} />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-10 sm:pt-14 lg:grid-cols-[1.05fr_1fr]">
          <div className="fade-up">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${g.avatar}${g.avatar.includes("?") ? "&" : "?"}s=160`}
                alt=""
                width={64}
                height={64}
                className="size-14 rounded-full border-[3px] border-paper shadow-lg sm:size-16"
              />
              <p className="text-base font-semibold text-ink/75 sm:text-lg">Here lie the side projects of</p>
            </div>
            <h1 className="mt-5">
              <span className="horror block break-words text-[clamp(3rem,10vw,6.4rem)] [overflow-wrap:anywhere]">{g.login}</span>
              <span className="script overlay-script -mt-[0.1em] ml-[4%] text-[clamp(2.6rem,7.5vw,4.6rem)]">{g.title.rank}</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg font-medium text-ink/80">{g.title.blurb}</p>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat value={String(n)} label="Buried" tilt={-2} />
              <Stat value={String(g.alive)} label="Survivors" tilt={1.5} />
              <Stat value={n ? lifespanLabel(g.avgLifespanDays) : "—"} label="Avg lifespan" tilt={-1} />
              <Stat value={g.totalMourners.toLocaleString("en-US")} label="Mourners ★" tilt={2} />
            </div>

            <div className="mt-8">
              <ShareBar
                login={g.login}
                url={url}
                cardUrl={ogCardUrl(g.login, "portrait")}
                mineIntent={xIntent(graveyardTweet(g, true), url)}
                theirsIntent={xIntent(graveyardTweet(g, false), url)}
              />
            </div>
          </div>

          <figure className="fade-up relative hidden lg:block" style={{ animationDelay: "150ms" }}>
            <div className="rotate-2 rounded-[26px] bg-paper p-2.5 shadow-[0_30px_60px_-24px_rgba(110,40,0,.6)]">
              <OgPreview src={ogCardUrl(g.login)} alt={`Share card for ${g.login}'s graveyard`} />
            </div>
            <figcaption className="script mt-5 flex items-center justify-center gap-2 text-3xl text-white">
              <svg width="46" height="30" viewBox="0 0 46 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M44 26C30 28 14 22 6 6M6 6l-2 9M6 6l8 4" />
              </svg>
              how your post will look on X
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="night grain relative flex-1 pb-[240px] sm:pb-[300px]">
        <NightEdge />
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <CrawlingSpider path="M1080 300C800 200 620 420 400 340S120 200 -80 320" size={34} delay={3000} className="text-bone/60" />
        </div>
        <Swirl className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-night-swirl" />
        <Cobweb className="pointer-events-none absolute left-0 top-0 w-40 text-bone/15 sm:w-56" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pt-14">
          {n ? (
            <>
              <h2 className="text-center">
                <span className="horror block text-[clamp(2.6rem,8vw,4.6rem)] uppercase text-bone">
                  {n} {n === 1 ? "grave" : "graves"}
                </span>
                {g.oldestGrave && (
                  <span className="script -mt-[0.1em] block -rotate-6 text-[clamp(2.2rem,6vw,3.6rem)] text-mint">
                    first fell {monthYear(g.oldestGrave.died)}
                  </span>
                )}
              </h2>
              <div className="mt-20">
                <GraveGrid graves={g.graves} login={g.login} />
              </div>
              <div className="mt-16 flex justify-center">
                <PayRespects />
              </div>
            </>
          ) : (
            <div className="mx-auto max-w-lg text-center">
              <Ghost color="#b7ef9e" className="float mx-auto w-28" />
              <p className="horror mt-6 text-4xl leading-tight! text-bone">Not a single grave.</p>
              <p className="mt-3 text-lg text-haze">Every repo is alive and kicking. We don&apos;t trust it, but we respect it.</p>
            </div>
          )}
          <RoastAFriend />
          <StarCard className="relative z-10 mt-20 -rotate-1" />
        </div>
        <NightGhosts />
      </section>
    </>
  );
}

function RoastAFriend() {
  return (
    <section className="mx-auto mt-24 w-full max-w-md text-center">
      <h3 className="uppercase">
        <span className="horror block text-4xl text-bone sm:text-5xl">Now roast</span>
        <span className="script -mt-1 block -rotate-6 text-5xl normal-case text-mint sm:text-6xl">a friend</span>
      </h3>
      <DigForm variant="friend" className="mt-8 rotate-1" />
      <p className="mt-6 text-xs text-haze">
        Graves = repos you own (not forks) that are archived or have had no push in 6+ months. Data refreshes hourly.
      </p>
    </section>
  );
}

function Unearthly({ reason, login }: { reason: "not-found" | "rate-limited" | "error"; login: string }) {
  const copy = {
    "not-found": {
      title: "No such soul",
      body: `There's no GitHub user called “${login}”. Either they never existed, or they've been fully exorcised.`,
    },
    "rate-limited": {
      title: "Crypt's full",
      body: "Too many people are digging right now and GitHub has asked us to stop shovelling. Try again in a minute.",
    },
    error: {
      title: "Restless spirits",
      body: "Something went wrong while talking to GitHub. Give it a moment and try again.",
    },
  }[reason];

  return (
    <section className="dusk grain flex flex-1 flex-col overflow-hidden">
      <TopBar />
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <Ghost color="#fffaf3" className="float w-24" />
        <h1 className="horror mt-6 text-[clamp(3rem,11vw,5rem)] uppercase">{copy.title}</h1>
        <p className="mt-4 text-lg font-medium text-ink/80">{copy.body}</p>
        <DigForm autoFocus className="mt-10 -rotate-1" />
        <Link href="/" className="mt-6 text-sm font-semibold underline-offset-4 hover:underline">← back to the gates</Link>
      </div>
    </section>
  );
}
