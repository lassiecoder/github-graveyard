import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // .env uses bare Firebase names; expose them to the browser bundle under
  // public names. Firebase's web config is designed to be public.
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.API_KEYS ?? "",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.AUTH_DOMAIN ?? "",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.PROJECT_ID ?? "",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.STORAGE_BUCKET ?? "",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.MESSAGING_SENDER_ID ?? "",
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.APP_ID ?? "",
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.MEASUREMENT_ID ?? "",
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
