import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Bricolage_Grotesque, JetBrains_Mono, Playfair_Display, Sacramento } from "next/font/google";
import { GhostCursor } from "@/components/GhostCursor";
import { SvgDefs } from "@/components/Decor";
import { INTRO_SCRIPT, Intro } from "@/components/Intro";
import { DigOverlay } from "@/components/DigOverlay";
import { Analytics } from "@/components/Analytics";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "900"],
  style: ["normal", "italic"],
});

const sacramento = Sacramento({
  variable: "--font-sacramento",
  subsets: ["latin"],
  weight: "400",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const jbmono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const description =
  "Enter a GitHub username and get a tombstone for every abandoned side project. Cause of death included.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} · Dig up your dead side projects`, template: `%s · ${SITE_NAME}` },
  description,
  openGraph: { siteName: SITE_NAME, type: "website", description },
  twitter: { card: "summary_large_image", description },
};

export const viewport: Viewport = {
  themeColor: "#ffb07f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${sacramento.variable} ${bricolage.variable} ${jbmono.variable} antialiased`}
    >
      <head>
        {/* Picks the intro's direction and line before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      </head>
      <body className="min-h-dvh flex flex-col overflow-x-hidden">
        <SvgDefs />
        <Intro />
        {/* Reads the pathname, which must sit inside Suspense to keep pages prerenderable. */}
        <Suspense>
          <DigOverlay />
        </Suspense>
        <GhostCursor />
        <Analytics />
        {children}
      </body>
    </html>
  );
}
