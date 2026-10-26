import { recordDig } from "@/lib/digs";
import { getGraveyard, USERNAME_RE } from "@/lib/github";

// Counts a dig from the "Dig it up" form. Only real GitHub users are counted,
// so the table can't be filled with junk; the lookup is the same cached call
// the graveyard page makes, so it's almost always a cache hit.
export async function POST(req: Request) {
  let login: unknown;
  try {
    ({ login } = await req.json());
  } catch {
    return new Response(null, { status: 400 });
  }
  if (typeof login !== "string" || !USERNAME_RE.test(login)) return new Response(null, { status: 400 });

  const res = await getGraveyard(login);
  if (!res.ok) return new Response(null, { status: res.reason === "not-found" ? 404 : 202 });

  try {
    await recordDig(res.data.login);
  } catch (e) {
    console.error("[digs] failed to record", e);
  }
  return new Response(null, { status: 204 });
}
