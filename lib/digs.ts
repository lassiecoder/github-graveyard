import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

// Server-only dig counter in Firestore: one doc per dug-up GitHub login,
// `digs/{login}` → { login, count, lastDugAt }. Nothing about the visitor is
// stored. Needs FIREBASE_SERVICE_ACCOUNT (the service account JSON); without
// it, recording is a silent no-op so local dev and previews keep working.

// Cached per env value, so fixing the key in .env takes effect on the dev
// server's env reload instead of the first failure sticking until a restart.
let cache: { raw: string | undefined; app: App | null } | undefined;

function adminApp() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (cache && cache.raw === raw) return cache.app;
  let app: App | null = null;
  if (raw) {
    try {
      const sa = JSON.parse(raw);
      // Keys pasted into env UIs often arrive with escaped newlines.
      if (typeof sa.private_key === "string") sa.private_key = sa.private_key.replace(/\\n/g, "\n");
      app = getApps()[0] ?? initializeApp({ credential: cert(sa) });
    } catch (e) {
      // A multi-line paste only gives .env its first line ("{"): keep it on one line.
      console.error("[digs] FIREBASE_SERVICE_ACCOUNT must be the service account JSON on a single line", e);
    }
  }
  cache = { raw, app };
  return app;
}

export async function recordDig(login: string) {
  const a = adminApp();
  if (!a) return false;
  await getFirestore(a)
    .collection("digs")
    .doc(login.toLowerCase())
    .set({ login, count: FieldValue.increment(1), lastDugAt: FieldValue.serverTimestamp() }, { merge: true });
  return true;
}
