import { ImageResponse } from "next/og";
import { getGraveyard } from "@/lib/github";
import { LandscapeCard, OG_CACHE, PortraitCard, ogFonts } from "@/lib/og";
import { HomeCard } from "@/lib/og-fallback";

export async function GET(req: Request, ctx: RouteContext<"/api/og/[username]">) {
  const { username } = await ctx.params;
  const portrait = new URL(req.url).searchParams.get("format") === "portrait";
  const size = portrait ? { width: 1080, height: 1350 } : { width: 1200, height: 630 };
  const res = await getGraveyard(username);

  if (!res.ok) {
    return new ImageResponse(<HomeCard />, { ...size, fonts: ogFonts, headers: { "Cache-Control": "public, max-age=60" } });
  }
  return new ImageResponse(portrait ? <PortraitCard g={res.data} /> : <LandscapeCard g={res.data} />, {
    ...size,
    fonts: ogFonts,
    headers: OG_CACHE,
  });
}
