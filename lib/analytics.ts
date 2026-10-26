import type { Analytics } from "firebase/analytics";

// Firebase Analytics, loaded lazily after first render so it never weighs on
// page load. Only production builds send events; in development they're logged
// to the console instead so local testing doesn't pollute the reports.
// Page views (including client-side navigations) come from GA4's enhanced
// measurement, which is on by default for Firebase web streams.

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const LIVE = process.env.NODE_ENV === "production" && !!config.apiKey && !!config.measurementId;

export type EventParams = Record<string, string | number | boolean>;

let ready: Promise<Analytics | null> | null = null;

function load() {
  ready ??= (async () => {
    if (!LIVE) return null;
    const [{ getApps, initializeApp }, { getAnalytics, isSupported }] = await Promise.all([
      import("firebase/app"),
      import("firebase/analytics"),
    ]);
    // Blocked by ad blockers, cookies off, etc.: just don't track.
    if (!(await isSupported())) return null;
    return getAnalytics(getApps()[0] ?? initializeApp(config));
  })().catch(() => null);
  return ready;
}

export function initAnalytics() {
  void load();
}

export function track(name: string, params?: EventParams) {
  if (!LIVE) {
    if (process.env.NODE_ENV !== "production") console.debug("[analytics]", name, params ?? {});
    return;
  }
  void load().then(async (analytics) => {
    if (!analytics) return;
    const { logEvent } = await import("firebase/analytics");
    logEvent(analytics, name, params);
  });
}
