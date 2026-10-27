import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// A real robots.txt. Without it, /robots.txt fell through to the [username]
// route and returned an HTML page, which can make X's crawler skip the card
// image. Everything is public, share cards included.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    host: SITE_URL,
  };
}
