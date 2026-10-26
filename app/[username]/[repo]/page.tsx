import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Digging } from "@/components/Digging";
import { Tombstone } from "@/components/Tombstone";
import { TopBar } from "@/components/TopBar";
import { Ghost, NightEdge, Sparkle, Swirl } from "@/components/Decor";
import { getGraveyard } from "@/lib/github";
import { lifespanLabel, year } from "@/lib/format";
import { graveTweet, graveUrl, xIntent } from "@/lib/share";
import { ogGraveUrl, SITE_NAME } from "@/lib/site";

type Props = PageProps<"/[username]/[repo]">;

async function find(params: Props["params"]) {
  const { username, repo } = await params;
  const res = await getGraveyard(username);
  if (!res.ok) return { username, repo, res, grave: undefined };
  const name = decodeURIComponent(repo).toLowerCase();
  return { username, repo, res, grave: res.data.graves.find((g) => g.name.toLowerCase() === name) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, repo, res, grave } = await find(params);
  const login = res.ok ? res.data.login : username;
  const name = grave?.name ?? decodeURIComponent(repo);
  const title = `RIP ${name}`;
  const description = grave
    ? `Cause of death: ${grave.cause}. From ${login}'s GitHub graveyard.`
    : `From ${login}'s GitHub graveyard.`;
  const image = { url: ogGraveUrl(login, name), width: 1200, height: 630, alt: title };
  return {
    title,
    description,
    openGraph: { siteName: SITE_NAME, type: "website", title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function Page({ params }: Props) {
  return (
    <main className="flex flex-1 flex-col">
      <Suspense fallback={<Digging />}>
        <GraveView params={params} />
      </Suspense>
    </main>
  );
}

async function GraveView({ params }: { params: Props["params"] }) {
  const { username, repo, res, grave } = await find(params);
  const login = res.ok ? res.data.login : username;

  if (!grave) {
    return (
      <section className="dusk grain flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <div className="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
          <Ghost color="#b7ef9e" className="float w-24" />
          <h1 className="horror mt-6 text-[clamp(3rem,11vw,5rem)] uppercase">It&apos;s alive!</h1>
          <p className="mt-4 text-lg font-medium text-ink/80">
            {res.ok
              ? `We couldn't find “${decodeURIComponent(repo)}” among ${login}'s dead. Either it's still breathing, or it never existed.`
              : "The spirits couldn't reach GitHub just now. Try again in a minute."}
          </p>
          <Link href={`/${login}`} className="btn-ink mt-10 rounded-full px-6 py-3.5 font-bold">
            See the whole graveyard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="dusk grain overflow-hidden pb-20 sm:pb-28">
        <TopBar />
        <Sparkle size={24} className="twinkle absolute right-[10%] top-32 text-white" />
        <div className="fade-up relative mx-auto w-full max-w-4xl px-4 pt-12 text-center sm:pt-16">
          <p className="script text-4xl text-white sm:text-5xl">here lies</p>
          <h1 className="horror mt-2 break-words text-[clamp(3rem,10vw,6.4rem)] [overflow-wrap:anywhere]">{grave.name}</h1>
          <p className="mt-4 font-mono text-sm font-medium text-ink/70">
            {year(grave.born)} — {year(grave.died)} · lived {lifespanLabel(grave.lifespanDays)}
          </p>
          {grave.description && <p className="mx-auto mt-3 max-w-xl text-base font-medium text-ink/70">“{grave.description}”</p>}
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-ink/60">Cause of death</p>
          <p className="display mx-auto mt-2 max-w-2xl text-[clamp(1.8rem,5vw,2.8rem)] italic leading-[1.1]! tracking-[-0.01em]!">{grave.cause}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-2">
            <a
              href={xIntent(graveTweet(login, grave), graveUrl(login, grave.name))}
              data-track="share"
              data-track-method="x"
              data-track-content_type="grave"
              data-track-item_id={`${login}/${grave.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ink rounded-full px-6 py-3.5 font-bold"
            >
              Post this RIP on 𝕏
            </a>
            <a href={grave.url} target="_blank" rel="noopener noreferrer" data-track="resurrect_click" data-track-item_id={`${login}/${grave.name}`} className="btn-paper rounded-full px-5 py-3.5 text-sm font-semibold">
              Attempt resurrection ↗
            </a>
          </div>
        </div>
      </section>
      <section className="night grain relative flex-1 pb-24">
        <NightEdge />
        <Swirl className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-night-swirl" />
        <div className="relative mx-auto w-full max-w-[420px] px-4 pt-24">
          <Tombstone grave={grave} login={login} size="lg" actions={false} position={res.ok ? res.data.graves.indexOf(grave) : 0} />
        </div>
        <div className="mt-14 text-center">
          <Link href={`/${login}`} className="chip inline-block rounded-full px-5 py-2.5 text-sm font-semibold">
            ← the rest of @{login}&apos;s graveyard
          </Link>
        </div>
      </section>
    </>
  );
}
