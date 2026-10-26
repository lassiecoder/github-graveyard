import { ImageResponse } from "next/og";
import { getGraveyard } from "@/lib/github";
import { GraveCard, OG_CACHE, ogFonts } from "@/lib/og";
import { HomeCard } from "@/lib/og-fallback";

export async function GET(_req: Request, ctx: RouteContext<"/api/og/[username]/[repo]">) {
  const { username, repo } = await ctx.params;
  const res = await getGraveyard(username);
  const grave = res.ok ? res.data.graves.find((g) => g.name.toLowerCase() === decodeURIComponent(repo).toLowerCase()) : undefined;

  if (!res.ok || !grave) {
    return new ImageResponse(<HomeCard />, { fonts: ogFonts, headers: { "Cache-Control": "public, max-age=60" } });
  }
  return new ImageResponse(<GraveCard grave={grave} colorIndex={res.data.graves.indexOf(grave)} />, { fonts: ogFonts, headers: OG_CACHE });
}
