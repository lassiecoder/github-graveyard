import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/og";
import { HomeCard } from "@/lib/og-fallback";

export const alt = "GitHub Graveyard: every dev has a graveyard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(<HomeCard />, { ...size, fonts: ogFonts });
}
